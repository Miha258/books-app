import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { User } from '../users/user.entity';
import { GptModule } from 'src/gpt/gpt.module';
import { GptService } from 'src/gpt/gpt.service';
import { Question } from 'src/questions/questions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Question]),
    ScheduleModule.forRoot(),
    GptModule
  ],
  providers: [CronService, GptService],
})
export class CronModule {}
