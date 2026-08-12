import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'assistant', 'system'], default: 'user' })
  role: string;

  @Prop({ required: true, default: '' })
  content: string;

  @Prop({ required: false, default: '' })
  imageUrl?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'RoomGeneration', required: false })
  generationId?: MongooseSchema.Types.ObjectId;

  createdAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
