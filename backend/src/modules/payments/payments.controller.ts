import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubscriptionPlan } from '../users/schemas/user.schema';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/v1/payments/checkout
   * Guarded by JwtAuthGuard
   */
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async createCheckout(
    @CurrentUser('_id') userId: string,
    @Body('plan') plan: SubscriptionPlan,
    @Body('billingCycle') billingCycle: 'monthly' | 'annual' = 'monthly',
  ) {
    if (!plan) {
      throw new BadRequestException('Plan type is required.');
    }
    const session = await this.paymentsService.createCheckoutSession(
      userId.toString(),
      plan,
      billingCycle,
    );
    return {
      success: true,
      message: 'Checkout Session Created',
      data: session,
    };
  }

  /**
   * POST /api/v1/payments/portal
   * Guarded by JwtAuthGuard
   */
  @UseGuards(JwtAuthGuard)
  @Post('portal')
  @HttpCode(HttpStatus.OK)
  async createPortal(@CurrentUser('_id') userId: string) {
    const portalSession = await this.paymentsService.createPortalSession(userId.toString());
    return {
      success: true,
      message: 'Billing Portal Session Created',
      data: portalSession,
    };
  }

  /**
   * POST /api/v1/payments/webhook
   * Public Stripe Webhook Endpoint with Strict Signature Verification & Idempotency
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const payload = req.rawBody;
    if (!payload || !Buffer.isBuffer(payload)) {
      throw new BadRequestException('Raw body is required for webhook signature verification.');
    }

    let event;
    try {
      event = await this.paymentsService.constructEvent(payload, signature);
    } catch (err: any) {
      console.error(`❌ Webhook signature validation failed strictly: ${err.message}`);
      return res.status(HttpStatus.BAD_REQUEST).send(`Stripe Webhook Signature Verification Failed: ${err.message}`);
    }

    try {
      const result = await this.paymentsService.processStripeWebhookEvent(event);
      return res.status(HttpStatus.OK).json(result);
    } catch (dbErr: any) {
      console.error(`Webhook processing failed: ${dbErr.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`Webhook error: ${dbErr.message}`);
    }
  }
}
