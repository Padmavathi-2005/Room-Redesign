import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

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

  @IsString()
  @IsOptional()
  houseAngle?: string;

  @IsString()
  @IsOptional()
  cameraAngle?: string;

  @IsString()
  @IsOptional()
  perspective?: string;

  @IsString()
  @IsOptional()
  buildingType?: string;

  @IsString()
  @IsOptional()
  roofType?: string;

  @IsString()
  @IsOptional()
  environment?: string;

  @IsString()
  @IsOptional()
  timeOfDay?: string;

  @IsString()
  @IsOptional()
  tool?: string;

  @IsString()
  @IsOptional()
  aiIntervention?: string;

  @IsString()
  @IsOptional()
  mood?: string;

  @IsString()
  @IsOptional()
  budgetLevel?: string;

  @IsString()
  @IsOptional()
  furnitureHandling?: string;

  @IsArray()
  @IsOptional()
  selectedProducts?: string[];

  @IsString()
  @IsOptional()
  flooringMaterial?: string;

  @IsString()
  @IsOptional()
  flooringFinish?: string;

  @IsString()
  @IsOptional()
  flooringGrout?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  manusChatId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
  creditsCost?: number;
}
