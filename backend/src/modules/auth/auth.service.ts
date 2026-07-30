import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto, ChangePasswordDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user account
   */
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login user with credentials
   */
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email, true);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is disabled. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user._id.toString());
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return true;
  }

  /**
   * Refresh JWT access & refresh token pair
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-key',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub, true);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  /**
   * Change user password securely
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.usersService.findById(userId, true);
    if (!user || !user.password) {
      throw new BadRequestException('Cannot change password for this account');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.usersService.updatePassword(userId, hashedPassword);

    return true;
  }

  /**
   * Helper: Generate Access (15m) & Refresh (7d) Token Pair
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const jwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-key',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Helper: Hash Refresh Token before saving in MongoDB
   */
  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  /**
   * Helper: Sanitize User Document (remove secrets)
   */
  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;
    delete obj.refreshToken;
    return obj;
  }
}
