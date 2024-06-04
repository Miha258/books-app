import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './questions.entity';
import { User } from 'src/users/user.entity';
import { GptModule } from 'src/gpt/gpt.module';
import { GptService } from 'src/gpt/gpt.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, User]), GptModule],
  providers: [QuestionsService, GptService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
