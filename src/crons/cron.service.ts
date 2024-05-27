import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron("0 0 * * *")
  async handleDailyCron() {
    const users = await this.userRepository.find({
      where: { questionCreationFrequency: 'day' },
    });
    console.log('Daily cron job:', users);
  }

  @Cron("0 0 * * 0")
  async handleWeeklyCron() {
    const users = await this.userRepository.find({
      where: { questionCreationFrequency: 'week' },
    });
    console.log('Weekly cron job:', users);
  }

  @Cron("0 0 1 * *")
  async handleMonthlyCron() {
    const users = await this.userRepository.find({
      where: { questionCreationFrequency: 'month' },
    });
    console.log('Monthly cron job:', users);
  }

  @Cron("0 0 1 1 *")
  async handleYearlyCron() {
    const users = await this.userRepository.find({
      where: { questionCreationFrequency: 'year' },
    });
    console.log('Yearly cron job:', users);
  }
}
