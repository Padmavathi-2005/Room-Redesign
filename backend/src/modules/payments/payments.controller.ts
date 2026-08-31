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
import { SubscriptionService } from '../subscription/subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubscriptionPlan } from '../users/schemas/user.schema';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * POST /api/v1/payments/checkout
   * guarded by JwtAuthGuard
   */
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async createCheckout(
    @CurrentUser('_id') userId: string,
    @Body('plan') plan: SubscriptionPlan,
    @Body('billingCycle') billingCycle: 'monthly' | 'annual',
  ) {
    if (!plan || !billingCycle) {
      throw new BadRequestException('Plan type and billing cycle are required.');
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
   * guarded by JwtAuthGuard
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
   * POST /api/v1/payments/paypal/create-order
   */
  @UseGuards(JwtAuthGuard)
  @Post('paypal/create-order')
  @HttpCode(HttpStatus.OK)
  async createPayPalOrder(
    @CurrentUser('_id') userId: string,
    @Body('plan') plan: SubscriptionPlan,
    @Body('billingCycle') billingCycle: 'monthly' | 'annual',
  ) {
    if (!plan || !billingCycle) {
      throw new BadRequestException('Plan type and billing cycle are required.');
    }
    const orderData = await this.paymentsService.createPayPalOrder(
      userId.toString(),
      plan,
      billingCycle,
    );
    return {
      success: true,
      message: 'PayPal Order Created',
      data: orderData,
    };
  }

  /**
   * POST /api/v1/payments/paypal/capture-order
   */
  @UseGuards(JwtAuthGuard)
  @Post('paypal/capture-order')
  @HttpCode(HttpStatus.OK)
  async capturePayPalOrder(
    @CurrentUser('_id') userId: string,
    @Body('orderId') orderId: string,
    @Body('plan') plan: SubscriptionPlan,
  ) {
    if (!orderId || !plan) {
      throw new BadRequestException('PayPal order ID and plan are required.');
    }
    const captureData = await this.paymentsService.capturePayPalOrder(
      userId.toString(),
      orderId,
      plan,
    );
    return {
      success: true,
      message: 'PayPal Order Captured Successfully',
      data: captureData,
    };
  }

  /**
   * POST /api/v1/payments/mock-activate
   * Auth-protected helper endpoint for testing/sandbox mode without real Stripe keys
   */
  @UseGuards(JwtAuthGuard)
  @Post('mock-activate')
  @HttpCode(HttpStatus.OK)
  async mockActivate(
    @CurrentUser('_id') userId: string,
    @Body('plan') plan: SubscriptionPlan,
  ) {
    // Simulate payment webhook activation directly
    const session = await this.paymentsService.createCheckoutSession(userId.toString(), plan, 'monthly');
    const stripeCustomerId = `cus_mock_${Date.now()}`;
    const stripeSubId = `sub_mock_${Date.now()}`;
    
    // Fetch and update user stripe Customer ID mock
    const user = await this.subscriptionService.refillUserCredits(
      stripeCustomerId,
      stripeSubId,
      plan,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
    ).catch(async () => {
      // If Customer ID is not matched because it's a new mock customer, fetch by user ID
      const userObj = await (this.subscriptionService as any).userModel.findById(userId);
      userObj.stripeCustomerId = stripeCustomerId;
      await userObj.save();
      
      return this.subscriptionService.refillUserCredits(
        stripeCustomerId,
        stripeSubId,
        plan,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      );
    });

    return {
      success: true,
      message: `Plan upgrade mocked successfully to ${plan}!`,
      data: user,
    };
  }

  /**
   * POST /api/v1/payments/webhook
   * Public Stripe Webhook Endpoint
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
    if (!payload) {
      throw new BadRequestException('Request raw body is missing');
    }

    let event;
    try {
      event = await this.paymentsService.constructEvent(payload, signature);
    } catch (err: any) {
      const hasSecret = await this.paymentsService.hasWebhookSecret();
      if (hasSecret) {
        console.error(`❌ Webhook signature validation failed strictly: ${err.message}`);
        return res.status(400).send(`Stripe Webhook Signature Verification Failed: ${err.message}`);
      }

      console.warn(`⚠️ Webhook signature validation failed: ${err.message}. processing unsafe fallback...`);
      // Optional fallback in sandbox/dev environments if keys are unconfigured
      try {
        event = JSON.parse(payload.toString());
      } catch (jsonErr) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const stripeCustomerId = session.customer;
          const stripeSubscriptionId = session.subscription;
          const plan = session.metadata?.plan as SubscriptionPlan;
          
          if (stripeCustomerId && stripeSubscriptionId && plan) {
            const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await this.subscriptionService.refillUserCredits(
              stripeCustomerId,
              stripeSubscriptionId,
              plan,
              expiryDate,
            );
            console.log(`✅ Webhook: Provisioned ${plan} plan for Stripe Customer ID: ${stripeCustomerId}`);
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any;
          const stripeCustomerId = invoice.customer;
          const stripeSubscriptionId = invoice.subscription;
          
          if (stripeCustomerId && stripeSubscriptionId) {
            // Find user plan based on subscription lines or retain existing plan metadata
            const lines = invoice.lines?.data || [];
            let plan: SubscriptionPlan = SubscriptionPlan.STARTER;
            
            // Check line item description or price custom metadata
            for (const line of lines) {
              const linePlan = line.price?.metadata?.plan || line.metadata?.plan;
              if (linePlan) {
                plan = linePlan as SubscriptionPlan;
                break;
              }
            }

            const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await this.subscriptionService.refillUserCredits(
              stripeCustomerId,
              stripeSubscriptionId,
              plan,
              expiryDate,
            );
            console.log(`✅ Webhook: Renewed ${plan} plan via Invoice Success for customer: ${stripeCustomerId}`);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const stripeSubscriptionId = subscription.id;
          if (stripeSubscriptionId) {
            await this.subscriptionService.handleSubscriptionCancellation(stripeSubscriptionId);
            console.log(`🛑 Webhook: Cancelled subscription: ${stripeSubscriptionId}`);
          }
          break;
        }
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (dbErr: any) {
      console.error(`Database operations in Webhook failed: ${dbErr.message}`);
      return res.status(500).send(`Internal database error: ${dbErr.message}`);
    }

    res.json({ received: true });
  }

  /**
   * POST /api/v1/payments/paypal/webhook
   * Public PayPal Webhook / IPN Notification Endpoint
   */
  @Post('paypal/webhook')
  @HttpCode(HttpStatus.OK)
  async handlePayPalWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const event = req.body;
    console.log(`📩 Received PayPal Webhook Event: ${event?.event_type || 'UNKNOWN'}`);

    try {
      const eventType = event?.event_type;
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
        const resource = event?.resource;
        const customId = resource?.custom_id || resource?.purchase_units?.[0]?.custom_id;
        console.log(`✅ PayPal Webhook: Completed payment capture for custom ID: ${customId}`);
      }
    } catch (err: any) {
      console.error(`PayPal Webhook Processing Error: ${err.message}`);
    }

    res.json({ received: true });
  }
}
