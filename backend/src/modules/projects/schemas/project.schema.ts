import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

export interface DesignTheme {
  style?: string;
  primaryColors?: string[];
  secondaryColors?: string[];
  accentColors?: string[];
  materials?: string[];
  lighting?: string;
  furnitureStyle?: string;
  decorStyle?: string;
  flooring?: string;
  metalFinish?: string;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: '' })
  description?: string;

  @Prop({ required: false, default: '' })
  coverImage?: string;

  @Prop({ required: true, default: 'Modern Minimalist' })
  theme: string; // High level theme label

  @Prop({ type: Object, default: {} })
  designTheme?: DesignTheme; // Structured project-level design theme for multi-room prompt consistency

  @Prop({ required: false, default: '' })
  colorPalette?: string;

  @Prop({ required: false, default: '' })
  lighting?: string;

  @Prop({ required: false, default: '' })
  manusChatId?: string; // Active Manus AI session thread ID

  @Prop({ type: Array, default: [] })
  manusChatHistory?: string[]; // History of past Manus AI session IDs (never deleted)

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'ProjectRoom' }], default: [] })
  rooms: MongooseSchema.Types.ObjectId[];

  @Prop({ required: false, default: 'active', enum: ['active', 'archived'] })
  status: string;

  @Prop({ required: false })
  userId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
