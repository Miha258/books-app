import { ApiProperty } from '@nestjs/swagger';

export class SendResetMailDto {
  @ApiProperty({ description: 'Email for passwornd recovery' })
  email: string;
}