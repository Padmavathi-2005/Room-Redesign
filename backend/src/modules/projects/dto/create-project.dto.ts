import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  theme?: string; // The primary design style / theme (e.g. Modern Minimalist, Japandi)

  @IsObject()
  @IsOptional()
  designTheme?: Record<string, any>;

  @IsString()
  @IsOptional()
  initialRoomName?: string;

  @IsString()
  @IsOptional()
  initialRoomType?: string;

  @IsString()
  @IsOptional()
  initialImage?: string;

  @IsString()
  @IsOptional()
  colorPalette?: string;

  @IsString()
  @IsOptional()
  lighting?: string;

  @IsString()
  @IsOptional()
  manusChatId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class CreateProjectRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  roomType: string;

  @IsString()
  @IsOptional()
  originalImage?: string;

  @IsArray()
  @IsOptional()
  materials?: string[];

  @IsString()
  @IsOptional()
  userId?: string;
}
