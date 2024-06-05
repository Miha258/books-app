import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from './billing.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {}

  async isExist(id: number) {
    if (!await this.billingRepository.existsBy({ id })) {
        throw new HttpException('Billing not found', HttpStatus.BAD_REQUEST)
    }
  }

  async create(billing: Billing) {
    return await this.billingRepository.save(billing)
  }

  async findAll(): Promise<Billing[]> {
    return await this.billingRepository.find();
  }

  async findOne(id: number) {
    await this.isExist(id)
    return await this.billingRepository.findOneBy({ id });
  }

  async update(id: number, billing: Billing) {
    await this.isExist(id)
    await this.billingRepository.update(id, billing);
  }

  async remove(id: number) {
    await this.isExist(id)
    await this.billingRepository.delete(id);
  }
}
