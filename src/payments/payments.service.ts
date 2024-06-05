import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentsSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentsSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const line_items = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // 20 - 2000 / 100 * 20.00
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      // Colocar aquí el ID del pedido
      payment_intent_data: {
        metadata: {
          orderId: orderId
        },
      },

      line_items: line_items,
      mode: 'payment',
      success_url: 'http://localhost:3003/payments/success',
      cancel_url: 'http://localhost:3003/payments/cancel',
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    // testing
    // const endpointSecret = "whsec_6c10f7d487929e3ce7a371ca33e46518fc44c3b59cf9861cc1b47a321b0bce3f";
    // real
    const endpointSecret = "";
    try {
      event = this.stripe.webhooks.constructEvent(req["rawBody"], sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch(event.type) {
      case 'charge.succeeded':
        // TODO: llamar a nuestro microservicio
        const chargeSecceded = event.data.object;
        console.log({
          metadata: chargeSecceded.metadata,
          orderId: chargeSecceded.metadata.orderId
        });
        break;
      default:
        console.log(`Event "${event.type}" no controlado`)
    }
    return res.status(200).json({sig})
  }

}
