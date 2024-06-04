import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './book.entity';
import { Question } from 'src/questions/questions.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Question, User])],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
