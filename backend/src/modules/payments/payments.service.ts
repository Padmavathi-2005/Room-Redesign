import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { User, UserDocument, SubscriptionPlan } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionDocument } from '../subscription/schemas/subscription-plan.schema';
import { SettingsService } from '../settings/settings.service';
import { StripeEvent, StripeEventDocument } from './schemas/stripe-event.schema';
import { Invoice, InvoiceDocument } from '../subscription/schemas/invoice.schema';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SubscriptionPlanDefinition.name)
    private readonly planModel: Model<SubscriptionPlanDefinitionDocument>,
    @InjectModel(StripeEvent.name) private readonly stripeEventModel: Model<StripeEventDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly settingsService: SettingsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Helper to initialize Stripe Client using system setting or env key
   */
  private async getStripeInstance(): Promise<Stripe> {
    const settings = await this.settingsService.getSettings();
    const secretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('Stripe Secret Key is missing in configuration.');
    }
    return new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as any });
  }

  /**
   * Helper to retrieve Webhook Secret
   */
  async getWebhookSecret(): Promise<string> {
    const settings = await this.settingsService.getSettings();
    return settings?.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  /**
   * Create Checkout Session for frontend redirection
   */
  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'annual' = 'monthly',
  ) {
    return this.subscriptionService.createCheckoutSession(userId, plan, billingCycle);
  }

  /**
   * Create Billing Portal Session for managing subscription
   */
  async createPortalSession(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.stripeCustomerId) {
      throw new BadRequestException('User does not have an active Stripe Customer ID.');
    }
    const stripe = await this.getStripeInstance();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: 'http://localhost:3000/billing',
    });
    return { url: portalSession.url };
  }

  /**
   * Strictly verify webhook payload and signature using Stripe SDK
   */
  async constructEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    const stripe = await this.getStripeInstance();
    const webhookSecret = await this.getWebhookSecret();
    if (!webhookSecret) {
      throw new BadRequestException('Stripe Webhook Secret is not configured. Webhook rejected.');
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Idempotent Webhook Event Processor
   */
  async processStripeWebhookEvent(event: Stripe.Event) {
    // 1. Idempotency check
    const existingEvent = await this.stripeEventModel.findOne({ eventId: event.id }).exec();
    if (existingEvent) {
      console.log(`ℹ️ Webhook Event [${event.id}] already processed. Skipping idempotently.`);
      return { received: true, duplicate: true };
    }

    // Record event as processing
    await this.stripeEventModel.create({
      eventId: event.id,
      eventType: event.type,
      metadata: { livemode: event.livemode },
    });

    // 2. Process event by type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const purchaseType = session.metadata?.purchaseType;

        if (userId) {
          if (purchaseType === 'credit_pack' || session.mode === 'payment') {
            const packCode = session.metadata?.packCode || session.metadata?.packId || '';
            await this.subscriptionService.grantCreditPack(
              userId,
              packCode,
              session.id,
              (session.amount_total || 0) / 100,
              session.url || '',
            );
          } else {
            const planCode = session.metadata?.planCode || session.metadata?.plan || 'starter';
            const billingCycle = session.metadata?.billingCycle || 'monthly';
            const customerId = (typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id) || '';
            const subscriptionId = (typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id) || '';

            let periodStart = new Date();
            let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            if (subscriptionId) {
              try {
                const stripe = await this.getStripeInstance();
                const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
                if (sub?.current_period_start) periodStart = new Date(sub.current_period_start * 1000);
                if (sub?.current_period_end) periodEnd = new Date(sub.current_period_end * 1000);
              } catch (err: any) {
                console.warn(`Failed to fetch Stripe subscription ${subscriptionId} in webhook: ${err.message}`);
              }
            }

            await this.subscriptionService.grantSubscriptionCredits(
              userId,
              planCode,
              customerId,
              subscriptionId,
              periodEnd,
              billingCycle,
              periodStart,
              session.id,
              (session.amount_total || 0) / 100,
              session.url || '',
            );
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice.subscription as string) || '';

        if (customerId) {
          const user = await this.userModel.findOne({ stripeCustomerId: customerId }).exec();
          if (user) {
            const planCode = user.plan || 'starter';
            const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await this.subscriptionService.grantSubscriptionCredits(
              user._id.toString(),
              planCode,
              customerId,
              subscriptionId,
              periodEnd,
              'monthly',
            );

            await this.invoiceModel.create({
              userId: user._id,
              stripeInvoiceId: invoice.id || `inv_${Date.now()}`,
              stripeSessionId: (invoice.payment_intent as string) || '',
              amountPaid: (invoice.amount_paid || 0) / 100,
              currency: invoice.currency || 'usd',
              status: 'paid',
              planCode,
              billingCycle: 'monthly',
              paymentMethod: 'Stripe',
              invoicePdfUrl: invoice.hosted_invoice_url || invoice.invoice_pdf || '',
              paidAt: new Date(),
            }).catch((err) => console.warn(`Duplicate recurring invoice record ignored: ${err.message}`));
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          const user = await this.userModel.findOne({ stripeCustomerId: customerId }).exec();
          if (user) {
            user.subscriptionStatus = 'unpaid';
            await user.save();

            await this.invoiceModel.create({
              userId: user._id,
              stripeInvoiceId: invoice.id || `inv_fail_${Date.now()}`,
              stripeSessionId: '',
              amountPaid: (invoice.amount_due || 0) / 100,
              currency: invoice.currency || 'usd',
              status: 'failed',
              planCode: user.plan || 'free',
              billingCycle: 'monthly',
              paymentMethod: 'Stripe',
              invoicePdfUrl: '',
              paidAt: new Date(),
            }).catch(() => {});
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        const subId = sub.id as string;
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

        const user = await this.userModel.findOne({
          $or: [{ stripeSubscriptionId: subId }, { stripeCustomerId: customerId }],
        }).exec();

        if (user) {
          if (sub.cancel_at_period_end) {
            user.subscriptionStatus = 'canceling';
          } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
            user.subscriptionStatus = sub.status;
          } else if (sub.status === 'active') {
            user.subscriptionStatus = 'active';
          }

          if (periodEnd) {
            user.subscriptionPeriodEnd = periodEnd;
          }

          await user.save();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.subscriptionService.handleSubscriptionCancellation(subscription.id);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }
}
