import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class PurchaseProjectDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsOptional()
  @IsIn(['card', 'paypal'])
  paymentMethod?: 'card' | 'paypal';

  @IsString()
  @IsOptional()
  stripePaymentMethodId?: string;

  @IsString()
  @IsOptional()
  paypalOrderId?: string;
}
