import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  stripeInvoiceId: string;

  @Prop({ trim: true, default: '' })
  stripeSessionId: string;

  @Prop({ required: true })
  amountPaid: number; // in USD dollars

  @Prop({ default: 'usd', lowercase: true })
  currency: string;

  @Prop({ default: 'paid', index: true })
  status: string;

  @Prop({ required: true, lowercase: true })
  planCode: string;

  @Prop({ default: 'monthly' })
  billingCycle: string;

  @Prop({ default: 'Stripe' })
  paymentMethod: string;

  @Prop({ trim: true, default: '' })
  invoicePdfUrl: string;

  @Prop({ default: Date.now })
  paidAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
