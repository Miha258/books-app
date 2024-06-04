import { Module } from '@nestjs/common';
import { BillingService } from './billings.service';
import { BillingController } from './billings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from './billing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  providers: [BillingService],
  controllers: [BillingController]
})
export class BillingsModule {}
