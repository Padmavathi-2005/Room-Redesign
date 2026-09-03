import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, SubscriptionPlan } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionDocument } from './schemas/subscription-plan.schema';
import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import { CreditLedger, CreditLedgerDocument, CreditTransactionType } from './schemas/credit-ledger.schema';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreditPack, CreditPackDocument } from './schemas/credit-pack.schema';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SubscriptionPlanDefinition.name)
    private readonly planModel: Model<SubscriptionPlanDefinitionDocument>,
    @InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>,
    @InjectModel(CreditLedger.name) private readonly creditLedgerModel: Model<CreditLedgerDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(CreditPack.name) private readonly packModel: Model<CreditPackDocument>,
  ) {}

  /**
   * Seed canonical plans (free, starter, pro) ONLY when collection is empty.
   * Preserves admin configurations and real Stripe Price IDs.
   */
  async onModuleInit() {
    try {
      const count = await this.planModel.countDocuments().exec();
      if (count === 0) {
        console.log('🌱 Database has 0 plans. Seeding canonical plans (Free, Starter, Pro)...');
        const defaultPlans = [
          {
            name: 'Free Plan',
            code: 'free',
            priceMonthly: 0,
            priceAnnual: 0,
            credits: 0,
            validityDays: 30,
            description: 'Explore RoomAI design tools. Upgrade to receive generation credits.',
            features: [
              '0 Monthly Credits',
              'Standard Render Engines',
              'Access to Basic Design Categories',
              'Upgrade Anytime',
            ],
            accessibleModels: ['interior-design', 'floor-plan-generator', 'exterior-design', 'landscape-design'],
            stripePriceIdMonthly: '',
            stripePriceIdAnnual: '',
            isPopular: false,
            isActive: true,
          },
          {
            name: 'Starter Plan',
            code: 'starter',
            priceMonthly: 19,
            priceAnnual: 15,
            credits: 40,
            validityDays: 30,
            description: 'Ideal for homeowners & design enthusiasts starting single-room projects.',
            features: [
              '40 Generation Credits / month',
              '30-Day Billing Cycle',
              '8K UHD Architectural Quality',
              'All AI Design Tools',
              'Direct Stripe Billing',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'floor-plan-generator', 'sketch-to-render', 'landscape-design'],
            stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
            stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
            isPopular: true,
            isActive: true,
          },
          {
            name: 'Pro Plan',
            code: 'pro',
            priceMonthly: 39,
            priceAnnual: 31,
            credits: 100,
            validityDays: 30,
            description: 'For professional interior designers & architects needing priority generation.',
            features: [
              '100 Generation Credits / month',
              '30-Day Billing Cycle',
              'Priority Processing Queue',
              'Full 8K UHD Architectural Quality',
              'Multi-Room Project Consistency',
              'Priority Support',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'landscape-design', 'floor-plan-generator', '3d-floor-plan', 'sketch-to-render'],
            stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
            stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
            isPopular: false,
            isActive: true,
          },
        ];
        await this.planModel.insertMany(defaultPlans);
        console.log('✅ Canonical Subscription Plans seeded successfully!');
      } else {
        console.log(`ℹ️ Subscription plans exist (${count} found). Preserving existing plan definitions.`);
      }

      // Seed initial Credit Booster Packs if collection is empty
      const packCount = await this.packModel.countDocuments().exec();
      if (packCount === 0) {
        console.log('🌱 Seeding initial Credit Booster Packs (Quick Boost, Project Boost, Studio Reserve)...');
        const initialPacks = [
          {
            name: 'Quick Boost',
            code: 'quick-boost',
            description: 'Fast 20-credit booster for single room projects.',
            credits: 20,
            price: 12,
            currency: 'usd',
            validityDays: 1,
            eligiblePlans: ['starter', 'pro'],
            isActive: true,
            isPopular: false,
            sortOrder: 1,
            badge: 'QUICK BOOST',
          },
          {
            name: 'Project Boost',
            code: 'project-boost',
            description: 'Optimal 50-credit booster for active redesign projects.',
            credits: 50,
            price: 28,
            currency: 'usd',
            validityDays: 10,
            eligiblePlans: ['starter', 'pro'],
            isActive: true,
            isPopular: true,
            sortOrder: 2,
            badge: 'POPULAR BOOST',
          },
          {
            name: 'Studio Reserve',
            code: 'studio-reserve',
            description: 'High-volume 120-credit reserve for professional design studios.',
            credits: 120,
            price: 60,
            currency: 'usd',
            validityDays: 30,
            eligiblePlans: ['pro'],
            isActive: true,
            isPopular: false,
            sortOrder: 3,
            badge: 'STUDIO RESERVE',
          },
        ];
        await this.packModel.insertMany(initialPacks);
        console.log('✅ Initial Credit Booster Packs seeded successfully!');
      }

      // Clean up old mock test credit lots (PLAN $19, BONUS, REFUND) across all users in MongoDB
      await this.userModel.updateMany(
        {},
        {
          $pull: {
            creditLots: {
              source: { $in: ['PLAN $19', 'BONUS', 'REFUND'] },
            },
          },
        },
      ).exec();

      // Clean up mock credit ledgers
      await this.creditLedgerModel.deleteMany({
        description: { $regex: /PLAN \$19|Test Admin Grant/i },
      }).exec();

      console.log('🧹 Cleaned up legacy mock credit test lots from MongoDB!');
    } catch (err: any) {
      console.error('Failed to initialize subscription plans & packs:', err.message);
    }
  }

  /**
   * Get credit allowance by plan code
   */
  async getCreditAllowance(planCode: string): Promise<number> {
    const code = planCode.toLowerCase().trim();
    const plan = await this.planModel.findOne({ code, isActive: true }).exec();
    if (plan) {
      return plan.credits;
    }
    switch (code) {
      case 'pro':
        return 100;
      case 'starter':
        return 40;
      case 'free':
      default:
        return 0;
    }
  }

  /**
   * Atomically deduct credits from user balance using Earliest-Expiry-First (FEFO) order,
   * cleaning up expired credit lots with EXPIRY ledger entries.
   */
  async deductCreditsAtomic(
    userId: string,
    cost: number,
    description: string,
    metadata: Record<string, any> = {},
  ): Promise<UserDocument> {
    if (cost <= 0) {
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Process expired lots & write EXPIRY ledger entries
    if (user.creditLots && user.creditLots.length > 0) {
      let updatedAny = false;
      for (const lot of user.creditLots) {
        if (lot.expiryDate && lot.expiryDate < todayStr && (lot.remainingCredits || 0) > 0) {
          const expiredAmt = lot.remainingCredits;
          lot.remainingCredits = 0;
          updatedAny = true;

          const currentBal = (user.credits || 0) - expiredAmt;
          await this.creditLedgerModel.create({
            userId: user._id,
            amount: -expiredAmt,
            balanceAfter: Math.max(0, currentBal),
            type: CreditTransactionType.EXPIRY,
            description: `Credit Lot Expired: ${lot.source} (-${expiredAmt} Credits)`,
            metadata: { lotId: lot.lotId, expiryDate: lot.expiryDate },
          });
        }
      }
      if (updatedAny && typeof (user as any).markModified === 'function') {
        user.markModified('creditLots');
      }
    }

    // Recalculate available active unexpired credits
    const activeUnexpiredLots = (user.creditLots || []).filter(
      (lot) => !lot.expiryDate || lot.expiryDate >= todayStr,
    );
    const availableCredits = activeUnexpiredLots.reduce((sum, l) => sum + (l.remainingCredits || 0), 0);

    if (availableCredits < cost) {
      user.credits = availableCredits;
      await user.save();
      throw new BadRequestException(
        `Insufficient AI credits. Required: ${cost}, available unexpired: ${availableCredits}. Please upgrade your plan or purchase a credit booster.`,
      );
    }

    // 2. Earliest-Expiry-First (FEFO) Sort: Sort active lots by expiryDate ASCENDING
    activeUnexpiredLots.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return a.expiryDate.localeCompare(b.expiryDate);
    });

    // 3. Deduct cost from earliest expiring lots
    let costRemaining = cost;
    for (const lot of activeUnexpiredLots) {
      if (costRemaining > 0 && lot.remainingCredits > 0) {
        const deductAmt = Math.min(lot.remainingCredits, costRemaining);
        lot.remainingCredits -= deductAmt;
        costRemaining -= deductAmt;
      }
    }

    // 4. Update user.credits to exact sum of active remaining credits
    user.credits = activeUnexpiredLots.reduce((sum, l) => sum + l.remainingCredits, 0);
    if (typeof (user as any).markModified === 'function') {
      user.markModified('creditLots');
    }
    await user.save();

    // 5. Create DEDUCTION ledger entry
    await this.creditLedgerModel.create({
      userId: user._id,
      amount: -cost,
      balanceAfter: user.credits,
      type: CreditTransactionType.DEDUCTION,
      description,
      metadata,
    });

    return user;
  }

  /**
   * Atomically refund credits to user balance (e.g. after generation failure) restoring to active lot
   */
  async refundCreditsAtomic(
    userId: string,
    cost: number,
    description: string,
    metadata: Record<string, any> = {},
  ): Promise<UserDocument> {
    if (cost <= 0) {
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    user.credits = (user.credits || 0) + cost;

    if (user.creditLots && user.creditLots.length > 0) {
      user.creditLots[0].remainingCredits = (user.creditLots[0].remainingCredits || 0) + cost;
      if (typeof (user as any).markModified === 'function') {
        user.markModified('creditLots');
      }
    }

    await user.save();

    await this.creditLedgerModel.create({
      userId: user._id,
      amount: cost,
      balanceAfter: user.credits,
      type: CreditTransactionType.REFUND,
      description,
      metadata,
    });

    return user;
  }

  /**
   * Manual admin credit adjustment with required CreditLedger entry
   */
  async adminAdjustCredits(
    targetUserId: string,
    newBalance?: number,
    delta?: number,
    description: string = 'Manual Admin Credit Adjustment',
    metadata: Record<string, any> = {},
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(targetUserId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    const currentBalance = user.credits ?? 0;
    let targetBalance = currentBalance;

    if (newBalance !== undefined) {
      targetBalance = Math.max(0, newBalance);
    } else if (delta !== undefined) {
      targetBalance = Math.max(0, currentBalance + delta);
    }

    const changeAmount = targetBalance - currentBalance;
    user.credits = targetBalance;
    await user.save();

    await this.creditLedgerModel.create({
      userId: user._id,
      amount: changeAmount,
      balanceAfter: targetBalance,
      type: CreditTransactionType.ADJUSTMENT,
      description,
      metadata: { ...metadata, previousBalance: currentBalance },
    });

    return user;
  }

  /**
   * Grant or refill credits upon verified Stripe subscription payment events.
   * Dynamically resolves credits from database plan definition.
   */
  async grantSubscriptionCredits(
    userId: string,
    planCode: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    periodEnd: Date,
    billingCycle: string = 'monthly',
    periodStart: Date = new Date(),
    stripeSessionId: string = '',
    amountPaid?: number,
    invoicePdfUrl: string = '',
  ): Promise<UserDocument> {
    const code = planCode.toLowerCase().trim();
    const planDef = await this.planModel.findOne({ code, isActive: true }).exec();
    const targetPlan = code === 'pro' ? SubscriptionPlan.PRO : code === 'starter' ? SubscriptionPlan.STARTER : SubscriptionPlan.FREE;

    // Honor database plan definition credits dynamically
    const creditsToGrant = planDef ? planDef.credits : (targetPlan === SubscriptionPlan.PRO ? 100 : targetPlan === SubscriptionPlan.STARTER ? 40 : 0);
    const subscriptionTier = targetPlan === SubscriptionPlan.PRO ? 'Pro Plan' : targetPlan === SubscriptionPlan.STARTER ? 'Starter Plan' : 'Free Plan';

    // Read current user to check idempotency (read-only, never .save() on this doc)
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Period-level Idempotency Check: Avoid double crediting if same period was already refilled
    const isSamePeriod =
      existingUser.lastRefilledPeriodEnd &&
      new Date(existingUser.lastRefilledPeriodEnd).getTime() === periodEnd.getTime();

    if (!isSamePeriod) {
      const newLot = {
        lotId: `lot-${Date.now()}`,
        source: `${subscriptionTier} (${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)})`,
        initialCredits: creditsToGrant,
        remainingCredits: creditsToGrant,
        startDate: periodStart.toISOString().split('T')[0],
        expiryDate: periodEnd.toISOString().split('T')[0],
      };

      // Atomic update — avoids Mongoose VersionError race with concurrent webhook + return-sync
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            plan: targetPlan,
            subscriptionTier,
            stripeCustomerId,
            stripeSubscriptionId,
            subscriptionPeriodStart: periodStart,
            subscriptionPeriodEnd: periodEnd,
            subscriptionStatus: 'active',
            credits: creditsToGrant,
            lastRefilledPeriodEnd: periodEnd,
          },
          $push: {
            creditLots: { $each: [newLot], $position: 0 },
          },
        },
        { new: true },
      ).exec();

      const idempotencyKey = `${stripeSubscriptionId}:${periodEnd.getTime()}`;
      await this.creditLedgerModel.create({
        userId: existingUser._id,
        amount: creditsToGrant,
        balanceAfter: creditsToGrant,
        type: CreditTransactionType.GRANT,
        description: `Subscription Provisioned: ${subscriptionTier}`,
        metadata: { stripeCustomerId, stripeSubscriptionId, planCode: code, billingCycle, idempotencyKey, periodEnd: periodEnd.toISOString() },
      });

      // Save Database Invoice if sessionId or invoice details provided
      const invId = stripeSessionId || `inv_${stripeSubscriptionId}_${periodEnd.getTime()}`;
      await this.invoiceModel.create({
        userId: existingUser._id,
        stripeInvoiceId: invId,
        stripeSessionId: stripeSessionId || invId,
        amountPaid: amountPaid !== undefined ? amountPaid : (targetPlan === SubscriptionPlan.PRO ? 39 : 19),
        currency: 'usd',
        status: 'paid',
        planCode: code,
        billingCycle,
        paymentMethod: 'Stripe',
        invoicePdfUrl,
        paidAt: new Date(),
      }).catch((err) => console.warn(`Duplicate invoice record ignored (${invId}): ${err.message}`));
    } else {
      // Same period: just ensure subscription fields are up-to-date atomically
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            plan: targetPlan,
            subscriptionTier,
            stripeCustomerId,
            stripeSubscriptionId,
            subscriptionPeriodStart: periodStart,
            subscriptionPeriodEnd: periodEnd,
            subscriptionStatus: 'active',
          },
        },
        { new: true },
      ).exec();
    }

    // Return fresh user doc
    return this.userModel.findById(userId).exec();
  }

  /**
   * Provision one-time credit pack after verified Stripe payment (Return-Sync + Webhook)
   */
  async grantCreditPack(
    userId: string,
    packCodeOrId: string,
    stripeSessionId: string,
    amountPaid?: number,
    invoicePdfUrl: string = '',
  ): Promise<UserDocument> {
    // Idempotency check FIRST — before loading user doc
    const existingInvoice = await this.invoiceModel.findOne({ stripeSessionId }).exec();
    const existingLedger = await this.creditLedgerModel.findOne({ 'metadata.stripeSessionId': stripeSessionId }).exec();
    if (existingInvoice || existingLedger) {
      console.log(`ℹ️ Credit pack payment [${stripeSessionId}] already provisioned. Skipping idempotently.`);
      return this.userModel.findById(userId).exec();
    }

    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Resolve CreditPack from database
    const cleanCode = (packCodeOrId || '').toLowerCase().trim();
    let pack = await this.packModel.findOne({
      $or: [
        { code: cleanCode },
        { _id: packCodeOrId && packCodeOrId.length === 24 ? packCodeOrId : undefined },
      ],
    }).exec();

    if (!pack) {
      pack = await this.packModel.findOne({ isActive: true }).sort({ sortOrder: 1 }).exec();
    }

    if (!pack) {
      throw new NotFoundException(`Credit pack "${packCodeOrId}" not found`);
    }

    const today = new Date();
    const expiry = new Date(today.getTime() + pack.validityDays * 24 * 60 * 60 * 1000);
    const startDateStr = today.toISOString().split('T')[0];
    const expiryDateStr = expiry.toISOString().split('T')[0];

    const newLot = {
      lotId: `lot-pack-${Date.now()}`,
      source: `BOOSTER: ${pack.name.toUpperCase()} (+${pack.credits} CR)`,
      initialCredits: pack.credits,
      remainingCredits: pack.credits,
      startDate: startDateStr,
      expiryDate: expiryDateStr,
      stripeSessionId,
      packId: pack._id.toString(),
    };

    const currentCredits = (existingUser.credits || 0);
    const newBalance = currentCredits + pack.credits;

    // Atomic update — avoids Mongoose VersionError race with concurrent webhook + return-sync
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: { credits: newBalance },
        $push: { creditLots: { $each: [newLot], $position: 0 } },
      },
      { new: true },
    ).exec();

    // Create CreditLedger GRANT entry
    await this.creditLedgerModel.create({
      userId: existingUser._id,
      amount: pack.credits,
      balanceAfter: newBalance,
      type: CreditTransactionType.GRANT,
      description: `Credit Booster Purchased: ${pack.name} (+${pack.credits} Credits)`,
      metadata: {
        stripeSessionId,
        packCode: pack.code,
        validityDays: pack.validityDays,
        expiryDate: expiryDateStr,
      },
    });

    // Create Invoice record
    await this.invoiceModel.create({
      userId: existingUser._id,
      stripeInvoiceId: stripeSessionId,
      stripeSessionId,
      amountPaid: amountPaid !== undefined ? amountPaid : pack.price,
      currency: pack.currency || 'usd',
      status: 'paid',
      planCode: pack.code,
      billingCycle: 'one-time',
      paymentMethod: 'Stripe Credit Pack',
      invoicePdfUrl,
      paidAt: new Date(),
    }).catch((err) => console.warn(`Duplicate pack invoice ignored (${stripeSessionId}): ${err.message}`));

    return this.userModel.findById(userId).exec();
  }

  /**
   * Verified server-side Stripe Checkout Session confirmation (Return-Sync reconciliation)
   * Supports both subscription and one-time credit pack sessions.
   */
  async confirmCheckoutSuccess(
    authenticatedUserId: string,
    sessionId: string,
  ): Promise<UserDocument> {
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      throw new BadRequestException('Stripe Session ID parameter is required for checkout verification.');
    }

    const cleanSessionId = sessionId.trim();
    const settings = await this.settingModel.findOne().exec();
    const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new BadRequestException('Stripe Secret Key is not configured in server settings or environment variables.');
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any });

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(cleanSessionId, {
        expand: ['subscription'],
      });
    } catch (err: any) {
      throw new BadRequestException(`Stripe session retrieval failed: ${err.message || 'Invalid Session ID'}`);
    }

    if (session.status !== 'complete') {
      throw new BadRequestException(`Stripe Checkout session status is "${session.status}". Expected "complete".`);
    }

    // User ownership verification
    const sessionUserId = session.client_reference_id || session.metadata?.userId;
    if (!sessionUserId || sessionUserId !== authenticatedUserId) {
      throw new ForbiddenException('Checkout session does not belong to the authenticated user.');
    }

    const purchaseType = session.metadata?.purchaseType;
    if (purchaseType === 'credit_pack' || session.mode === 'payment') {
      const packCode = session.metadata?.packCode || session.metadata?.packId || '';
      const amountPaid = (session.amount_total || 0) / 100;
      return this.grantCreditPack(
        authenticatedUserId,
        packCode,
        session.id,
        amountPaid,
        session.url || '',
      );
    }

    if (session.mode !== 'subscription') {
      throw new BadRequestException(`Stripe Checkout session mode is "${session.mode}". Expected "subscription" or "payment".`);
    }

    const subObj = typeof session.subscription === 'object' ? (session.subscription as Stripe.Subscription) : null;
    const subId = subObj ? subObj.id : (typeof session.subscription === 'string' ? session.subscription : '');
    const customerId = (typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id) || '';

    if (!subId || !customerId) {
      throw new BadRequestException('Checkout session does not contain valid Stripe customer or subscription ID.');
    }

    // Real period dates from Stripe Subscription object
    const subAny = subObj as any;
    const periodStart = subAny?.current_period_start ? new Date(subAny.current_period_start * 1000) : new Date();
    const periodEnd = subAny?.current_period_end ? new Date(subAny.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const planCode = session.metadata?.planCode || session.metadata?.plan || 'starter';
    const billingCycle = session.metadata?.billingCycle || 'monthly';
    const amountPaid = (session.amount_total || 0) / 100;

    return this.grantSubscriptionCredits(
      authenticatedUserId,
      planCode,
      customerId,
      subId,
      periodEnd,
      billingCycle,
      periodStart,
      session.id,
      amountPaid,
      session.url || '',
    );
  }

  /**
   * Update subscription status when cancelled or expired
   */
  async handleSubscriptionCancellation(stripeSubscriptionId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ stripeSubscriptionId }).exec();
    if (!user) return null;

    const now = new Date();
    const isExpired = !user.subscriptionPeriodEnd || now > new Date(user.subscriptionPeriodEnd);
    if (isExpired) {
      user.plan = SubscriptionPlan.FREE;
      user.subscriptionTier = 'Free Plan';
      user.subscriptionStatus = 'cancelled';
      user.credits = 0;
      return user.save();
    }
    user.subscriptionStatus = 'cancelled';
    return user.save();
  }

  /**
   * Fetch subscription & credit details for a given user
   */
  async getSubscriptionStatus(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const now = new Date();
    const isExpired = user.subscriptionPeriodEnd && now > new Date(user.subscriptionPeriodEnd);
    const daysRemaining = user.subscriptionPeriodEnd
      ? Math.max(0, Math.ceil((new Date(user.subscriptionPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      plan: isExpired && user.plan !== SubscriptionPlan.FREE ? SubscriptionPlan.FREE : user.plan,
      subscriptionTier: user.subscriptionTier || 'Free Plan',
      credits: user.credits || 0,
      subscriptionStatus: user.subscriptionStatus || 'active',
      subscriptionPeriodStart: user.subscriptionPeriodStart,
      subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      daysRemaining,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      creditLots: user.creditLots || [],
    };
  }

  /**
   * Fetch credit ledger for a given user
   */
  async getCreditLedger(userId: string) {
    return this.creditLedgerModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  /**
   * Fetch invoices for a given user from database
   */
  async getUserInvoices(userId: string) {
    return this.invoiceModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  /**
   * Get all active subscription plans
   */
  async getPlans(includeInactive = false): Promise<SubscriptionPlanDefinition[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.planModel.find(filter).sort({ priceMonthly: 1 }).exec();
  }

  /**
   * Create a checkout session on Stripe
   */
  async createCheckoutSession(
    userId: string,
    planCode: string,
    billingCycle: 'monthly' | 'annual' = 'monthly',
    successUrl?: string,
    cancelUrl?: string,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const planCodeLower = planCode.toLowerCase().trim();
    const planDef = await this.planModel.findOne({ code: planCodeLower, isActive: true }).exec();

    if (!planDef) {
      throw new NotFoundException(`Subscription plan "${planCode}" is invalid or inactive`);
    }

    const settings = await this.settingModel.findOne().exec();
    const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new BadRequestException(
        'Stripe Secret Key is not configured in server settings or environment variables.',
      );
    }

    const priceId = billingCycle === 'annual'
      ? planDef.stripePriceIdAnnual
      : planDef.stripePriceIdMonthly;

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any });

    const defaultSuccess = 'http://localhost:3000/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}';
    let finalSuccessUrl = successUrl || defaultSuccess;
    if (!finalSuccessUrl.includes('{CHECKOUT_SESSION_ID}')) {
      const joinChar = finalSuccessUrl.includes('?') ? '&' : '?';
      finalSuccessUrl = `${finalSuccessUrl}${joinChar}session_id={CHECKOUT_SESSION_ID}`;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: userId,
      metadata: {
        userId,
        planCode: planCodeLower,
        billingCycle,
      },
      success_url: finalSuccessUrl,
      cancel_url: cancelUrl || 'http://localhost:3000/billing?checkout=cancel',
    };

    if (priceId && priceId.startsWith('price_') && !priceId.includes('mock')) {
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      const priceMonthly = billingCycle === 'annual' ? planDef.priceAnnual : planDef.priceMonthly;
      const unitAmountCents = Math.round((billingCycle === 'annual' ? priceMonthly * 12 : priceMonthly) * 100);
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planDef.name,
              description: `${planDef.name} (${billingCycle} subscription)`,
            },
            unit_amount: unitAmountCents,
            recurring: { interval: billingCycle === 'annual' ? 'year' : 'month' },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return { url: session.url, sessionId: session.id };
  }

  /**
   * Admin plan creation
   */
  async createPlan(planData: Partial<SubscriptionPlanDefinition>): Promise<SubscriptionPlanDefinition> {
    const existing = await this.planModel.findOne({ code: planData.code?.toLowerCase() }).exec();
    if (existing) {
      throw new BadRequestException(`Plan code "${planData.code}" already exists`);
    }
    const newPlan = new this.planModel({
      ...planData,
      code: planData.code?.toLowerCase(),
    });
    return newPlan.save();
  }

  /**
   * Admin plan update
   */
  async updatePlan(id: string, planData: Partial<SubscriptionPlanDefinition>): Promise<SubscriptionPlanDefinition> {
    const updated = await this.planModel.findByIdAndUpdate(id, planData, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Plan not found');
    }
    return updated;
  }

  /**
   * Admin plan deletion
   */
  async deletePlan(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Plan not found');
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                           CREDIT PACK BOOSTER METHODS                      */
  /* -------------------------------------------------------------------------- */

  /**
   * Customer: Fetch active credit packs eligible for user's currently active paid plan
   */
  async getEligibleCreditPacks(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const isExpired = user.subscriptionPeriodEnd && now > new Date(user.subscriptionPeriodEnd);
    const userPlanCode = (user.plan || 'free').toLowerCase().trim();
    const status = (user.subscriptionStatus || 'active').toLowerCase().trim();

    // Business Rules:
    // - Free users must not see or buy credit packs
    // - Expired, past_due, unpaid, or canceled (expired) users cannot buy credit packs
    // - Users with active Starter/Pro or cancel-at-period-end before expiry may buy packs
    const isPaidPlan = ['starter', 'pro'].includes(userPlanCode);
    const isValidStatus = ['active', 'canceling', 'cancel_at_period_end'].includes(status);
    const isEligible = isPaidPlan && isValidStatus && !isExpired;

    if (!isEligible) {
      return {
        isEligible: false,
        activePlan: userPlanCode,
        message: 'One-time credit booster packs are exclusively available to active Starter and Pro subscribers.',
        packs: [],
      };
    }

    const packs = await this.packModel
      .find({
        isActive: true,
        eligiblePlans: userPlanCode,
      })
      .sort({ sortOrder: 1, price: 1 })
      .exec();

    return {
      isEligible: true,
      activePlan: userPlanCode,
      message: 'Active credit booster packs available for purchase.',
      packs,
    };
  }

  /**
   * Customer: Create Stripe Checkout session for one-time credit booster pack
   */
  async createCreditPackCheckoutSession(
    userId: string,
    packCodeOrId: string,
    successUrl?: string,
    cancelUrl?: string,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const isExpired = user.subscriptionPeriodEnd && now > new Date(user.subscriptionPeriodEnd);
    const userPlanCode = (user.plan || 'free').toLowerCase().trim();
    const status = (user.subscriptionStatus || 'active').toLowerCase().trim();

    const isPaidPlan = ['starter', 'pro'].includes(userPlanCode);
    const isValidStatus = ['active', 'canceling', 'cancel_at_period_end'].includes(status);
    const isEligible = isPaidPlan && isValidStatus && !isExpired;

    if (!isEligible) {
      throw new ForbiddenException(
        'One-time credit booster packs are exclusively available to active Starter and Pro subscribers. Please subscribe to a paid plan first.',
      );
    }

    const cleanCode = (packCodeOrId || '').toLowerCase().trim();
    const pack = await this.packModel.findOne({
      $or: [
        { code: cleanCode },
        { _id: packCodeOrId && packCodeOrId.length === 24 ? packCodeOrId : undefined },
      ],
      isActive: true,
    }).exec();

    if (!pack) {
      throw new NotFoundException(`Credit booster pack "${packCodeOrId}" is invalid or inactive.`);
    }

    if (!pack.eligiblePlans.includes(userPlanCode)) {
      throw new ForbiddenException(
        `Credit pack "${pack.name}" is not eligible for your current ${userPlanCode.toUpperCase()} subscription tier.`,
      );
    }

    const settings = await this.settingModel.findOne().exec();
    const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new BadRequestException(
        'Stripe Secret Key is not configured in server settings or environment variables.',
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any });

    const defaultSuccess = 'http://localhost:3000/billing?checkout=success&purchase_type=credit_pack&session_id={CHECKOUT_SESSION_ID}';
    let finalSuccessUrl = successUrl || defaultSuccess;
    if (!finalSuccessUrl.includes('{CHECKOUT_SESSION_ID}')) {
      const joinChar = finalSuccessUrl.includes('?') ? '&' : '?';
      finalSuccessUrl = `${finalSuccessUrl}${joinChar}session_id={CHECKOUT_SESSION_ID}`;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: userId,
      metadata: {
        purchaseType: 'credit_pack',
        userId,
        packId: pack._id.toString(),
        packCode: pack.code,
        credits: pack.credits.toString(),
        validityDays: pack.validityDays.toString(),
      },
      success_url: finalSuccessUrl,
      cancel_url: cancelUrl || 'http://localhost:3000/billing?checkout=cancel',
    };

    if (pack.stripePriceId && pack.stripePriceId.startsWith('price_') && !pack.stripePriceId.includes('mock')) {
      sessionParams.line_items = [{ price: pack.stripePriceId, quantity: 1 }];
    } else {
      sessionParams.line_items = [
        {
          price_data: {
            currency: pack.currency || 'usd',
            product_data: {
              name: `RoomAI Booster: ${pack.name}`,
              description: `${pack.credits} AI Generation Credits (${pack.validityDays}-Day Validity)`,
            },
            unit_amount: Math.round(pack.price * 100),
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return { url: session.url, sessionId: session.id };
  }

  /**
   * Admin: Fetch all credit packs
   */
  async getAllCreditPacksAdmin(): Promise<CreditPack[]> {
    return this.packModel.find().sort({ sortOrder: 1, createdAt: -1 }).exec();
  }

  /**
   * Admin: Create new credit pack
   */
  async createCreditPack(packData: Partial<CreditPack>): Promise<CreditPack> {
    if (!packData.name || !packData.code) {
      throw new BadRequestException('Credit pack name and unique code are required.');
    }
    if ((packData.credits || 0) <= 0) {
      throw new BadRequestException('Credit amount must be greater than 0.');
    }
    if ((packData.price || 0) <= 0) {
      throw new BadRequestException('Price must be greater than 0.');
    }
    if ((packData.validityDays || 0) <= 0) {
      throw new BadRequestException('Validity days must be greater than 0.');
    }

    const code = packData.code.toLowerCase().trim();
    const existing = await this.packModel.findOne({ code }).exec();
    if (existing) {
      throw new BadRequestException(`Credit pack with code "${code}" already exists.`);
    }

    const newPack = new this.packModel({
      ...packData,
      code,
      eligiblePlans: packData.eligiblePlans || ['starter', 'pro'],
    });
    return newPack.save();
  }

  /**
   * Admin: Update credit pack
   */
  async updateCreditPack(id: string, packData: Partial<CreditPack>): Promise<CreditPack> {
    const pack = await this.packModel.findById(id).exec();
    if (!pack) {
      throw new NotFoundException(`Credit pack with ID ${id} not found.`);
    }

    if (packData.credits !== undefined && packData.credits <= 0) {
      throw new BadRequestException('Credit amount must be greater than 0.');
    }
    if (packData.price !== undefined && packData.price <= 0) {
      throw new BadRequestException('Price must be greater than 0.');
    }
    if (packData.validityDays !== undefined && packData.validityDays <= 0) {
      throw new BadRequestException('Validity days must be greater than 0.');
    }

    if (packData.code && packData.code.toLowerCase().trim() !== pack.code) {
      const newCode = packData.code.toLowerCase().trim();
      const duplicate = await this.packModel.findOne({ code: newCode }).exec();
      if (duplicate) {
        throw new BadRequestException(`Credit pack with code "${newCode}" already exists.`);
      }
      pack.code = newCode;
    }

    Object.assign(pack, packData);
    return pack.save();
  }

  /**
   * Admin: Delete credit pack
   */
  async deleteCreditPack(id: string): Promise<{ success: boolean }> {
    const res = await this.packModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`Credit pack with ID ${id} not found.`);
    }
    return { success: true };
  }
}
