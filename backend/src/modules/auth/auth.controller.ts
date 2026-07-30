import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: 'User registered successfully',
      data: result,
    };
  }

  /**
   * POST /api/v1/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: 'Logged in successfully',
      data: result,
    };
  }

  /**
   * POST /api/v1/auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('_id') userId: string) {
    await this.authService.logout(userId.toString());
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  }

  /**
   * POST /api/v1/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(refreshTokenDto);
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    };
  }

  /**
   * GET /api/v1/auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
    };
  }

  /**
   * PATCH /api/v1/auth/change-password
   */
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('_id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userId.toString(), changePasswordDto);
    return {
      success: true,
      message: 'Password changed successfully',
      data: null,
    };
  }
}
