import { Controller, Post, Body, Put, UseGuards, Param, Patch, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ResetPasswordDto } from './dto/resetPasswornd.dto';
import { SendResetMailDto } from './dto/sendResetMail.dto';
import { AdminGuard } from 'src/guards/isAdmin.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user (You need to be admin)' })
  @ApiResponse({ status: 200, description: 'Get one user' })
  async getUser(@Param('id') userId: string) {
    return await this.usersService.getUser(parseInt(userId))
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.' })
  async updateProfile(@Req() req, @Body() userData: User) {
    return await this.usersService.updateProfile(req.user.userId, userData);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('update-profile/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin update user profile (You need to be admin)' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.' })
  async adminUpdateProfile(@Param('id') userId: string, @Body() userData: User) {
    return await this.usersService.updateProfile(parseInt(userId), userData, true);
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
}
