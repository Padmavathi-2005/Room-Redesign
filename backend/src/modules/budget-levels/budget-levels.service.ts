import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BudgetLevel, BudgetLevelDocument } from './schemas/budget-level.schema';

const SEED_BUDGET_LEVELS = [
  { slug: 'low', name: 'Low', description: 'Affordable budget-friendly interior solutions with IKEA / DIY furnishings.' },
  { slug: 'medium', name: 'Medium', description: 'Balanced mid-range budget with high quality commercial furnishings.' },
  { slug: 'premium', name: 'Premium', description: 'High-end designer furniture, custom wood finishes, and luxury lighting.' },
  { slug: 'luxury', name: 'Luxury', description: 'Bespoke architectural luxury with marble, brass, and custom artisan craft.' },
];

@Injectable()
export class BudgetLevelsService implements OnModuleInit {
  private readonly logger = new Logger(BudgetLevelsService.name);

  constructor(
    @InjectModel(BudgetLevel.name)
    private readonly budgetLevelModel: Model<BudgetLevelDocument>,
  ) {}

  async onModuleInit() {
    try {
      for (const budget of SEED_BUDGET_LEVELS) {
        await this.budgetLevelModel.updateOne(
          { slug: budget.slug },
          { $set: budget },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 4 Budget Levels into MongoDB budgetlevels collection!`);
    } catch (err) {
      this.logger.warn(`Could not seed budgetlevels into MongoDB Atlas (${err.message})`);
    }
  }

  async findAll(): Promise<BudgetLevel[]> {
    try {
      const budgets = await this.budgetLevelModel.find().exec();
      if (budgets && budgets.length > 0) return budgets;
    } catch (e) {
      // Fall through
    }
    return SEED_BUDGET_LEVELS as BudgetLevel[];
  }

  async findBySlug(slug: string): Promise<BudgetLevel> {
    try {
      const found = await this.budgetLevelModel.findOne({ slug }).exec();
      if (found) return found;
    } catch (e) {
      // Fall through
    }
    return SEED_BUDGET_LEVELS.find((b) => b.slug === slug) as BudgetLevel;
  }
}
