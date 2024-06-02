import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './book.entity';
import { Question } from 'src/questions/questions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Question])],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
