import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CmsPageDocument = CmsPage & Document;

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum BlockType {
  HERO = 'hero',
  TEXT = 'text',
  FEATURES = 'features',
  CTA = 'cta',
  FAQ = 'faq',
  IMAGE = 'image',
  HTML = 'html',
}

export class CmsBlock {
  @Prop({ required: true })
  id: string;

  @Prop({ type: String, enum: BlockType, required: true })
  type: BlockType;

  @Prop({ type: Object, required: true, default: {} })
  content: Record<string, any>;
}

@Schema({ timestamps: true, collection: 'cms_pages' })
export class CmsPage {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: String, enum: PageStatus, default: PageStatus.PUBLISHED })
  status: PageStatus;

  @Prop({ type: Array, default: [] })
  blocks: CmsBlock[];

  @Prop({ default: '' })
  customHtml?: string;

  @Prop({ default: false })
  isSystemPage: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 'System Administrator' })
  author: string;
}

export const CmsPageSchema = SchemaFactory.createForClass(CmsPage);
