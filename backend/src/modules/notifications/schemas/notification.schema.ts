import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationTarget {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ALL = 'ALL',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: NotificationTarget, default: NotificationTarget.USER })
  target: NotificationTarget;

  @Prop({ required: false })
  userId?: string;

  @Prop({ default: 'info' })
  type: 'info' | 'success' | 'warning' | 'alert' | 'credit' | 'lead';

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
