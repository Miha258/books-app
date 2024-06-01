import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './questions.entity';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import * as fs from 'node:fs/promises';
import * as PDFDocument from 'pdfkit';
import * as fsSync from 'fs';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(User)
    private usersRepository: Repository<User>

  ) {}

  async create(question: Question, userId: number, files?: { media?: Express.Multer.File[], voice?: Express.Multer.File[] }) {
    question.user = await this.usersRepository.findOneBy({ id: userId });
    
    let uploadPath: string | null
    let uploadBuff: any | null

    if (files) {
      if (files.media) {
        const mediaFile = files.media[0].originalname
        const separatedMediaFilename = mediaFile.split('.')
        question.media = 'files/media/' + uuidv4() + "." + separatedMediaFilename[separatedMediaFilename.length - 1]
        uploadPath = join(__dirname, '..', '..', question.media)
        uploadBuff = files.media[0].buffer
      }
  
      if (files.voice) {
        const voiceFile = files.voice[0].originalname
        const separatedVoiceFilename = voiceFile.split('.')
        question.voice = 'files/voice/' + uuidv4() + "." + separatedVoiceFilename[separatedVoiceFilename.length - 1]
        uploadPath = join(__dirname, '..', '..', question.voice)
        uploadBuff = files.voice[0].buffer
      }
  
      if (uploadPath) {
        await fs.writeFile(uploadPath, uploadBuff)
      }
    }
    
    await this.questionsRepository.save(question)
    delete question.user
    return question
  }

  async findAllForUser(userId: number): Promise<Question[]> {
    const questions = await this.questionsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    })
    return questions.map(q => {
        delete q.user
        return q
    })
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionsRepository.findOne({ where: { id }, relations: ['user'] });
    delete question.user
    return question
  }

  async update(id: number, updateData: Partial<Question>, files?: { media?: Express.Multer.File[], voice?: Express.Multer.File[] }) {
    const question = await this.findOne(id)
    let uploadPath: string | null
    let uploadBuff: any | null

    if (files) {
      if (files.media) {
        if (question.media) {
          await fs.unlink(join(__dirname, '..', '..', question.media))
        }
        const mediaFile = files.media[0].originalname
        const separatedMediaFilename = mediaFile.split('.')
        updateData.media = 'files/media/' + uuidv4() + "." + separatedMediaFilename[separatedMediaFilename.length - 1]
        uploadPath = join(__dirname, '..', '..', updateData.media)
        uploadBuff = files.media[0].buffer
      }
  
      if (files.voice) {
        if (question.voice) {
          await fs.unlink(join(__dirname, '..', '..', question.voice))
        }
        const voiceFile = files.voice[0].originalname
        const separatedVoiceFilename = voiceFile.split('.')
        updateData.voice = 'files/voice/' + uuidv4() + "." + separatedVoiceFilename[separatedVoiceFilename.length - 1]
        uploadPath = join(__dirname, '..', '..', updateData.voice)
        uploadBuff = files.voice[0].buffer
      }
  
      if (uploadPath) {
        await fs.writeFile(uploadPath, uploadBuff)
      }
    }
    await this.questionsRepository.update(id, updateData);
    const updated = await this.findOne(id)
    delete updated.user
    return updated
  }

  async remove(id: number) {
    await this.questionsRepository.delete(id);
  }

  async getFile(type: string, filename: string) {
    switch (type) {
      case 'media':
        return join(__dirname, '..', '..', 'files', 'media', filename)
      case 'voice':
        return join(__dirname, '..', '..', 'files', 'voice', filename)
      default:
        throw new HttpException("File not found", HttpStatus.NOT_FOUND)
    }
  }

  async generatePdfForAllQuestions(userId: number, bookId: string): Promise<string> {
    const questions = await this.findAllForUser(userId);
    const doc = new PDFDocument();

    const pdfPath = join(__dirname, '..', '..', 'files', 'pdf', `questions_${userId}.pdf`);
    const pdfStream = fsSync.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    let offset: number = 0
    for (const question of questions) {
      if (question.answer) {
        if (question.media) {
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
              const x = (pageWidth - newWidth) / 2;
              const y = (pageHeight - newHeight);
              doc.image(mediaPath, doc.x, doc.y, { width: newWidth, height: newHeight }).moveDown();
              offset += y
            }
          } catch (error) {
            console.error(`Failed to load media file for question ${question.id}: ${error.message}`);
          }
        }
        doc.text(question.answer, doc.x, doc.y + offset, { align: 'center' }).moveDown();
      }
    }
    doc.end();

    return new Promise((resolve, reject) => {
      pdfStream.on('finish', () => {
        resolve(pdfPath);
      });
      pdfStream.on('error', reject);
    });
  }
}
