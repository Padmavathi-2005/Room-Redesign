import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditPackDocument = CreditPack & Document;

@Schema({ timestamps: true, collection: 'credit_packs' })
export class CreditPack {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  code: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, min: 1 })
  credits: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 'usd', lowercase: true, trim: true })
  currency: string;

  @Prop({ required: true, min: 1, default: 30 })
  validityDays: number;

  @Prop({ trim: true, default: '' })
  stripePriceId: string;

  @Prop({ type: [String], default: ['starter', 'pro'] })
  eligiblePlans: string[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ trim: true, default: '' })
  badge: string;
}

export const CreditPackSchema = SchemaFactory.createForClass(CreditPack);
