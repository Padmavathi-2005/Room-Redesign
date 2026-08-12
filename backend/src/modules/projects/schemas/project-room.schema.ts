import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectRoomDocument = ProjectRoom & Document;

@Schema({ timestamps: true })
export class ProjectRoom {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  userId?: string;

  @Prop({ required: true, default: 'Living Room' })
  name: string; // e.g. "Master Bedroom", "Living Room"

  @Prop({ required: true, default: 'Living Room' })
  roomType: string;

  @Prop({ required: false, default: '' })
  originalImage?: string;

  @Prop({ required: false, default: '' })
  coverImage?: string; // Latest generated image thumbnail for this room

  @Prop({ required: false, default: 0 })
  imageCount: number;

  @Prop({ type: [String], default: [] })
  materials?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectRoomSchema = SchemaFactory.createForClass(ProjectRoom);
