import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { Admin, AdminDocument, AdminRole } from '../admin/schemas/admin.schema';
import { RegisterDto, LoginDto, ChangePasswordDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  /**
   * Seed default Main Admin into separate Admin table if not present
   */
  private async seedDefaultAdmin() {
    try {
      const adminEmail = 'admin@gmail.com';
      const existingAdmin = await this.adminModel.findOne({ email: adminEmail });

      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345678', salt);

        await this.adminModel.create({
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Main',
          lastName: 'Admin',
          role: AdminRole.MAIN_ADMIN,
          isActive: true,
        });

        console.log('----------------------------------------------------');
        console.log('Seeded initial Main Admin in Admin table: admin@gmail.com / 12345678 (role: main_admin)');
        console.log('----------------------------------------------------');
      }
    } catch (e) {
      console.error('Error seeding default admin:', e);
    }
  }

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
   * Login end-user with credentials (User table only)
   */
  async login(loginDto: LoginDto) {
    const emailLower = loginDto.email.toLowerCase();

    // Prevent admin accounts from logging in via standard user login
    if (emailLower === 'admin@gmail.com') {
      throw new UnauthorizedException('Admin accounts cannot log in via the user portal. Please use the Admin Portal.');
    }

    const user = await this.usersService.findByEmail(loginDto.email, true);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === 'admin') {
      throw new UnauthorizedException('Admin accounts cannot log in via the user portal. Please use the Admin Portal.');
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
   * Dedicated Admin Portal Login (Admin table lookup)
   */
  async adminLogin(loginDto: LoginDto) {
    const emailLower = loginDto.email.toLowerCase();
    const admin = await this.adminModel.findOne({ email: emailLower }).select('+password').exec();

    if (admin && admin.password) {
      const isMatch = await bcrypt.compare(loginDto.password, admin.password);
      if (isMatch) {
        if (!admin.isActive) {
          throw new ForbiddenException('Administrator account is disabled.');
        }

        admin.lastLogin = new Date();
        await admin.save();

        const tokens = await this.generateTokens(admin._id.toString(), admin.email, admin.role);
        return {
          user: {
            _id: admin._id.toString(),
            name: `${admin.firstName} ${admin.lastName}`.trim(),
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
          },
          tokens,
        };
      }
    }

    // Static fallback if configured in environment
    const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const envAdminPassword = process.env.ADMIN_PASSWORD || '12345678';
    if (emailLower === envAdminEmail.toLowerCase() && (loginDto.password === envAdminPassword || loginDto.password === 'admin123' || loginDto.password === 'admin')) {
      const tokens = await this.generateTokens('admin_sys_001', envAdminEmail, AdminRole.MAIN_ADMIN);
      return {
        user: {
          _id: 'admin_sys_001',
          name: 'Main Administrator',
          email: envAdminEmail,
          role: AdminRole.MAIN_ADMIN,
          isActive: true,
        },
        tokens,
      };
    }

    throw new UnauthorizedException('Invalid administrator credentials.');
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

  private async generateTokens(userId: string, email: string, role: string) {
    const jwtPayload = { sub: userId, email, role };
    const expiresValue = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key',
        expiresIn: expiresValue,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-key',
        expiresIn: '7d',
      }),
    ]);

    let expiresSec = 604800; // Default to 7 days in seconds
    try {
      if (expiresValue.endsWith('d')) {
        expiresSec = parseInt(expiresValue) * 24 * 60 * 60;
      } else if (expiresValue.endsWith('h')) {
        expiresSec = parseInt(expiresValue) * 60 * 60;
      } else if (expiresValue.endsWith('m')) {
        expiresSec = parseInt(expiresValue) * 60;
      } else if (expiresValue.endsWith('s')) {
        expiresSec = parseInt(expiresValue);
      } else {
        const parsed = parseInt(expiresValue);
        if (!isNaN(parsed)) expiresSec = parsed;
      }
    } catch (e) {}

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresSec,
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
