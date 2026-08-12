import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimeOfDayDocument = TimeOfDay & Document;

@Schema({ timestamps: true, collection: 'timeofdays' })
export class TimeOfDay {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: '' })
  architecturalPromptBooster: string;
}

export const TimeOfDaySchema = SchemaFactory.createForClass(TimeOfDay);
