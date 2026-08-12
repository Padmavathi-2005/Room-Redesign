import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BudgetLevelsService } from './budget-levels.service';

@Controller('budget-levels')
export class BudgetLevelsController {
  constructor(private readonly budgetLevelsService: BudgetLevelsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const budgets = await this.budgetLevelsService.findAll();
    return {
      success: true,
      message: 'Budget Levels Loaded',
      data: budgets,
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('slug') slug: string) {
    const budget = await this.budgetLevelsService.findBySlug(slug);
    return {
      success: true,
      message: `Budget Level ${slug} Loaded`,
      data: budget,
    };
  }
}
