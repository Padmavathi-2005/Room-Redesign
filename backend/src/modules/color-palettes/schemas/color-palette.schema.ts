import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ColorPaletteDocument = ColorPalette & Document;

@Schema({ timestamps: true, collection: 'colorpalettes' })
export class ColorPalette {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true })
  colors: string[];

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: false, default: '' })
  image: string;
}

export const ColorPaletteSchema = SchemaFactory.createForClass(ColorPalette);
