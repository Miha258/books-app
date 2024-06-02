import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService
  ) {}

  async getAll() {
    return await this.usersRepository.find()
  }

  async findOne(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ email });
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

  async updateProfile(id: number, userData: Partial<User>): Promise<User> {
    if (!(userData.questionCreationFrequency in ['day', 'week', 'month', 'year'])) {
      throw new HttpException('questionCreationFrequency must be: "day", "week", "month" or "year"', HttpStatus.UNAUTHORIZED);
    }
    
    await this.usersRepository.update(id, userData);
    return await this.usersRepository.findOneBy({id});
  }

  async changePassword(id: number, newPassword: string, oldPassword?: string) {
    const user = this.usersRepository.findOneBy({ id })
    if (await this.validateUser((await user).email, newPassword)) {
      throw new HttpException('Your current password is the same as new', HttpStatus.BAD_REQUEST)
    }

    if (oldPassword) {
      if (!await this.validateUser((await user).email, oldPassword)) {
        throw new HttpException('Invalid old password.Try again', HttpStatus.BAD_REQUEST)
      }
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT));
    return await this.usersRepository.update(id, { password: hashedPassword });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET
      }),
      ...payload
    };
  }

  async sendResetPassword(email: string) {
    const user = await this.findOne(email);
    if (!user) {
      throw new Error('User not found');
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
}
