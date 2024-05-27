import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './questions.entity';
import { User } from '../users/user.entity';


@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(question: Question, userId: number): Promise<Question> {
    question.user = await this.usersRepository.findOneBy({ id: userId });
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

  async update(id: number, question: Question): Promise<Question> {
    await this.questionsRepository.update(id, question);
    const updated = await this.findOne(id)
    delete updated.user
    return updated
  }

  async remove(id: number): Promise<void> {
    await this.questionsRepository.delete(id);
  }
}
