import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MoodDocument = Mood & Document;

@Schema({ timestamps: true, collection: 'moods' })
export class Mood {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: '' })
  description: string;
}

export const MoodSchema = SchemaFactory.createForClass(Mood);
