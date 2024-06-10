import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './questions.entity';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import * as fs from 'node:fs/promises';
import { GptService } from 'src/gpt/gpt.service';


@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private gptService: GptService
  ) {}


  async isExist(id: number) {
    if (!await this.questionsRepository.existsBy({ id })) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }
  }

  async create(question: Question, userId: number, files?: { media?: Express.Multer.File[], voice?: Express.Multer.File[] }) {
    const questions = await this.questionsRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
    });

    if (questions.length === 100) {
        throw new HttpException('You can create a maximum of 100 questions per book', HttpStatus.BAD_REQUEST);
    }

    delete question.answer;
    question.user = await this.usersRepository.findOneBy({ id: userId });

    if (files) {
        if (files.media) {
            const mediaFile = files.media[0].originalname;
            const separatedMediaFilename = mediaFile.split('.');
            question.media = 'files/media/' + uuidv4() + '.' + separatedMediaFilename.pop();
            const mediaUploadPath = join(__dirname, '..', '..', question.media);
            const mediaUploadBuff = files.media[0].buffer;
            await fs.writeFile(mediaUploadPath, mediaUploadBuff);
        }

        if (files.voice) {
            const voiceFile = files.voice[0].originalname;
            const separatedVoiceFilename = voiceFile.split('.');
            question.voice = 'files/voice/' + uuidv4() + '.' + separatedVoiceFilename.pop();
            const voiceUploadPath = join(__dirname, '..', '..', question.voice);
            const voiceUploadBuff = files.voice[0].buffer;
            await fs.writeFile(voiceUploadPath, voiceUploadBuff);
        }
    }

    question.question = question.question ? question.question : await this.gptService.generateText(process.env.GPT_PROMPT);
    await this.questionsRepository.save(question);
    delete question.user;
    return question;
  }

  async findAllForUser(userId: number) {
    const questions = await this.questionsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    })
    return questions.map(q => {
        delete q.user
        return q
    })
  }

  async findOne(id: number) {
    const question = await this.questionsRepository.findOne({ where: { id }, relations: ['user'] });
    delete question.user
    return question
  }

  async update(id: number, updateData: Partial<Question>, files?: { media?: Express.Multer.File[], voice?: Express.Multer.File[] }) {
    delete updateData.question
    const question = await this.findOne(id)
    let uploadPath: string | null
    let uploadBuff: any | null

    if (files) {
      if (question.media && question.media !== 'undefined') {
        const oldMediaPath = join(__dirname, '..', '..', question.media)
        if (await fs.access(oldMediaPath).then(() => true).catch(() => false)) {
          await fs.unlink(oldMediaPath)
        }
      }
      if (question.voice && question.media !== 'undefined') {
        const oldVoicePath = join(__dirname, '..', '..', question.voice)
        if (await fs.access(oldVoicePath).then(() => true).catch(() => false)) {
          await fs.unlink(oldVoicePath)
        }
      }
      
      if (files.media) {
        const mediaFile = files.media[0].originalname
        const separatedMediaFilename = mediaFile.split('.')
        updateData.media = 'files/media/' + uuidv4() + "." + separatedMediaFilename[separatedMediaFilename.length - 1]
        uploadPath = join(__dirname, '..', '..', updateData.media)
        uploadBuff = files.media[0].buffer
      }
  
      if (files.voice) {
        const voiceFile = files.voice[0].originalname
        const separatedVoiceFilename = voiceFile.split('.')
        updateData.voice = 'files/voice/' + uuidv4() + "." + separatedVoiceFilename[separatedVoiceFilename.length - 1]
        uploadPath = join(__dirname, '..', '..', updateData.voice)
        uploadBuff = files.voice[0].buffer
      }
  
      if (uploadPath) {
        console.log('writed')
        await fs.writeFile(uploadPath, uploadBuff)
      }
    }
    await this.questionsRepository.update(id, updateData);
    const updated = await this.findOne(id)
    return updated
  }

  async remove(id: number) {
    await this.questionsRepository.delete(id);
  }

  async getCount(userId: number) {
    const questions = await this.questionsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    })
    return questions.reduce((prev, cur) => {
      if (cur.answer) {
        return prev += 1
      }
      return 0
    }, 0)
  }
}
