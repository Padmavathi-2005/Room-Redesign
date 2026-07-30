import {
  IsEnum,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ThemeMode } from '../schemas/setting.schema';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  applicationName?: string;

  @IsOptional()
  @IsEnum(ThemeMode)
  activeTheme?: ThemeMode;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  borderRadius?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  glassOpacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  blurStrength?: number;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
