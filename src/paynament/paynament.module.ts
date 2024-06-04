import { Module } from '@nestjs/common';
import { PaymentController } from './paynament.controller';
import { PaymentService } from './paynament.service';
import { User } from 'src/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaynamentModule {}
