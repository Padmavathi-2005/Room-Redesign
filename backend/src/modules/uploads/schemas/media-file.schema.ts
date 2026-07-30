import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MediaFileDocument = MediaFile & Document;

@Schema({ timestamps: true })
export class MediaFile {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true, unique: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, enum: ['original_input', 'ai_generated', 'mask_image'], default: 'original_input' })
  type: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: MongooseSchema.Types.ObjectId;
}

export const MediaFileSchema = SchemaFactory.createForClass(MediaFile);
