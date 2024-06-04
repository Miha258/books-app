import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from './billing.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {}

  async create(billing: Billing) {
    return await this.billingRepository.save(billing);
  }

  async findAll(): Promise<Billing[]> {
    return await this.billingRepository.find();
  }

  async findOne(id: number) {
    return await this.billingRepository.findOneBy({ id });
  }

  async update(id: number, billing: Billing) {
    await this.billingRepository.update(id, billing);
  }

  async remove(id: number) {
    await this.billingRepository.delete(id);
  }
}
