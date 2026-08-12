import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DesignStyleDocument = DesignStyle & Document;

@Schema({ timestamps: true, collection: 'designstyles' })
export class DesignStyle {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: false, default: 'interior' })
  category: string;
}

export const DesignStyleSchema = SchemaFactory.createForClass(DesignStyle);
