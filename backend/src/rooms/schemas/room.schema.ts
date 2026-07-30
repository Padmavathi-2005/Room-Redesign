import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RoomDocument = RoomGeneration & Document;

@Schema({ timestamps: true })
export class RoomGeneration {
  @Prop({ required: true })
  originalImage: string; // File path or URL

  @Prop({ required: false, default: '' })
  generatedImage: string; // Generated file path or URL

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MediaFile', required: false })
  originalImageId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MediaFile', required: false })
  generatedImageId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 'interior-design' })
  toolSlug: string;

  @Prop({ required: true, default: 'Living Room' })
  roomType: string;

  @Prop({ required: true, default: 'Modern' })
  theme: string; // Design Style (e.g. Modern, Japandi, Scandinavian)

  @Prop({ required: false, default: '' })
  colorPalette?: string;

  @Prop({ required: false, default: '' })
  lighting?: string;

  @Prop({ required: false, default: '' })
  customInstructions?: string;

  @Prop({ required: false, default: '' })
  prompt: string; // Final Compiled Prompt

  @Prop({ required: false, default: '' })
  negativePrompt?: string;

  @Prop({ required: true, default: 4 })
  creditsUsed: number;

  @Prop({ required: true, default: 'completed', enum: ['pending', 'processing', 'completed', 'failed'] })
  status: string;

  @Prop({ required: false })
  error?: string;
}

export const RoomSchema = SchemaFactory.createForClass(RoomGeneration);
