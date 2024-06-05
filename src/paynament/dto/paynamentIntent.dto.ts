import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty({ description: 'User email' })
  email: string;
  @ApiProperty({ description: 'User name' })
  name: string;
}