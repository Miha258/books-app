import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentService } from './paynament.service';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a new payment intent' })
  @ApiResponse({ status: 201, description: 'The payment intent has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createPaymentIntent(@Body() body: { amount: number, currency: string }) {
    const paymentIntent = await this.paymentService.createPaymentIntent(body.amount, body.currency);
    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('create-customer')
  @ApiOperation({ summary: 'Create a new Stripe customer' })
  @ApiResponse({ status: 201, description: 'The customer has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createCustomer(@Body() body: { email: string, name: string }) {
    const customer = await this.paymentService.createCustomer(body.email, body.name);
    return { customer };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook received successfully.' })
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = this.paymentService.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }

    await this.paymentService.handleWebhook(event);

    res.sendStatus(HttpStatus.OK);
  }
}
