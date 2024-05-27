import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ScheduleModule.forRoot(),
  ],
  providers: [CronService],
})
export class CronModule {}
