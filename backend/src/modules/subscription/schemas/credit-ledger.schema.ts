import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CreditLedgerDocument = CreditLedger & Document;

export enum CreditTransactionType {
  SUBSCRIPTION_GRANT = 'SUBSCRIPTION_GRANT',
  BOOSTER_GRANT = 'BOOSTER_GRANT',
  PROMOTION_GRANT = 'PROMOTION_GRANT',
  ADMIN_GRANT = 'ADMIN_GRANT',
  GRANT = 'GRANT',
  DEDUCTION = 'DEDUCTION',
  GENERATION_DEDUCTION = 'GENERATION_DEDUCTION',
  REFUND = 'REFUND',
  GENERATION_REFUND = 'GENERATION_REFUND',
  EXPIRY = 'EXPIRY',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  REVERSAL = 'REVERSAL',
  CORRECTION = 'CORRECTION',
}

@Schema({ timestamps: true, collection: 'credit_ledgers' })
export class CreditLedger {
  @Prop({ type: String, unique: true, sparse: true, index: true })
  transactionId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number; // Positive for grant/refund, negative for deduction/expiry

  @Prop({ required: true })
  balanceAfter: number;

  @Prop({ type: String, enum: CreditTransactionType, required: true, index: true })
  type: CreditTransactionType;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: String, default: null, index: true })
  lotId?: string;

  @Prop({ type: String, default: null, index: true })
  referenceId?: string;

  @Prop({ type: String, default: null })
  referenceType?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CreditLedgerSchema = SchemaFactory.createForClass(CreditLedger);
