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

  async create(book: Book, userId: number, file?: Express.Multer.File) {
    const user = await this.usersRepository.findOneBy({ id: userId })
    book.user = user

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

  async findAllForUser(userId: number) {
    return this.booksRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(id: number) {
    return this.booksRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Book>, file?: Express.Multer.File) {
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

  async remove(id: number) {
    await this.booksRepository.delete(id);
  }

  async generatePdfForAllQuestions(userId: number, bookId: string): Promise<string> {
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
    const book = await this.booksRepository.findOneBy({ id: parseInt(bookId) });
    if (book) {
      if (book.coverImage) {
        doc.image(join(__dirname, '..', '..', book.coverImage), doc.x + 70, doc.y, { width: 350, height: 600, align: 'center' }).moveDown();
        doc.addPage()
      }

      if (book.title && book.subtitle) {
        doc.fontSize(30)
        doc.text(book.subtitle, doc.x, doc.y + 100, { align: 'center' }).moveDown();
        doc.fontSize(20)
        doc.text(book.title, { align: 'center' }).moveDown();
        doc.fontSize(10)
        doc.addPage()
      }


      let offset = 0
      let counter = 0
      for (const question of questions) {
        if (question.answer) {
          if (question.media) {
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
        }
      }
      doc.end();
      return new Promise((resolve, reject) => {
        pdfStream.on('finish', () => {
          resolve(pdfPath);
        });
        pdfStream.on('error', reject);
    });
  } else {
    throw new HttpException('Book with this id doesn`t exist', HttpStatus.NOT_FOUND)
  }}
}
