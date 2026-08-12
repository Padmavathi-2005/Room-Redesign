import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetLevel, BudgetLevelSchema } from './schemas/budget-level.schema';
import { BudgetLevelsService } from './budget-levels.service';
import { BudgetLevelsController } from './budget-levels.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BudgetLevel.name, schema: BudgetLevelSchema }]),
  ],
  controllers: [BudgetLevelsController],
  providers: [BudgetLevelsService],
  exports: [BudgetLevelsService, MongooseModule],
})
export class BudgetLevelsModule {}
