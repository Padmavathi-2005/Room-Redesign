import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BudgetLevelDocument = BudgetLevel & Document;

@Schema({ timestamps: true, collection: 'budgetlevels' })
export class BudgetLevel {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: '' })
  description: string;
}

export const BudgetLevelSchema = SchemaFactory.createForClass(BudgetLevel);
