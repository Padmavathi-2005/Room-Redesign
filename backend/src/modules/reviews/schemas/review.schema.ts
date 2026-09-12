import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  email: string;

  @Prop({ trim: true, default: 'Interior Design Client' })
  role: string;

  @Prop({ trim: true, default: '' })
  company: string;

  @Prop({ default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' })
  avatar: string;

  @Prop({ required: true, min: 1, max: 5, default: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ trim: true, default: 'Living Room' })
  roomType: string;

  @Prop({ trim: true, default: 'Japandi' })
  designTheme: string;

  @Prop({ trim: true, default: '' })
  designImageUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RoomGeneration', default: null })
  generationId?: Types.ObjectId;

  @Prop({ default: true, index: true })
  isFeatured: boolean;

  @Prop({ default: 'approved', index: true })
  status: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
