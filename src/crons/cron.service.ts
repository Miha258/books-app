import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';  
import { GptService } from 'src/gpt/gpt.service';
import { Question } from 'src/questions/questions.entity';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private gptService: GptService
  ) {}

  async sendQuestions(users: User[]) {
    const questionText = await this.gptService.generateText(process.env.GPT_PROMPT)
    for (let user of users) {
      const questions = await this.questionsRepository.find({
        where: { user: { id: user.id } },
        relations: ['user'],
      })
      if (questions.length != 100) {
        const question = new Question()
        question.user = user
        question.question = questionText
        await this.questionsRepository.save(question)
      }
    }
  }

  @Cron("0 0 * * *")
  async handleDailyCron() {
    const users = await this.usersRepository.find({
      where: { questionCreationFrequency: 'day' },
    });
    await this.sendQuestions(users)
  }

  @Cron("0 0 * * 0")
  async handleWeeklyCron() {
    const users = await this.usersRepository.find({
      where: { questionCreationFrequency: 'week' },
    });
    await this.sendQuestions(users)
  }

  @Cron("0 0 1 * *")
  async handleMonthlyCron() {
    const users = await this.usersRepository.find({
      where: { questionCreationFrequency: 'month' },
    });
    await this.sendQuestions(users)
  }

  @Cron("0 0 1 1 *")
  async handleYearlyCron() {
    const users = await this.usersRepository.find({
      where: { questionCreationFrequency: 'year' },
    });
    await this.sendQuestions(users)
  }
}
