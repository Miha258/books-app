import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './questions.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, User])],
  providers: [QuestionsService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
