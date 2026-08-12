import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PublishedProjectDocument = PublishedProject & Document;

@Schema({ timestamps: true, collection: 'published_projects' })
export class PublishedProject {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project' })
  sourceProjectId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, default: 0 }) // Price in USD ($0 = free)
  price: number;

  @Prop({ required: true, index: true }) // e.g., 'interior-design', 'floor-plan-generator'
  toolSlug: string;

  @Prop({ required: true, index: true }) // e.g., 'Living Room', 'Bedroom', 'Kitchen'
  roomType: string;

  @Prop({ default: 'Modern' })
  style: string;

  @Prop({ required: true }) // Cloudinary URL for the single free sample preview display image
  sampleImageUrl: string;

  @Prop({ type: [String], default: [] }) // Cloudinary URLs locked until project is purchased
  lockedImageUrls: string[];

  @Prop({ default: '' }) // Cloudinary URL for original uploaded room photo
  originalImageUrl: string;

  @Prop({ default: 1 }) // Total count of images in the set
  totalImageCount: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  wishlistCount: number;

  @Prop({ default: 'published', enum: ['published', 'draft', 'archived'] })
  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublishedProjectSchema = SchemaFactory.createForClass(PublishedProject);
