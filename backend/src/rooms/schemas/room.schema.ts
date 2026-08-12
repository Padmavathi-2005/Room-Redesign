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

  @Prop({ required: false, default: 'House' })
  buildingType?: string;

  @Prop({ required: false, default: '' })
  roofType?: string;

  @Prop({ required: false, default: '' })
  environment?: string;

  @Prop({ required: false, default: '' })
  timeOfDay?: string;

  @Prop({ required: false, default: '' })
  houseAngle?: string;

  @Prop({ required: false, default: '' })
  cameraAngle?: string;

  @Prop({ required: false, default: '' })
  perspective?: string;

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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: false })
  projectId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, default: '' })
  manusChatId?: string;

  @Prop({ required: true, default: 4 })
  creditsUsed: number;

  @Prop({ required: true, default: 'completed', enum: ['pending', 'processing', 'completed', 'failed'] })
  status: string;

  @Prop({ required: false })
  error?: string;
}

export const RoomSchema = SchemaFactory.createForClass(RoomGeneration);
