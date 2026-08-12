import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnvironmentDocument = Environment & Document;

@Schema({ timestamps: true, collection: 'environments' })
export class Environment {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: '' })
  architecturalPromptBooster: string;
}

export const EnvironmentSchema = SchemaFactory.createForClass(Environment);
