import {
  IsEnum,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageStatus, BlockType } from '../schemas/cms-page.schema';

export class CmsBlockDto {
  @IsString()
  id: string;

  @IsEnum(BlockType)
  type: BlockType;

  @IsObject()
  content: Record<string, any>;
}

export class CreateCmsPageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsBlockDto)
  blocks?: CmsBlockDto[];

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsBoolean()
  isSystemPage?: boolean;

  @IsOptional()
  @IsString()
  author?: string;
}
