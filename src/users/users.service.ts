import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from './dto/register.dto';
import { join } from 'node:path';
import * as fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService
  ) {}

  async getUser(id: number) {
    return await this.usersRepository.findOneBy({ id })
  }

  async findOne(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ email });
  }

  async isExist(id: number) {
    if (!await this.usersRepository.existsBy({ id })) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async register(user: RegisterDto): Promise<User> {
    const existingUser = await this.findOne(user.email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
    user.password = await bcrypt.hash(user.password, salt)
    const out = await this.usersRepository.save(user)

    delete out.password
    return out;
  }

  async updateProfile(id: number, userData: Partial<User>, file?: Express.Multer.File, isAdmin = false): Promise<User> {
    await this.isExist(id)
    
    delete userData.password
    if (!isAdmin) {
      delete userData.role, userData.activated
    }

    if (userData.questionCreationFrequency) {
      if (!(['day', 'week', 'month', 'year'].includes(userData.questionCreationFrequency))) {
        throw new HttpException("questionCreationFrequency must be: day, week, month or year", HttpStatus.BAD_REQUEST);
      }  
    }

    if (file) {
      if (userData.profilePicture && userData.profilePicture !== 'undefined') {
        const oldMediaPath = join(__dirname, '..', '..', userData.profilePicture)
        if (await fs.access(oldMediaPath).then(() => true).catch(() => false)) {
          await fs.unlink(oldMediaPath)
        }
      }

      const avatarFile = file.originalname
      const separatedAvatarFilename = avatarFile.split('.')
      userData.profilePicture = 'files/avatar/' + uuidv4() + "." + separatedAvatarFilename.pop()
      const uploadPath = join(__dirname, '..', '..', userData.profilePicture)
      const uploadBuff = file.buffer
      await fs.writeFile(uploadPath, uploadBuff)
    }

    try {
      await this.usersRepository.update(id, userData);
    } catch (e) {
      throw new HttpException(e.driverError.sqlMessage, HttpStatus.BAD_REQUEST)
    }
    
    return await this.usersRepository.findOneBy({ id });
  }

  async changePassword(id: number, newPassword: string, oldPassword?: string) {
    await this.isExist(id)
    const user = await this.usersRepository.findOneBy({ id })
    if (await this.validateUser(user.email, newPassword)) {
      throw new HttpException('Your current password is the same as new', HttpStatus.BAD_REQUEST)
    }

    if (oldPassword) {
      if (!await this.validateUser(user.email, oldPassword)) {
        throw new HttpException('Invalid old password.Try again', HttpStatus.BAD_REQUEST)
      }
    }
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return await this.usersRepository.update(id, { password: hashedPassword });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (user){
      if (user.role == 'admin') {
        return user
      }
      if (await bcrypt.compare(password, user.password)) {
        return user;
      }
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_LIFE
      }),
      ...payload
    }
  }

  async sendResetPassword(email: string) {
    const user = await this.findOne(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const token = this.jwtService.sign({ email: user.email, sub: user.id }, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    })

    const resetLink = `${process.env.ROOT_URL}/users/reset-password/${token}`
    return await this.mailService.sendMail({
      from: "APP",
      to: email,
      subject: "Reset password url",
      text: resetLink
    })
  }

  async resetPassword(token: string, newPassword: string) {
      let sub: number
      let email: string
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET
        })
        sub = (decoded as any).sub as number
        email = (decoded as any).email as string
      } catch (error) {
        throw new HttpException('Url has expired or invalid', HttpStatus.BAD_REQUEST);
      }

      if (await this.validateUser(email, newPassword)) {
        throw new HttpException('Your current password is the same as new', HttpStatus.BAD_REQUEST)
      }

      await this.changePassword(sub, newPassword)
      return { message: "Password changed successfully" };
  }

  async delete(id: number) { 
    return this.usersRepository.delete(id)
  }

  async createAdminUser() { 
    const adminExists = await this.findOne(process.env.ADMIN_EMAIL)
    if (!adminExists) {
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt)
      const adminUser = this.usersRepository.create({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });

      await this.usersRepository.save(adminUser)
      console.log('Admin user created')
    }
  }
}
