import { IsString, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  theme?: string;

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
  status?: string;
}
