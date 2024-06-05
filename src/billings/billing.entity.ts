import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Billing {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'The name of the customer' })
  @Column()
  customerName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the customer' })
  @Column()
  customerEmail: string;

  @ApiProperty({ example: 147.00, description: 'The amount paid by the customer' })
  @Column('decimal')
  amountPaid: number;

  @ApiProperty({ example: '2023-03-07', description: 'The start date of the billing period' })
  @Column('date')
  startDate: string;

  @ApiProperty({ example: '2024-01-13', description: 'The end date of the billing period' })
  @Column('date')
  endDate: string;
}