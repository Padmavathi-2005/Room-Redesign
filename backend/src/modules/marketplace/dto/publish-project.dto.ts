import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class PublishProjectDto {
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsOptional()
  sourceProjectId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  toolSlug: string;

  @IsString()
  @IsNotEmpty()
  roomType: string;

  @IsString()
  @IsOptional()
  style?: string;

  @IsString()
  @IsNotEmpty()
  sampleImageUrl: string; // The single image selected for public display

  @IsArray()
  @IsOptional()
  lockedImageUrls?: string[]; // All remaining high-res images locked until purchased

  @IsString()
  @IsOptional()
  originalImageUrl?: string;

  @IsNumber()
  @IsOptional()
  totalImageCount?: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  beforeImageUrl?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
