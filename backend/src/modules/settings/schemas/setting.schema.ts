import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

@Schema({ timestamps: true, collection: 'settings' })
export class Setting {
  @Prop({ default: 'RoomAI' })
  applicationName: string;

  @Prop({ type: String, enum: ThemeMode, default: ThemeMode.LIGHT })
  activeTheme: ThemeMode;

  @Prop({ default: '#2563eb' })
  primaryColor: string;

  @Prop({ default: '#4f46e5' })
  secondaryColor: string;

  @Prop({ default: '#06B6D4' })
  accentColor: string;

  @Prop({ default: '#FFFFFF' })
  backgroundColor: string;

  @Prop({ default: '#111827' })
  textColor: string;

  @Prop({ default: 16 })
  borderRadius: number;

  @Prop({ default: 0.7 })
  glassOpacity: number;

  @Prop({ default: 20 })
  blurStrength: number;

  @Prop({ default: null })
  logo?: string;

  @Prop({ default: null })
  favicon?: string;

  @Prop({ default: false })
  maintenanceMode: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
