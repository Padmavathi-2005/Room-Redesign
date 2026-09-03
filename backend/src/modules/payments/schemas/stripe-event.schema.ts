import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StripeEventDocument = StripeEvent & Document;

@Schema({ timestamps: true, collection: 'stripe_events' })
export class StripeEvent {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  processedAt: Date;
}

export const StripeEventSchema = SchemaFactory.createForClass(StripeEvent);
