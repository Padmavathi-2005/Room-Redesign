import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoofTypeDocument = RoofType & Document;

@Schema({ timestamps: true, collection: 'rooftypes' })
export class RoofType {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: '' })
  architecturalPromptBooster: string;
}

export const RoofTypeSchema = SchemaFactory.createForClass(RoofType);
