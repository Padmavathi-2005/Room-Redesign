import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyDocument = Currency & Document;

export enum CurrencyPosition {
  PREFIX = 'prefix',
  SUFFIX = 'suffix',
}

@Schema({ timestamps: true, collection: 'currencies' })
export class Currency {
  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  code: string; // e.g. 'USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD', 'JPY'

  @Prop({ required: true, trim: true })
  name: string; // e.g. 'US Dollar', 'Euro', 'Indian Rupee'

  @Prop({ required: true, trim: true })
  symbol: string; // e.g. '$', '€', '₹', '£', '¥'

  @Prop({ required: true, default: 1.0 })
  exchangeRate: number; // Rate relative to default base currency (default currency is 1.0)

  @Prop({ default: false })
  isDefault: boolean; // Only one currency is default at a time

  @Prop({ default: true })
  isActive: boolean; // Controls whether visible in user switcher

  @Prop({ type: String, enum: CurrencyPosition, default: CurrencyPosition.PREFIX })
  position: CurrencyPosition; // 'prefix' ($10) vs 'suffix' (10 €)

  @Prop({ default: 2 })
  decimalPlaces: number; // 2 for most currencies, 0 for JPY, etc.
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
