import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AiToolDocument = AiTool & Document;

@Schema({ timestamps: true, collection: 'aitools' })
export class AiTool {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: 'interior' })
  category: string;

  @Prop({ required: false, default: 2 })
  creditCost: number;

  @Prop({ required: false, default: true })
  isActive: boolean;
}

export const AiToolSchema = SchemaFactory.createForClass(AiTool);
