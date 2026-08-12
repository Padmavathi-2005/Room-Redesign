import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectPurchaseDocument = ProjectPurchase & Document;

@Schema({ timestamps: true, collection: 'project_purchases' })
export class ProjectPurchase {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PublishedProject', required: true, index: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amountPaid: number;

  @Prop({ required: true })
  platformFee: number; // 20% platform commission fee

  @Prop({ required: true })
  sellerEarnings: number; // 80% credited balance

  @Prop({ default: '' })
  stripePaymentIntentId: string;

  @Prop({ default: 'completed', enum: ['pending', 'completed', 'refunded'] })
  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectPurchaseSchema = SchemaFactory.createForClass(ProjectPurchase);
