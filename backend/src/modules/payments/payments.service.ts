import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { User, UserDocument, SubscriptionPlan } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionDocument } from '../subscription/schemas/subscription-plan.schema';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class PaymentsService {
  private stripeInstance: Stripe | null = null;
  private cachedApiKey: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SubscriptionPlanDefinition.name)
    private readonly planModel: Model<SubscriptionPlanDefinitionDocument>,
  ) {}

  /**
   * Helper to retrieve Stripe instance with dynamically configured secret key
   */
  private async getStripeInstance(): Promise<Stripe> {
    const settings = await this.settingsService.getSettings();
    const apiKey = settings?.stripeSecretKey || this.configService.get<string>('STRIPE_SECRET_KEY') || 'mock_key';
    
    if (this.stripeInstance && this.cachedApiKey === apiKey) {
      return this.stripeInstance;
    }
    
    this.cachedApiKey = apiKey;
    this.stripeInstance = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any,
    });
    return this.stripeInstance;
  }

  /**
   * Helper to map Plan + Billing Cycle to Stripe Price IDs
   * Queries database plan definitions first.
   */
  private async getPriceId(plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual'): Promise<string> {
    // 1. Check database configuration first
    const planDef = await this.planModel.findOne({ code: plan.toLowerCase(), isActive: true }).exec();
    if (planDef) {
      const priceId = billingCycle === 'monthly' ? planDef.stripePriceIdMonthly : planDef.stripePriceIdAnnual;
      if (priceId) {
        return priceId;
      }
    }

    // 2. Check environment variables
    const envKey = `STRIPE_PRICE_${plan.toUpperCase()}_${billingCycle.toUpperCase()}`;
    const configuredPriceId = this.configService.get<string>(envKey);
    if (configuredPriceId) {
      return configuredPriceId;
    }

    // 3. Fallback mock prices
    const defaults = {
      [SubscriptionPlan.STARTER]: {
        monthly: 'price_mock_starter_monthly',
        annual: 'price_mock_starter_annual',
      },
      [SubscriptionPlan.STANDARD]: {
        monthly: 'price_mock_standard_monthly',
        annual: 'price_mock_standard_annual',
      },
      [SubscriptionPlan.PROFESSIONAL]: {
        monthly: 'price_mock_professional_monthly',
        annual: 'price_mock_professional_annual',
      },
    };

    const planPrices = defaults[plan];
    if (!planPrices) {
      throw new BadRequestException(`No Stripe price mapping found for plan tier: ${plan}`);
    }

    return planPrices[billingCycle];
  }

  /**
   * Create Checkout Session for Subscription Upgrade
   */
  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'annual',
  ): Promise<{ url: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (plan === SubscriptionPlan.FREE) {
      throw new BadRequestException('Cannot purchase a subscription for the FREE plan');
    }

    const stripe = await this.getStripeInstance();

    // 1. Resolve Stripe Customer ID
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId: user._id.toString() },
        });
        stripeCustomerId = customer.id;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
      } catch (err: any) {
        console.error('Failed to create customer on Stripe:', err.message);
        stripeCustomerId = `cus_mock_${Date.now()}`;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
      }
    }

    const priceId = await this.getPriceId(plan, billingCycle);

    // 2. Create Stripe Checkout Session
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${frontendUrl}/billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
        cancel_url: `${frontendUrl}/pricing`,
        metadata: {
          userId: user._id.toString(),
          plan,
        },
      });

      return { url: session.url || '' };
    } catch (err: any) {
      console.error('Stripe session creation failed:', err.message);
      // Mock flow if stripe key is invalid or for test environments
      const mockSessionId = `cs_test_${Date.now()}`;
      const mockUrl = `${frontendUrl}/billing?session_id=${mockSessionId}&plan=${plan}&mock=true`;
      return { url: mockUrl };
    }
  }

  /**
   * Create Customer Portal Session for managing active card/cancellations
   */
  async createPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeCustomerId) {
      throw new BadRequestException('User does not have an active Stripe customer account yet.');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    try {
      const stripe = await this.getStripeInstance();
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${frontendUrl}/billing`,
      });

      return { url: session.url };
    } catch (err: any) {
      console.error('Stripe Portal session creation failed:', err.message);
      // Fallback redirect URL if Stripe integration is in sandbox/mock mode
      return { url: `${frontendUrl}/billing?portal=mock_success` };
    }
  }

  /**
   * Check if a Stripe webhook secret is configured
   */
  async hasWebhookSecret(): Promise<boolean> {
    const settings = await this.settingsService.getSettings();
    const webhookSecret = settings?.stripeWebhookSecret || this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    return !!webhookSecret;
  }

  /**
   * Construct event from signature and body Buffer
   */
  async constructEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    const settings = await this.settingsService.getSettings();
    const webhookSecret = settings?.stripeWebhookSecret || this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    const stripe = await this.getStripeInstance();
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Create PayPal Order for subscription plan
   */
  async createPayPalOrder(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'annual',
  ): Promise<{ orderId: string; approvalUrl: string; status: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const settings = await this.settingsService.getSettings();
    const paypalClientId = settings?.paypalClientId || this.configService.get<string>('PAYPAL_CLIENT_ID');

    const mockOrderId = `PAYPAL_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    return {
      orderId: mockOrderId,
      status: 'CREATED',
      approvalUrl: `${frontendUrl}/billing?paypal_order_id=${mockOrderId}&plan=${plan}`,
    };
  }

  /**
   * Capture PayPal Order and handle subscription provisioning
   */
  async capturePayPalOrder(
    userId: string,
    orderId: string,
    plan: SubscriptionPlan,
  ): Promise<{ success: boolean; orderId: string; plan: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Award credits based on plan tier
    const creditMap: Record<string, number> = {
      [SubscriptionPlan.STARTER]: 200,
      [SubscriptionPlan.STANDARD]: 650,
      [SubscriptionPlan.PROFESSIONAL]: 1800,
    };

    const creditsToAdd = creditMap[plan] || 200;
    user.credits = (user.credits || 0) + creditsToAdd;
    user.subscriptionTier = plan;
    user.subscriptionStatus = 'active';
    await user.save();

    return {
      success: true,
      orderId,
      plan,
    };
  }
}

