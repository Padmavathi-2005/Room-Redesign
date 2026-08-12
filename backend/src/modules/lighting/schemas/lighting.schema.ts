import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LightingDocument = Lighting & Document;

@Schema({ timestamps: true, collection: 'lightings' })
export class Lighting {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: '' })
  architecturalPromptBooster: string;
}

export const LightingSchema = SchemaFactory.createForClass(Lighting);
