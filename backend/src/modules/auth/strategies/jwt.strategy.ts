import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../users/users.service';
import { Admin, AdminDocument, AdminRole } from '../../admin/schemas/admin.schema';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key',
    });
  }

  async validate(payload: JwtPayload) {
    const adminRoles = ['admin', 'ADMIN', 'main_admin', 'sub_admin'];

    // If role indicates admin or fallback system admin ID, check Admin model first
    if (adminRoles.includes(payload.role) || payload.sub === 'admin_sys_001') {
      if (payload.sub === 'admin_sys_001') {
        return {
          _id: 'admin_sys_001',
          email: payload.email,
          role: AdminRole.MAIN_ADMIN,
          isActive: true,
        };
      }

      const admin = await this.adminModel.findById(payload.sub).catch(() => null);
      if (admin && admin.isActive) {
        return {
          _id: admin._id.toString(),
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role || 'main_admin',
          isActive: admin.isActive,
        };
      }
    }

    // Try finding in User model
    try {
      const user = await this.usersService.findById(payload.sub);
      if (user && user.isActive) {
        return user;
      }
    } catch {
      // Fallback check Admin model if ID belonged to admin collection
      const admin = await this.adminModel.findById(payload.sub).catch(() => null);
      if (admin && admin.isActive) {
        return {
          _id: admin._id.toString(),
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role || 'main_admin',
          isActive: admin.isActive,
        };
      }
    }

    throw new UnauthorizedException('Account is inactive or not found');
  }
}
