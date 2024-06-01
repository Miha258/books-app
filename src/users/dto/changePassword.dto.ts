import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Old password' })
  oldPassword?: string;

  @ApiProperty({ description: 'New password' })
  newPassword: string;
}