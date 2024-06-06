import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  public stripe: Stripe;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
        email,
        name,
    })
    const user = await this.usersRepository.findOneBy({ email })
    user.customerId = customer.id
    await this.usersRepository.update(user.id, user)
    return
  }

  async createPaymentIntent(amount: number, currency: string) {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customer = paymentIntent.customer as Stripe.Customer
        const user = await this.usersRepository.findOneBy({ customerId: customer.id })
        user.activated = true
        await this.usersRepository.update(user.id, user)
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
