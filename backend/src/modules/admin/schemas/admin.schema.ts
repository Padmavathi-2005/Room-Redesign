import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

export enum AdminRole {
  MAIN_ADMIN = 'main_admin',
  SUB_ADMIN = 'sub_admin',
}

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password?: string;

  @Prop({ default: 'Admin' })
  firstName: string;

  @Prop({ default: 'User' })
  lastName: string;

  @Prop({
    type: String,
    enum: AdminRole,
    default: AdminRole.SUB_ADMIN,
  })
  role: AdminRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop()
  lastLogin?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
