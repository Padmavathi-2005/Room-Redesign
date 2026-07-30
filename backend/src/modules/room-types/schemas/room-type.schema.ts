import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomTypeDocument = RoomType & Document;

@Schema({ timestamps: true, collection: 'roomtypes' })
export class RoomType {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['interior', 'exterior', 'commercial', 'floorplan'], default: 'interior' })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: 'Home' })
  icon: string;

  @Prop({ type: [String], default: [] })
  popularStyles: string[];

  @Prop({ type: [String], default: [] })
  compatibleToolSlugs: string[];
}

export const RoomTypeSchema = SchemaFactory.createForClass(RoomType);
