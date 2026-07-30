import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  originalImage: string;

  @IsString()
  @IsOptional()
  toolSlug?: string;

  @IsString()
  @IsNotEmpty()
  roomType: string;

  @IsString()
  @IsNotEmpty()
  theme: string;

  @IsString()
  @IsOptional()
  designStyle?: string;

  @IsString()
  @IsOptional()
  roomSize?: string;

  @IsString()
  @IsOptional()
  colorPalette?: string;

  @IsString()
  @IsOptional()
  lighting?: string;

  @IsString()
  @IsOptional()
  customInstructions?: string;

  @IsString()
  @IsOptional()
  customRequirements?: string;

  @IsBoolean()
  @IsOptional()
  preserveStructure?: boolean;

  @IsString()
  @IsOptional()
  userPrompt?: string;
}
