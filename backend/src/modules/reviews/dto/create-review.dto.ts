import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  roomType?: string;

  @IsString()
  @IsOptional()
  designTheme?: string;

  @IsString()
  @IsOptional()
  designImageUrl?: string;

  @IsString()
  @IsOptional()
  generationId?: string;
}
