import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async create(book: Book): Promise<Book> {
    this.booksRepository.save(book)
    return this.booksRepository.save(book);
  }

  async findAllForUser(userId: number): Promise<Book[]> {
    return this.booksRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Book> {
    return this.booksRepository.findOneBy({ id });
  }

  async update(id: number, book: Book): Promise<Book> {
    await this.booksRepository.update(id, book);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.booksRepository.delete(id);
  }
}
