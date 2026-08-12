import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDefinitionDocument = SubscriptionPlanDefinition & Document;

@Schema({ timestamps: true, collection: 'subscription_plans' })
export class SubscriptionPlanDefinition {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  code: string;

  @Prop({ required: true })
  priceMonthly: number;

  @Prop({ required: true })
  priceAnnual: number;

  @Prop({ required: true })
  credits: number;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: [String], default: ['floor-plan-generator', '3d-floor-plan', 'floor-plan-maker', 'interior-design', 'kitchen-design', 'bathroom-design', 'bedroom-design', 'office-design', 'ai-room-decorator', 'style-transfer', 'ai-room-cleaner', 'paint-color-visualizer', 'change-room-light', 'ai-wall-design', 'ai-flooring-design', 'change-furniture-ai', 'exterior-design', 'landscape-design'] })
  accessibleModels: string[];

  @Prop({ trim: true, default: '' })
  stripePriceIdMonthly: string;

  @Prop({ trim: true, default: '' })
  stripePriceIdAnnual: string;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const SubscriptionPlanDefinitionSchema = SchemaFactory.createForClass(SubscriptionPlanDefinition);
