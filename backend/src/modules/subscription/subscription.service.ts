import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, SubscriptionPlan } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionDocument, PlanTranslation } from './schemas/subscription-plan.schema';
import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import { CreditLedger, CreditLedgerDocument, CreditTransactionType } from './schemas/credit-ledger.schema';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { NotificationsService } from '../notifications/notifications.service';
import Stripe from 'stripe';

const CANONICAL_PLAN_TRANSLATIONS: Record<string, PlanTranslation[]> = {
  free: [
    {
      languageCode: 'en',
      name: 'Free Plan',
      description: 'Explore RoomAI design tools. Upgrade to receive generation credits.',
      features: [
        'Initial Credits 0',
        'Day Validity Cycle 30',
        'Standard AI Render Engines',
        'Access to All Design Categories',
        'Automatic 30-Day Cycle Renewal',
      ],
    },
    {
      languageCode: 'ar',
      name: 'الخطة المجانية',
      description: 'استكشف أدوات تصميم RoomAI. قم بالترقية إلى خطة مدفوعة للحصول على رصيد التوليد.',
      features: [
        'رصيد أولي 0 نقطة',
        'دورة صلاحية 30 يوماً',
        'محركات تصيير بالذكاء الاصطناعي قياسية',
        'الوصول إلى كافة فئات وأقسام التصميم',
        'تجديد تلقائي لدورة 30 يوماً',
      ],
    },
    {
      languageCode: 'fr',
      name: 'Plan Gratuit',
      description: 'Explorez les outils RoomAI. Passez à un forfait payant pour recevoir des crédits.',
      features: [
        'Crédits Initiaux 0',
        'Cycle de Validité de 30 Jours',
        'Moteurs de Rendu IA Standard',
        'Accès à Toutes les Catégories de Design',
        'Renouvellement Automatique de 30 Jours',
      ],
    },
  ],
  starter: [
    {
      languageCode: 'en',
      name: 'Starter Plan',
      description: 'Ideal for homeowners & design enthusiasts starting single-room projects.',
      features: [
        'Generation Credits / month 40',
        'Day Billing Cycle 30',
        '8K UHD Architectural Quality',
        'All 12+ AI Design Tools',
        'Requires Completed Payment',
      ],
    },
    {
      languageCode: 'ar',
      name: 'خطة المبتدئين',
      description: 'مثالية لأصحاب المنازل ومحبي التصميم لبدء مشاريع الغرف الفردية.',
      features: [
        'رصيد توليد شهرياً 40 نقطة',
        'دورة فوترة مدتها 30 يوماً',
        'جودة معمارية فائقة الدقة 8K UHD',
        'كافة أدوات التصميم بالذكاء الاصطناعي 12+',
        'تتطلب إتمام عملية الدفع',
      ],
    },
    {
      languageCode: 'fr',
      name: 'Plan Débutant',
      description: 'Idéal pour les propriétaires et passionnés de design débutant des projets simples.',
      features: [
        'Crédits de Génération / mois 40',
        'Cycle de Facturation de 30 Jours',
        'Qualité Architecturale 8K UHD',
        'Tous les 12+ Outils de Design IA',
        'Paiement Validé Requis',
      ],
    },
  ],
  pro: [
    {
      languageCode: 'en',
      name: 'Pro Plan',
      description: 'For professional interior designers & architects needing priority generation.',
      features: [
        'Generation Credits / month 100',
        'Day Billing Cycle 30',
        'Priority Processing Queue',
        'Full 8K UHD Architectural Quality',
        'Multi-Room Project Consistency',
        'Priority Email & Chat Support',
      ],
    },
    {
      languageCode: 'ar',
      name: 'خطة المحترفين',
      description: 'للمصممين الداخليين والمعماريين المحترفين الذين يحتاجون لأولوية المعالجة والتوليد.',
      features: [
        'رصيد توليد شهرياً 100 نقطة',
        'دورة فوترة مدتها 30 يوماً',
        'أولوية في طابور المعالجة السريعة',
        'جودة معمارية فائقة الدقة 8K UHD بالكامل',
        'تناسق مشاريع الغرف المتعددة',
        'دعم ذو أولوية عبر البريد والدردشة',
      ],
    },
    {
      languageCode: 'fr',
      name: 'Plan Pro',
      description: 'Pour les designers d’intérieur et architectes ayant besoin d’une génération prioritaire.',
      features: [
        'Crédits de Génération / mois 100',
        'Cycle de Facturation de 30 Jours',
        'File d’Attente Prioritaire',
        'Qualité Architecturale Complète 8K UHD',
        'Cohérence des Projets Multi-Pièces',
        'Support Prioritaire E-mail et Chat',
      ],
    },
  ],
};

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SubscriptionPlanDefinition.name)
    private readonly planModel: Model<SubscriptionPlanDefinitionDocument>,
    @InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>,
    @InjectModel(CreditLedger.name) private readonly creditLedgerModel: Model<CreditLedgerDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly notificationsService: NotificationsService,
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
              'Initial Credits 0',
              'Day Validity Cycle 30',
              'Standard AI Render Engines',
              'Access to All Design Categories',
              'Automatic 30-Day Cycle Renewal',
            ],
            accessibleModels: ['interior-design', 'floor-plan-generator', 'exterior-design', 'landscape-design'],
            stripePriceIdMonthly: '',
            stripePriceIdAnnual: '',
            isPopular: false,
            isActive: true,
            translations: CANONICAL_PLAN_TRANSLATIONS.free,
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
              'Generation Credits / month 40',
              'Day Billing Cycle 30',
              '8K UHD Architectural Quality',
              'All 12+ AI Design Tools',
              'Requires Completed Payment',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'floor-plan-generator', 'sketch-to-render', 'landscape-design'],
            stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
            stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
            isPopular: true,
            isActive: true,
            translations: CANONICAL_PLAN_TRANSLATIONS.starter,
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
              'Day Billing Cycle 30',
              'Priority Processing Queue',
              'Full 8K UHD Architectural Quality',
              'Multi-Room Project Consistency',
              'Priority Email & Chat Support',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'landscape-design', 'floor-plan-generator', '3d-floor-plan', 'sketch-to-render'],
            stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
            stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
            isPopular: false,
            isActive: true,
            translations: CANONICAL_PLAN_TRANSLATIONS.pro,
          },
        ];
        await this.planModel.insertMany(defaultPlans);
        console.log('✅ Canonical Subscription Plans seeded successfully!');
      } else {
        console.log(`ℹ️ Subscription plans exist (${count} found). Preserving existing plan definitions.`);
        // Ensure all existing canonical plans have their translations seeded/updated
        for (const [code, translations] of Object.entries(CANONICAL_PLAN_TRANSLATIONS)) {
          await this.planModel.updateOne(
            {
              code,
              $or: [
                { translations: { $exists: false } },
                { translations: { $size: 0 } },
              ],
            },
            { $set: { translations } },
          ).exec();
        }
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

      // Backfill and ensure every user has only ONE active plan and correct subscriptionPlanId
      const [freePlanDoc, starterPlanDoc, proPlanDoc] = await Promise.all([
        this.planModel.findOne({ code: 'free' }).exec(),
        this.planModel.findOne({ code: 'starter' }).exec(),
        this.planModel.findOne({ code: 'pro' }).exec(),
      ]);

      if (freePlanDoc) {
        await this.userModel.updateMany(
          {
            $or: [
              { plan: SubscriptionPlan.FREE },
              { plan: { $exists: false } },
              { plan: null },
              { subscriptionTier: { $regex: /free/i } },
            ],
            subscriptionPlanId: { $exists: false },
          },
          {
            $set: {
              plan: SubscriptionPlan.FREE,
              subscriptionTier: 'Free Plan',
              subscriptionPlanId: freePlanDoc._id,
            },
          },
        ).exec();
      }

      if (starterPlanDoc) {
        await this.userModel.updateMany(
          {
            plan: SubscriptionPlan.STARTER,
            subscriptionPlanId: { $exists: false },
          },
          {
            $set: {
              subscriptionPlanId: starterPlanDoc._id,
              subscriptionTier: 'Starter Plan',
            },
          },
        ).exec();
      }

      if (proPlanDoc) {
        await this.userModel.updateMany(
          {
            plan: SubscriptionPlan.PRO,
            subscriptionPlanId: { $exists: false },
          },
          {
            $set: {
              subscriptionPlanId: proPlanDoc._id,
              subscriptionTier: 'Pro Plan',
            },
          },
        ).exec();
      }

      console.log('🧹 Cleaned up legacy mock credit test lots from MongoDB and synchronized user subscriptionPlanIds!');
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
   * cleaning up expired credit lots with EXPIRY ledger entries, and using Optimistic Concurrency Locking.
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

    const idempotencyKey = metadata.idempotencyKey || metadata.generationId || metadata.roomId || metadata.requestId;

    // 1. Deduction Idempotency Check: Prevent charging twice for retried requests
    if (idempotencyKey) {
      const existingDeduction = await this.creditLedgerModel.findOne({
        userId,
        referenceId: idempotencyKey,
        type: { $in: [CreditTransactionType.GENERATION_DEDUCTION, CreditTransactionType.DEDUCTION] },
      }).exec();

      if (existingDeduction) {
        console.log(`ℹ️ Generation deduction [${idempotencyKey}] already processed. Returning user state idempotently.`);
        const user = await this.userModel.findById(userId).exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
      }
    }

    const maxRetries = 3;
    const now = new Date();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new NotFoundException('User not found');

      const initialBalance = user.credits ?? 0;

      // 1b. Initialize creditLots if user has balance but no lots
      if (!user.creditLots || user.creditLots.length === 0) {
        if (initialBalance > 0) {
          user.creditLots = [{
            lotId: `lot_legacy_${user._id}_${Date.now()}`,
            source: 'initial_balance',
            amount: initialBalance,
            remainingCredits: initialBalance,
            createdAt: new Date(),
          }];
          if (typeof (user as any).markModified === 'function') {
            user.markModified('creditLots');
          }
        } else {
          user.creditLots = [];
        }
      }
      let lotExpiredSum = 0;
      if (user.creditLots && user.creditLots.length > 0) {
        for (const lot of user.creditLots) {
          const lotExpiry = lot.expiryDate ? new Date(lot.expiryDate) : null;
          if (lotExpiry && lotExpiry < now && (lot.remainingCredits || 0) > 0) {
            const expiredAmt = lot.remainingCredits;
            lot.remainingCredits = 0;
            lotExpiredSum += expiredAmt;

            const txnId = `txn-exp-${lot.lotId || Date.now()}-${Date.now()}`;
            await this.creditLedgerModel.create({
              transactionId: txnId,
              userId: user._id,
              amount: -expiredAmt,
              balanceAfter: Math.max(0, initialBalance - expiredAmt),
              type: CreditTransactionType.EXPIRY,
              description: `Credit Lot Expired: ${lot.source} (-${expiredAmt} Credits)`,
              lotId: lot.lotId,
              referenceId: lot.lotId,
              referenceType: 'lot_expiry',
              metadata: { lotId: lot.lotId, expiryDate: lot.expiryDate },
            }).catch(() => {});
          }
        }
      }

      // Filter active unexpired lots
      let activeUnexpiredLots = (user.creditLots || []).filter((lot) => {
        if (!lot.expiryDate) return true;
        const lotExp = new Date(lot.expiryDate);
        return lotExp >= now;
      });

      let availableCredits = activeUnexpiredLots.reduce((sum, l) => sum + (l.remainingCredits || 0), 0);

      // Sync user.credits with actual available unexpired credits to prevent expired credit retention
      if (user.credits !== availableCredits) {
        user.credits = availableCredits;
      }

      if (availableCredits < cost) {
        // Enforce true active sum to prevent negative or phantom balance
        user.credits = availableCredits;
        await user.save();
        throw new BadRequestException(
          `Insufficient AI credits. Required: ${cost}, available unexpired: ${availableCredits}. Please upgrade your plan or purchase a credit booster.`,
        );
      }

      // 3. FEFO Ordering: Sort active unexpired lots by expiryDate ASCENDING
      activeUnexpiredLots.sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });

      // 4. Deduct cost from earliest expiring lots
      let costRemaining = cost;
      let primaryLotId = '';
      for (const lot of activeUnexpiredLots) {
        if (costRemaining > 0 && lot.remainingCredits > 0) {
          if (!primaryLotId) primaryLotId = lot.lotId;
          const deductAmt = Math.min(lot.remainingCredits, costRemaining);
          lot.remainingCredits -= deductAmt;
          costRemaining -= deductAmt;
        }
      }

      const newBalance = activeUnexpiredLots.reduce((sum, l) => sum + l.remainingCredits, 0);

      // 5. Atomic Update with Optimistic Concurrency Filter
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: userId,
          credits: initialBalance, // Conditional version check: Ensure no concurrent write happened
        },
        {
          $set: {
            credits: newBalance,
            creditLots: user.creditLots,
          },
        },
        { new: true },
      ).exec();

      if (!updatedUser) {
        console.warn(`⚠️ Optimistic concurrency conflict during credit deduction for user ${userId}. Retrying attempt ${attempt + 1}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
        continue; // Retry loop
      }

      // 6. Write GENERATION_DEDUCTION Ledger Entry
      const txnId = `txn-deduct-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await this.creditLedgerModel.create({
        transactionId: txnId,
        userId: updatedUser._id,
        amount: -cost,
        balanceAfter: newBalance,
        type: CreditTransactionType.GENERATION_DEDUCTION,
        description,
        lotId: primaryLotId,
        referenceId: idempotencyKey || metadata.roomId || metadata.toolSlug,
        referenceType: 'room_generation',
        metadata: { ...metadata, idempotencyKey },
      });

      if (newBalance <= 1) {
        this.notificationsService.notifyUser({
          userId: updatedUser._id.toString(),
          title: '⚡ Running Low on Credits',
          message: `You have ${newBalance} credit${newBalance === 1 ? '' : 's'} remaining. Upgrade your plan or buy a credit pack to keep generating.`,
          type: 'warning',
        }).catch((e) => console.warn('Low credits user notification error:', e));
      }

      return updatedUser;
    }

    throw new BadRequestException('High concurrent generation traffic. Please retry your generation in a moment.');
  }

  /**
   * Idempotent Credit Refund (e.g. after generation failure) preserving original lot entitlement
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

    const referenceId = metadata.roomId || metadata.referenceId || metadata.generationId;

    // 1. Idempotency Check: Prevent duplicate refunds for the same generation
    if (referenceId) {
      const existingRefund = await this.creditLedgerModel.findOne({
        userId,
        referenceId,
        type: { $in: [CreditTransactionType.GENERATION_REFUND, CreditTransactionType.REFUND] },
      }).exec();

      if (existingRefund) {
        console.warn(`ℹ️ Generation refund [${referenceId}] already executed. Skipping idempotently.`);
        const user = await this.userModel.findById(userId).exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
      }
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    let targetLot: any = null;

    // 2. Original Lot Preservation: Restore credits to original lot if unexpired
    if (metadata.lotId && user.creditLots && user.creditLots.length > 0) {
      targetLot = user.creditLots.find((l) => l.lotId === metadata.lotId);
      if (targetLot && targetLot.expiryDate && new Date(targetLot.expiryDate) < now) {
        targetLot = null; // Lot expired, cannot restore to expired lot
      }
    }

    if (!targetLot && user.creditLots && user.creditLots.length > 0) {
      targetLot = user.creditLots.find((l) => !l.expiryDate || new Date(l.expiryDate) >= now);
    }

    if (targetLot) {
      targetLot.remainingCredits = (targetLot.remainingCredits || 0) + cost;
    } else {
      const defaultExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      user.creditLots.push({
        lotId: `lot-refund-${Date.now()}`,
        source: 'Generation Refund',
        initialCredits: cost,
        remainingCredits: cost,
        startDate: now,
        expiryDate: defaultExpiry,
      });
    }

    const activeLots = (user.creditLots || []).filter((l) => !l.expiryDate || new Date(l.expiryDate) >= now);
    const newBalance = activeLots.reduce((sum, l) => sum + (l.remainingCredits || 0), 0);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          credits: newBalance,
          creditLots: user.creditLots,
        },
      },
      { new: true },
    ).exec();

    const txnId = `txn-refund-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await this.creditLedgerModel.create({
      transactionId: txnId,
      userId: user._id,
      amount: cost,
      balanceAfter: newBalance,
      type: CreditTransactionType.GENERATION_REFUND,
      description,
      lotId: targetLot?.lotId,
      referenceId: referenceId || targetLot?.lotId,
      referenceType: 'room_generation_refund',
      metadata,
    });

    this.notificationsService.notifyUser({
      userId: user._id.toString(),
      title: '⚠️ Credit Refunded',
      message: `${cost} credit was automatically refunded to your balance due to a generation error.`,
      type: 'credit',
    }).catch((e) => console.warn('Credit refund user notification error:', e));

    return updatedUser || user;
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
  ): Promise<any> {
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
    const now = new Date();

    if (changeAmount > 0) {
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const adminLotId = `lot-admin-${Date.now()}`;
      const adminLot = {
        lotId: adminLotId,
        source: description || 'Admin Credit Adjustment',
        initialCredits: changeAmount,
        remainingCredits: changeAmount,
        startDate: now,
        expiryDate,
      };
      if (!user.creditLots) user.creditLots = [];
      user.creditLots.unshift(adminLot);
    } else if (changeAmount < 0) {
      // FEFO deduction for negative admin adjustment
      let removeRemaining = Math.abs(changeAmount);
      if (user.creditLots && user.creditLots.length > 0) {
        for (const lot of user.creditLots) {
          if (removeRemaining > 0 && (lot.remainingCredits || 0) > 0) {
            const deduct = Math.min(lot.remainingCredits, removeRemaining);
            lot.remainingCredits -= deduct;
            removeRemaining -= deduct;
          }
        }
      }
    }

    const activeLots = (user.creditLots || []).filter((l) => !l.expiryDate || new Date(l.expiryDate) >= now);
    const finalBalance = activeLots.reduce((sum, l) => sum + (l.remainingCredits || 0), 0);
    user.credits = finalBalance;

    if (typeof (user as any).markModified === 'function') {
      user.markModified('creditLots');
    }

    await user.save();

    const txnId = `txn-admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await this.creditLedgerModel.create({
      transactionId: txnId,
      userId: user._id,
      amount: changeAmount,
      balanceAfter: finalBalance,
      type: CreditTransactionType.ADMIN_ADJUSTMENT,
      description,
      referenceId: txnId,
      referenceType: 'admin_adjustment',
      metadata: { ...metadata, previousBalance: currentBalance, targetBalance },
    });

    return user;
  }

  /**
   * CreditReconciliationService: Audits CreditLedger, creditLots, and user.credits.
   * Repairs mismatches safely with explicit CORRECTION entries without resurrecting expired credits.
   */
  async reconcileUserCredits(userId: string): Promise<{ success: boolean; repaired: boolean; message: string; balance: number }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const activeLots = (user.creditLots || []).filter((l) => !l.expiryDate || new Date(l.expiryDate) >= now);
    const lotSum = activeLots.reduce((sum, l) => sum + (l.remainingCredits || 0), 0);

    if (user.credits !== lotSum) {
      const diff = lotSum - user.credits;
      user.credits = lotSum;
      await user.save();

      const txnId = `txn-reconcile-${Date.now()}`;
      await this.creditLedgerModel.create({
        transactionId: txnId,
        userId: user._id,
        amount: diff,
        balanceAfter: lotSum,
        type: CreditTransactionType.CORRECTION,
        description: `Audit Reconciliation Correction (${diff > 0 ? '+' : ''}${diff} CR)`,
        referenceId: txnId,
        referenceType: 'system_reconciliation',
        metadata: { lotSum, previousCredits: user.credits - diff },
      });

      return {
        success: true,
        repaired: true,
        message: `Reconciled user ${userId} balance to active unexpired lot sum: ${lotSum}`,
        balance: lotSum,
      };
    }

    return {
      success: true,
      repaired: false,
      message: `User balance ${user.credits} is perfectly synchronized with active credit lots.`,
      balance: user.credits,
    };
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
        lotId: `lot-sub-${Date.now()}`,
        source: `${subscriptionTier} (${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)})`,
        initialCredits: creditsToGrant,
        remainingCredits: creditsToGrant,
        startDate: periodStart,
        expiryDate: periodEnd,
      };

      // Atomic update — avoids Mongoose VersionError race with concurrent webhook + return-sync
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            plan: targetPlan,
            subscriptionTier,
            subscriptionPlanId: planDef ? planDef._id : undefined,
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
      const txnId = `txn-sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await this.creditLedgerModel.create({
        transactionId: txnId,
        userId: existingUser._id,
        amount: creditsToGrant,
        balanceAfter: creditsToGrant,
        type: CreditTransactionType.SUBSCRIPTION_GRANT,
        description: `Subscription Provisioned: ${subscriptionTier}`,
        lotId: newLot.lotId,
        referenceId: stripeSubscriptionId || stripeSessionId,
        referenceType: 'stripe_subscription',
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
            subscriptionPlanId: planDef ? planDef._id : undefined,
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

    // Trigger real-time Socket.IO Admin & User Notifications without refresh
    try {
      await Promise.all([
        this.notificationsService.notifyAdmin({
          title: '💳 New Subscription Purchased',
          message: `User ${existingUser.email} subscribed to ${subscriptionTier} (${billingCycle}).`,
          type: 'success',
          metadata: { userId, planCode: code, amountPaid },
        }),
        this.notificationsService.notifyUser({
          userId,
          title: '💎 Subscription Plan Activated!',
          message: `Welcome to ${subscriptionTier}! ${creditsToGrant} monthly generation credits have been added to your account.`,
          type: 'success',
          metadata: { planCode: code, credits: creditsToGrant },
        }),
      ]);
    } catch (e) {
      console.warn('Subscription notifications error:', e);
    }

    // Return fresh user doc
    return (await this.userModel.findById(userId).exec())!;
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

    if (session.mode !== 'subscription') {
      throw new BadRequestException(`Stripe Checkout session mode is "${session.mode}". Expected "subscription".`);
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
      const freePlan = await this.planModel.findOne({ code: 'free' }).exec();
      user.plan = SubscriptionPlan.FREE;
      user.subscriptionTier = 'Free Plan';
      if (freePlan) (user as any).subscriptionPlanId = freePlan._id;
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

    let activeCreditsSum = 0;
    if (user.creditLots && user.creditLots.length > 0) {
      for (const lot of user.creditLots) {
        const lotExp = lot.expiryDate ? new Date(lot.expiryDate) : null;
        if (lotExp && lotExp < now) {
          lot.remainingCredits = 0;
        } else {
          activeCreditsSum += (lot.remainingCredits || 0);
        }
      }
      if (user.credits !== activeCreditsSum) {
        user.credits = activeCreditsSum;
        if (typeof (user as any).markModified === 'function') {
          user.markModified('creditLots');
        }
        await user.save().catch(() => {});
      }
    } else {
      activeCreditsSum = user.credits || 0;
    }

    const autoRenew = user.autoRenew !== false && !user.cancelAtPeriodEnd;
    const cancelAtPeriodEnd = Boolean(user.cancelAtPeriodEnd);

    const freePlan = isExpired ? await this.planModel.findOne({ code: 'free' }).exec() : null;

    return {
      plan: isExpired && user.plan !== SubscriptionPlan.FREE ? SubscriptionPlan.FREE : user.plan,
      subscriptionTier: isExpired && user.plan !== SubscriptionPlan.FREE ? 'Free Plan' : (user.subscriptionTier || 'Free Plan'),
      subscriptionPlanId: isExpired && user.plan !== SubscriptionPlan.FREE ? freePlan?._id : (user as any).subscriptionPlanId,
      credits: activeCreditsSum,
      subscriptionStatus: user.subscriptionStatus || 'active',
      subscriptionPeriodStart: user.subscriptionPeriodStart,
      subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      daysRemaining,
      autoRenew,
      cancelAtPeriodEnd,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      creditLots: user.creditLots || [],
    };
  }

  /**
   * Cancel auto-renewal (Pause subscription renewal / stop auto-pay)
   * Keeps current plan & remaining credits active until the period end date.
   */
  async cancelAutoRenewal(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.stripeSubscriptionId) {
      try {
        const settings = await this.settingModel.findOne().exec();
        const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
        if (stripeSecretKey) {
          const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any });
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        }
      } catch (err: any) {
        console.warn(`Stripe cancel_at_period_end update warning: ${err.message}`);
      }
    }

    user.autoRenew = false;
    user.cancelAtPeriodEnd = true;
    if (typeof (user as any).markModified === 'function') {
      (user as any).markModified('autoRenew');
      (user as any).markModified('cancelAtPeriodEnd');
    }
    await user.save();
    return this.getSubscriptionStatus(userId);
  }

  /**
   * Resume auto-renewal
   */
  async resumeAutoRenewal(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.stripeSubscriptionId) {
      try {
        const settings = await this.settingModel.findOne().exec();
        const stripeSecretKey = settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
        if (stripeSecretKey) {
          const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any });
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: false,
          });
        }
      } catch (err: any) {
        console.warn(`Stripe resume auto-renewal update warning: ${err.message}`);
      }
    }

    user.autoRenew = true;
    user.cancelAtPeriodEnd = false;
    if (typeof (user as any).markModified === 'function') {
      (user as any).markModified('autoRenew');
      (user as any).markModified('cancelAtPeriodEnd');
    }
    await user.save();
    return this.getSubscriptionStatus(userId);
  }

  /**
   * Fetch credit ledger for a given user (Reconciles running balanceAfter to live user.credits)
   */
  async getCreditLedger(userId: string) {
    // Purge test offer / stale generation reconciliation records from DB
    try {
      await this.creditLedgerModel.deleteMany({
        userId,
        description: { $regex: /stale generation|roomai offer|\+25 bonus|reconciliation timeout|auto-refund: generation failed/i },
      });
    } catch (e) {}

    const user = await this.userModel.findById(userId).select('credits').exec();
    const rawLedger = await this.creditLedgerModel
      .find({ userId })
      .sort({ createdAt: -1 }) // Fetch newest first
      .limit(100)
      .exec();

    // Filter out any remaining test/stale entries
    const ledger = rawLedger.filter((item) => {
      const desc = item.description || '';
      return !/stale generation|roomai offer|\+25 bonus|reconciliation timeout|auto-refund: generation failed/i.test(desc);
    });

    if (user && ledger && ledger.length > 0) {
      const currentCredits = user.credits ?? 0;
      let runningBalance = currentCredits;

      const reconciledLedger = ledger.map((item, idx) => {
        const itemObj = (item as any).toObject ? (item as any).toObject() : { ...item };
        if (idx === 0) {
          itemObj.balanceAfter = currentCredits;
        } else {
          const prevTxAmount = ledger[idx - 1].amount;
          runningBalance = runningBalance - prevTxAmount;
          itemObj.balanceAfter = Math.max(0, runningBalance);
        }
        return itemObj;
      });

      return reconciledLedger;
    }

    return ledger;
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

    if (priceId && priceId.startsWith('price_') && !priceId.includes('mock') && !planDef.isDiscountActive) {
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      let effectivePriceMonthly = planDef.priceMonthly;
      let effectivePriceAnnual = planDef.priceAnnual;

      if (planDef.isDiscountActive) {
        if (planDef.discountPriceMonthly > 0 && planDef.discountPriceMonthly < planDef.priceMonthly) {
          effectivePriceMonthly = planDef.discountPriceMonthly;
        }
        if (planDef.discountPriceAnnual > 0 && planDef.discountPriceAnnual < planDef.priceAnnual) {
          effectivePriceAnnual = planDef.discountPriceAnnual;
        }
      }

      const price = billingCycle === 'annual' ? effectivePriceAnnual : effectivePriceMonthly;
      const unitAmountCents = Math.round((billingCycle === 'annual' ? price * 12 : price) * 100);
      const planDesc = planDef.isDiscountActive
        ? `${planDef.name} (${billingCycle} subscription - Promotional Discount Applied)`
        : `${planDef.name} (${billingCycle} subscription)`;

      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planDef.name,
              description: planDesc,
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
   * Helper to validate that promotional discount prices are strictly less than original prices
   */
  private validatePlanDiscounts(
    planData: Partial<SubscriptionPlanDefinition>,
    existingPlan?: SubscriptionPlanDefinition,
  ) {
    const isDiscountActive = planData.isDiscountActive ?? existingPlan?.isDiscountActive ?? false;
    if (!isDiscountActive) return;

    const priceMonthly = planData.priceMonthly ?? existingPlan?.priceMonthly ?? 0;
    const priceAnnual = planData.priceAnnual ?? existingPlan?.priceAnnual ?? 0;

    const discountMonthly = planData.discountPriceMonthly ?? existingPlan?.discountPriceMonthly ?? 0;
    const discountAnnual = planData.discountPriceAnnual ?? existingPlan?.discountPriceAnnual ?? 0;

    if (discountMonthly <= 0 && discountAnnual <= 0) {
      throw new BadRequestException(
        'At least one discount price (monthly or annual) must be greater than zero when discount is active.',
      );
    }

    if (discountMonthly > 0 && priceMonthly > 0 && discountMonthly >= priceMonthly) {
      throw new BadRequestException(
        `Monthly discount price ($${discountMonthly}) must be strictly less than the original monthly price ($${priceMonthly}).`,
      );
    }

    if (discountAnnual > 0 && priceAnnual > 0 && discountAnnual >= priceAnnual) {
      throw new BadRequestException(
        `Annual discount price ($${discountAnnual}) must be strictly less than the original annual price ($${priceAnnual}).`,
      );
    }
  }

  /**
   * Admin plan creation
   */
  async createPlan(planData: Partial<SubscriptionPlanDefinition>): Promise<SubscriptionPlanDefinition> {
    const existing = await this.planModel.findOne({ code: planData.code?.toLowerCase() }).exec();
    if (existing) {
      throw new BadRequestException(`Plan code "${planData.code}" already exists`);
    }
    this.validatePlanDiscounts(planData);
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
    const existing = await this.planModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }
    this.validatePlanDiscounts(planData, existing);
    const updated = await this.planModel.findByIdAndUpdate(id, planData, { new: true }).exec();
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
}
