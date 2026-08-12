import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PurchaseProjectDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsOptional()
  stripePaymentMethodId?: string;
}
