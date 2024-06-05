import { ApiProperty } from '@nestjs/swagger';

export class PaymentIntentDto {
  @ApiProperty({ description: 'The amount' })
  amount: number;
  @ApiProperty({ description: 'The currency' })
  currency: string;
}