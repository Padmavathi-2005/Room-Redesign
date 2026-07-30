import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductToolDocument = ProductTool & Document;

@Schema({ timestamps: true })
export class ProductTool {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['interior', 'exterior', 'floorplan', 'editing'], default: 'interior' })
  category: string;

  @Prop({ required: true, default: 4 })
  creditCost: number;

  @Prop({ type: [String], default: [] })
  supportedRoomTypes: string[];

  @Prop({ type: [String], default: [] })
  supportedStyles: string[];

  @Prop({ required: true, default: '' })
  defaultPromptTemplate: string;
}

export const ProductToolSchema = SchemaFactory.createForClass(ProductTool);
