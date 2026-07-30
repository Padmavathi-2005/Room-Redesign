import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(32, { message: 'New password cannot exceed 32 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
    message: 'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)',
  })
  newPassword: string;
}
