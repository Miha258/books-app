import { Controller, Post, Body, Put, UseGuards, Param, Patch, Get, Req, UploadedFile, Res, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ResetPasswordDto } from './dto/resetPasswornd.dto';
import { SendResetMailDto } from './dto/sendResetMail.dto';
import { AdminGuard } from 'src/guards/isAdmin.guard';
import { join } from 'node:path';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { mediaFileFilter } from 'src/validators';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('user/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user (You need to be admin)' })
  @ApiResponse({ status: 200, description: 'Get one user' })
  async getUser(@Param('id') userId: string) {
    return await this.usersService.getUser(parseInt(userId))
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get me' })
  @ApiResponse({ status: 200, description: 'Get me' })
  async getMe(@Req() req) {
    return await this.usersService.getUser(req.user.userId)
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  async register(@Body() user: RegisterDto) {
    return await this.usersService.register(user);
  }
  
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged in.' })
  async login(@Body() { email, password }: LoginDto) {
    return await this.usersService.login(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', nullable: true, description: 'The first name of the user' },
        lastName: { type: 'string', nullable: true, description: 'The last name of the user' },
        profilePicture: { type: 'string', format: 'binary' },
        phoneNumber: { type: 'string', nullable: true, description: 'The phone number of the user' },
        questionsEmail: { type: 'string', format: 'email', nullable: true, description: 'The email address where the user receives questions' },
        instagram: { type: 'string', nullable: true, description: 'The Instagram username of the user' },
        questionCreationFrequency: { type: 'string', enum: ['day', 'week', 'month', 'year'], description: 'The frequency at which the user creates questions' },
        cardName: { type: 'string', nullable: true, description: 'The name on the user\'s card' },
        cardNumber: { type: 'integer', nullable: true, description: 'The card number of the user' },
        cardExpDate: { type: 'string', format: 'date', nullable: true, description: 'The expiration date of the user\'s card' },
        cardCvv: { type: 'integer', nullable: true, description: 'The CVV of the user\'s card' },
        role: { type: 'string', nullable: true, description: 'User`s role ("user" or "admin")' },
        activated: { type: 'boolean', default: false, description: 'Is user activated' },
        customerId: { type: 'string', nullable: true, description: 'Stripe customer id' },
        city: { type: 'string', nullable: true, description: 'The city of the shipping address' },
        countryCode: { type: 'string', nullable: true, description: 'The country code of the shipping address' },
        name: { type: 'string', nullable: true, description: 'The name of the recipient' },
        postcode: { type: 'string', nullable: true, description: 'The postcode of the shipping address' },
        stateCode: { type: 'string', nullable: true, description: 'The state code of the shipping address' },
        street1: { type: 'string', nullable: true, description: 'The first line of the street address' },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @UseInterceptors(FileInterceptor('profilePicture', {
    fileFilter: (req, file, cb) => mediaFileFilter(req, file, cb)
  }))
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.' })
  async updateProfile(@UploadedFile() profilePicture: Express.Multer.File, @Req() req, @Body() userData: User) {
    return await this.usersService.updateProfile(req.user.userId, userData, profilePicture);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('update-profile/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update user profile (You need to be admin)' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.' })
  async adminUpdateProfile(@UploadedFile() profilePicture: Express.Multer.File, @Param('id') userId: number, @Body() userData: User) {
    return await this.usersService.updateProfile(userId, userData, profilePicture, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'The password has been successfully changed.' })
  async changePassword(@Req() req, @Body() { newPassword }: ChangePasswordDto) {
    return await this.usersService.changePassword(req.user.userId, newPassword);
  }

  @Post('send-reset-password')
  @ApiOperation({ summary: 'Send reset password email' })
  @ApiResponse({ status: 200, description: 'Reset password email sent.' })
  async sendResetPassword(@Body() { email }: SendResetMailDto) {
    return await this.usersService.sendResetPassword(email);
  }

  @Patch('reset-password/:token')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'The password has been successfully reset.' })
  async resetPassword(@Param() { token }: { token: string }, @Body() { newPassword }: ResetPasswordDto) {
    return await this.usersService.resetPassword(token, newPassword);
  }
  
  @Get('avatar/:filename')
  @ApiOperation({ summary: 'Get source avatar image' })
  @ApiResponse({ status: 200, description: 'The avatar' })
  async getAvatar(@Res() res: Response, @Param('filename') filename: string)  {
    return res.sendFile(join(__dirname, '..', '..', 'files', 'avatar', filename))
  }
}

