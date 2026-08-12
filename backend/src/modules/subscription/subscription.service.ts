import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, SubscriptionPlan } from '../users/schemas/user.schema';
import { SubscriptionPlanDefinition, SubscriptionPlanDefinitionDocument } from './schemas/subscription-plan.schema';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SubscriptionPlanDefinition.name)
    private readonly planModel: Model<SubscriptionPlanDefinitionDocument>,
  ) {}

  /**
   * Seed default plans on startup if collection is empty
   */
  async onModuleInit() {
    try {
      const planCount = await this.planModel.countDocuments().exec();
      if (planCount === 0) {
        console.log('🌱 Seeding default Subscription Plans into MongoDB...');
        const defaultPlans = [
          {
            name: 'Free Plan',
            code: 'free',
            priceMonthly: 0,
            priceAnnual: 0,
            credits: 40,
            description: 'Perfect for exploring RoomAI capabilities.',
            features: [
              '40 Complimentary credits',
              'Standard AI render engines',
              'SD generation quality (768px)',
              '3-day rendering history',
              'Community forum support',
            ],
            accessibleModels: ['interior-design', 'floor-plan-generator'],
            stripePriceIdMonthly: '',
            stripePriceIdAnnual: '',
            isPopular: false,
            isActive: true,
          },
          {
            name: 'Starter Tier',
            code: 'starter',
            priceMonthly: 19,
            priceAnnual: 15,
            credits: 200,
            description: 'For homeowners starting single-room projects.',
            features: [
              '200 Generation credits / mo',
              'Priority standard queue',
              'Full HD generation quality (1080p)',
              'Unlimited rendering history',
              'Personal workspace organization',
              'Email customer support',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'floor-plan-generator', 'sketch-to-render'],
            stripePriceIdMonthly: 'price_mock_starter_monthly',
            stripePriceIdAnnual: 'price_mock_starter_annual',
            isPopular: false,
            isActive: true,
          },
          {
            name: 'Standard Pro',
            code: 'standard',
            priceMonthly: 49,
            priceAnnual: 39,
            credits: 600,
            description: 'Ideal for designers and professional remodelers.',
            features: [
              '600 Generation credits / mo',
              'Super fast priority processing',
              '4K Ultra-HD resolution output',
              'Custom lighting & color editing',
              'CAD floor plan preprocessing',
              'Priority email/chat support',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'landscape-design', 'floor-plan-generator', '3d-floor-plan', 'sketch-to-render'],
            stripePriceIdMonthly: 'price_mock_standard_monthly',
            stripePriceIdAnnual: 'price_mock_standard_annual',
            isPopular: true,
            isActive: true,
          },
          {
            name: 'Professional',
            code: 'professional',
            priceMonthly: 99,
            priceAnnual: 79,
            credits: 1500,
            description: 'For studios and architecture agencies.',
            features: [
              '1500 Generation credits / mo',
              'Fastest dedicated cluster queues',
              '8K Extreme render quality',
              'Custom pre-processing overrides',
              'Material & Cost estimates PDF',
              'Dedicated account manager',
            ],
            accessibleModels: ['interior-design', 'exterior-design', 'landscape-design', 'floor-plan-generator', '3d-floor-plan', 'sketch-to-render', 'virtual-staging', 'color-palette-customizer'],
            stripePriceIdMonthly: 'price_mock_professional_monthly',
            stripePriceIdAnnual: 'price_mock_professional_annual',
            isPopular: false,
            isActive: true,
          },
        ];
        await this.planModel.insertMany(defaultPlans);
        console.log('✅ Default Subscription Plans seeded successfully!');
      }
    } catch (err: any) {
      console.error('Failed to seed default subscription plans:', err.message);
    }
  }

  /**
   * Get credit allowance by plan type (queries database)
   */
  async getCreditAllowance(planCode: string): Promise<number> {
    const plan = await this.planModel.findOne({ code: planCode.toLowerCase(), isActive: true }).exec();
    if (plan) {
      return plan.credits;
    }

    // Static fallback if DB lookup fails
    switch (planCode.toLowerCase()) {
      case 'starter':
        return 200;
      case 'standard':
        return 600;
      case 'professional':
        return 1500;
      case 'free':
      default:
        return 40;
    }
  }

  /**
   * Refill user credits and update plan status
   */
  async refillUserCredits(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    plan: SubscriptionPlan,
    periodEnd: Date,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ stripeCustomerId }).exec();
    if (!user) {
      throw new NotFoundException(`User with Stripe Customer ID ${stripeCustomerId} not found`);
    }

    const creditAllowance = await this.getCreditAllowance(plan);

    user.plan = plan;
    user.credits = creditAllowance;
    user.stripeSubscriptionId = stripeSubscriptionId;
    user.subscriptionPeriodEnd = periodEnd;
    user.subscriptionStatus = 'active';

    return user.save();
  }

  /**
   * Update subscription status when cancelled or expired
   */
  async handleSubscriptionCancellation(stripeSubscriptionId: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { stripeSubscriptionId },
      { subscriptionStatus: 'cancelled' },
    ).exec();
  }

  /**
   * Fetch current subscription stats for a user
   */
  async getSubscriptionStatus(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      plan: user.plan,
      credits: user.credits,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
    };
  }

  // ==========================================
  // PLAN CRUD METHODS (FOR ADMINS)
  // ==========================================

  /**
   * List all plans
   */
  async getPlans(includeInactive = false): Promise<SubscriptionPlanDefinition[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.planModel.find(filter).sort({ priceMonthly: 1 }).exec();
  }

  /**
   * Create a new plan
   */
  async createPlan(planData: Partial<SubscriptionPlanDefinition>): Promise<SubscriptionPlanDefinition> {
    const code = planData.code?.toLowerCase().trim();
    if (!code) {
      throw new ConflictException('Plan identifier code is required');
    }

    const existing = await this.planModel.findOne({ code }).exec();
    if (existing) {
      throw new ConflictException(`Plan with code '${code}' already exists`);
    }

    const newPlan = new this.planModel({
      ...planData,
      code,
    });
    return newPlan.save();
  }

  /**
   * Edit a plan
   */
  async updatePlan(id: string, planData: Partial<SubscriptionPlanDefinition>): Promise<SubscriptionPlanDefinition> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    if (planData.code) {
      const code = planData.code.toLowerCase().trim();
      if (code !== plan.code) {
        const existing = await this.planModel.findOne({ code }).exec();
        if (existing) {
          throw new ConflictException(`Plan with code '${code}' already exists`);
        }
        plan.code = code;
      }
    }

    Object.assign(plan, planData);
    return plan.save();
  }

  /**
   * Delete a plan
   */
  async deletePlan(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }
}
