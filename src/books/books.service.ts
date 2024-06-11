import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import * as PDFDocument from 'pdfkit';
import * as fsSync from 'fs';
import { Question } from 'src/questions/questions.entity';
import { User } from 'src/users/user.entity';


@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}


  async isExists(id: number) {
    console.log(!this.booksRepository.existsBy({ id }))
    if (!this.booksRepository.existsBy({ id })) {
      throw new HttpException('Book with this id doesn`t exist', HttpStatus.NOT_FOUND)
    }
  }

  async create(book: Book, userId: number, file?: Express.Multer.File) {
    const user = await this.usersRepository.findOneBy({ id: userId })
    book.user = user
    
    let uploadPath: string | null
    let uploadBuff: any | null
    
    if (file) {
      const mediaFile = file.originalname
      const separatedMediaFilename = mediaFile.split('.')
      book.coverImage = 'files/books/' + uuidv4() + "." + separatedMediaFilename.pop()
      uploadPath = join(__dirname, '..', '..', book.coverImage)
      uploadBuff = file.buffer
      await fs.writeFile(uploadPath, uploadBuff)
    }
    const newBook = await this.booksRepository.save(book)
    delete newBook.user
    return newBook
  }

  async findAllForUser(userId: number) {
    const books = await this.booksRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    return books.map(book => {
      delete book.user
      return book
    })
  }

  async findOne(id: number) {
    return this.booksRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Book>, file?: Express.Multer.File) {
    await this.isExists(id)
    const book = await this.findOne(id)
    
    let uploadPath: string | null
    let uploadBuff: any | null
    
    if (file) {
      if (book.coverImage && book.coverImage !== 'undefined') {
        const oldCoverImagePath = join(__dirname, '..', '..', book.coverImage)
        if (await fs.access(oldCoverImagePath).then(() => true).catch(() => false)) {
          await fs.unlink(join(oldCoverImagePath))
        }
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

  async remove(id: number) {
    await this.isExists(id)
    await this.booksRepository.delete(id);
  }

  async generatePdfForAllQuestions(userId: number, bookId: number) {
    await this.isExists(bookId)
    const questions = await this.questionsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    })

    if (questions.length == 0) {
      throw new HttpException('You must answer at least one question', HttpStatus.LENGTH_REQUIRED)
    }
    
    const doc = new PDFDocument();
    const pdfPath = join(__dirname, '..', '..', 'files', 'pdf', `questions_${uuidv4()}.pdf`);
    const pdfStream = fsSync.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    const book = await this.booksRepository.findOneBy({ id: bookId });
    

    if (!book) {
      throw new HttpException('Book with this id doesn`t exists', HttpStatus.NOT_FOUND)
    }


    if (book.coverImage && book.coverImage !== 'undefinded') {
      const coverImagePath = join(__dirname, '..', '..', book.coverImage)
      const coverImageExists = await fs.access(coverImagePath).then(() => true).catch(() => false);
      if (coverImageExists) {
        doc.image(coverImagePath, doc.x + 70, doc.y, { width: 350, height: 600, align: 'center' }).moveDown();
      }
    }
    

    if (book.title && book.subtitle) {
      doc.fontSize(45)
      const white: PDFKit.Mixins.ColorValue = [255, 255, 255]
      const black: PDFKit.Mixins.ColorValue = [0, 0, 0]
      doc.fillColor(white, 1)
      doc.text(book.subtitle, doc.x, doc.y + 420, { align: 'center', fill: true}).moveDown();
      doc.fontSize(30)
      doc.text(book.title, doc.x, doc.y - 50, { align: 'center', fill: true}).moveDown();
      doc.fontSize(10)
      doc.fillColor(black, 1)
      doc.addPage()
    }


    let offset = 0
    let counter = 0
    for (const question of questions) {
      if (question.answer) {
        if (question.media && question.media !== 'undefinded') {
          counter += 1
          try {
            const mediaPath = join(__dirname, '..', '..', question.media);
            const mediaExists = await fs.access(mediaPath).then(() => true).catch(() => false);
            if (mediaExists) {
              const pageWidth = doc.page.width;
              const pageHeight = doc.page.height;
              /* @ts-ignore */
              const imgProps = doc.openImage(mediaPath);
              const imgWidth = imgProps.width;
              const imgHeight = imgProps.height;
              const ratio = imgWidth / imgHeight;
              const newWidth = pageWidth - 2 * doc.page.margins.left;
              const newHeight = newWidth / ratio;
              const y = (pageHeight - newHeight);
              doc.image(mediaPath, doc.x, doc.y, { width: newWidth, height: newHeight }).moveDown();
              offset += y
            }
          } catch (error) {
            console.error(`Failed to load media file for question ${question.id}: ${error.message}`);
          }
        }
        doc.text(question.answer, doc.x, doc.y + offset / 1.3, { align: 'left' }).moveDown();
        offset = 0
        await this.booksRepository.delete(question.id)
      }
    }
    doc.end()
    book.pdf = 'files/pdf/' + pdfPath.split('/').pop()
    await this.booksRepository.update(bookId, book)
    return { file: book.pdf }
  }
}
