import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // furniture, decoration, lighting, flooring, wall-art, textile, plant, appliances

  @Prop({ type: [String], required: true })
  roomTypes: string[]; // room types this product belongs to

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: false, default: 'Medium' })
  priceRange: string; // Low, Medium, Premium, Luxury

  @Prop({ required: false, default: false })
  isPopular: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
