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
      // Clear old plan definitions to enforce exact 3 plans
      await this.planModel.deleteMany({}).exec();
      console.log('🌱 Seeding exact 3 Subscription Plans into MongoDB...');
      const defaultPlans = [
        {
          name: 'Free Plan',
          code: 'free',
          priceMonthly: 0,
          priceAnnual: 0,
          credits: 0,
          validityDays: 30,
          description: 'Explore RoomAI tools. Upgrade to a paid plan to receive generation credits.',
          features: [
            '0 Initial Credits',
            '30-Day Validity Cycle',
            'Standard AI Render Engines',
            'Access to All Design Categories',
            'Automatic 30-Day Cycle Renewal',
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
            'All 12+ AI Design Tools',
            'Requires Completed Payment',
          ],
          accessibleModels: ['interior-design', 'exterior-design', 'floor-plan-generator', 'sketch-to-render', 'landscape-design'],
          stripePriceIdMonthly: 'price_mock_starter_monthly',
          stripePriceIdAnnual: 'price_mock_starter_annual',
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
            'Priority Email & Chat Support',
          ],
          accessibleModels: ['interior-design', 'exterior-design', 'landscape-design', 'floor-plan-generator', '3d-floor-plan', 'sketch-to-render'],
          stripePriceIdMonthly: 'price_mock_pro_monthly',
          stripePriceIdAnnual: 'price_mock_pro_annual',
          isPopular: false,
          isActive: true,
        },
      ];
      await this.planModel.insertMany(defaultPlans);
      console.log('✅ Exactly 3 Subscription Plans seeded successfully!');
    } catch (err: any) {
      console.error('Failed to seed subscription plans:', err.message);
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
