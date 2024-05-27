import { Controller, Post, Body, Put, UseGuards, Request, Param, Patch, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  async getAll() {
    return await this.usersService.getAll();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  async register(@Body() user: User): Promise<User> {
    return await this.usersService.register(user);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged in.' })
  async login(@Body() { email, password }: { email: string, password: string }) {
    return await this.usersService.login(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.' })
  async updateProfile(@Request() req, @Body() userData: Partial<User>): Promise<User> {
    return await this.usersService.updateProfile(req.user.userId, userData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'The password has been successfully changed.' })
  async changePassword(@Request() req, @Body() { newPassword }: { newPassword: string }): Promise<void> {
    return await this.usersService.changePassword(req.user.userId, newPassword);
  }

  @Post('send-reset-password')
  @ApiOperation({ summary: 'Send reset password email' })
  @ApiResponse({ status: 200, description: 'Reset password email sent.' })
  async sendResetPassword(@Body() { email }: { email: string }): Promise<void> {
    return await this.usersService.sendResetPassword(email);
  }

  @Patch('reset-password/:token')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'The password has been successfully reset.' })
  async resetPassword(@Param() { token }: { token: string }, @Body() { newPassword }: { newPassword: string }) {
    return await this.usersService.resetPassword(token, newPassword);
  }
}
