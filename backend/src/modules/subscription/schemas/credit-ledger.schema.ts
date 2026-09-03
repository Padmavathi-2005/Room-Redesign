import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CreditLedgerDocument = CreditLedger & Document;

export enum CreditTransactionType {
  GRANT = 'GRANT',
  DEDUCTION = 'DEDUCTION',
  REFUND = 'REFUND',
  EXPIRY = 'EXPIRY',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Schema({ timestamps: true, collection: 'credit_ledgers' })
export class CreditLedger {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number; // Positive for grant/refund, negative for deduction

  @Prop({ required: true })
  balanceAfter: number;

  @Prop({ type: String, enum: CreditTransactionType, required: true, index: true })
  type: CreditTransactionType;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CreditLedgerSchema = SchemaFactory.createForClass(CreditLedger);
