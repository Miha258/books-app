import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async create(book: Book, file?: Express.Multer.File): Promise<Book> {
    let uploadPath: string | null
    let uploadBuff: any | null
    
    if (file) {
      const mediaFile = file.originalname
      const separatedMediaFilename = mediaFile.split('.')
      book.coverImage = 'files/books/' + uuidv4() + "." + separatedMediaFilename[separatedMediaFilename.length - 1]
      uploadPath = join(__dirname, '..', '..', book.coverImage)
      uploadBuff = file.buffer
      await fs.writeFile(uploadPath, uploadBuff)
    }
    
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

  async update(id: number, updateData: Partial<Book>, file?: Express.Multer.File): Promise<Book> {
    const book = await this.findOne(id)
    
    let uploadPath: string | null
    let uploadBuff: any | null
    
    if (file) {
      if (book.coverImage) {
        await fs.unlink(join(__dirname, '..', '..', book.coverImage))
      }
      const mediaFile = file.originalname
      const separatedMediaFilename = mediaFile.split('.')
      updateData.coverImage = 'files/books/' + uuidv4() + "." + separatedMediaFilename[separatedMediaFilename.length - 1]
      uploadPath = join(__dirname, '..', '..', updateData.coverImage)
      uploadBuff = file.buffer
      await fs.writeFile(uploadPath, uploadBuff)
    }
    
    await this.booksRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.booksRepository.delete(id);
  }
}
