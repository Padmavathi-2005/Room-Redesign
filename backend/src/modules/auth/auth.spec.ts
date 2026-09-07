import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '../users/schemas/user.schema';
import { AdminRole } from '../admin/schemas/admin.schema';

describe('AuthService Test Suite (Authentication & Security Boundary Verification)', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockAdminModel: any;
  let mockNotificationsService: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const rawPassword = 'Password123!';
  let hashedPassword = '';

  let mockUser: any;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(rawPassword, salt);
  });

  beforeEach(async () => {
    mockUser = {
      _id: mockUserId,
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      isActive: true,
      credits: 10,
      refreshToken: null,
      toObject: function () {
        return { ...this };
      },
    };

    mockUsersService = {
      create: jest.fn().mockImplementation(async (dto) => {
        if (dto.email?.toLowerCase() === 'existing@example.com') {
          throw new ConflictException('User with this email already exists');
        }
        return {
          _id: mockUserId,
          ...dto,
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          role: UserRole.USER,
          isActive: true,
          credits: 0,
          toObject: function () {
            return { ...this };
          },
        };
      }),
      findByEmail: jest.fn().mockImplementation(async (email) => {
        if (email.toLowerCase() === mockUser.email.toLowerCase()) {
          return mockUser;
        }
        if (email.toLowerCase() === 'disabled@example.com') {
          return { ...mockUser, email: 'disabled@example.com', isActive: false };
        }
        if (email.toLowerCase() === 'admin_in_user_table@example.com') {
          return { ...mockUser, email: 'admin_in_user_table@example.com', role: UserRole.ADMIN };
        }
        return null;
      }),
      findById: jest.fn().mockImplementation(async (id) => {
        if (id === mockUserId) return mockUser;
        throw new BadRequestException('Cannot change password for this account');
      }),
      updateLastLogin: jest.fn().mockResolvedValue(true),
      updateRefreshToken: jest.fn().mockImplementation(async (id, tokenHash) => {
        mockUser.refreshToken = tokenHash;
      }),
      updatePassword: jest.fn().mockImplementation(async (id, newHash) => {
        mockUser.password = newHash;
      }),
    };

    mockJwtService = {
      signAsync: jest.fn().mockImplementation(async (payload, opts) => {
        return `mock_token_${payload.sub}_${opts.expiresIn}`;
      }),
      verify: jest.fn().mockImplementation((token, opts) => {
        if (token === 'valid_refresh_token') {
          return { sub: mockUserId, email: mockUser.email, role: mockUser.role };
        }
        throw new Error('Invalid token');
      }),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test-jwt-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        if (key === 'JWT_EXPIRES_IN') return '7d';
        return null;
      }),
    };

    mockAdminModel = {
      findOne: jest.fn().mockImplementation((query) => ({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockImplementation(async () => {
            if (query.email === 'admin@gmail.com') {
              return {
                _id: 'admin_doc_001',
                email: 'admin@gmail.com',
                password: hashedPassword,
                firstName: 'Main',
                lastName: 'Admin',
                role: AdminRole.MAIN_ADMIN,
                isActive: true,
                save: jest.fn().mockResolvedValue(true),
              };
            }
            if (query.email === 'disabled_admin@gmail.com') {
              return {
                _id: 'admin_doc_002',
                email: 'disabled_admin@gmail.com',
                password: hashedPassword,
                firstName: 'Disabled',
                lastName: 'Admin',
                role: AdminRole.SUB_ADMIN,
                isActive: false,
                save: jest.fn().mockResolvedValue(true),
              };
            }
            return null;
          }),
        }),
      })),
      create: jest.fn().mockResolvedValue(true),
    };

    mockNotificationsService = {
      notifyUser: jest.fn().mockResolvedValue(true),
      notifyAdmin: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'AdminModel', useValue: mockAdminModel },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('1. User Registration Flow', () => {
    it('Should register user, hash credentials, and return sanitized user with JWT tokens', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'Jane.Smith@Example.Com',
        password: 'Password123!',
      };

      const result = await service.register(dto as any);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('jane.smith@example.com');
      expect(result.user.password).toBeUndefined(); // Sanitized!
      expect(result.user.refreshToken).toBeUndefined(); // Sanitized!
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalled();
    });

    it('Should throw ConflictException when registering duplicate email', async () => {
      const dto = {
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('2. Standard User Login & Admin Boundary Protection', () => {
    it('Should authenticate valid user credentials with case-insensitive email', async () => {
      const loginDto = { email: 'USER@EXAMPLE.COM', password: rawPassword };
      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('user@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(mockUserId);
    });

    it('Should reject login with wrong password throwing UnauthorizedException', async () => {
      const loginDto = { email: 'user@example.com', password: 'WrongPassword123' };
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('Should reject login for non-existent email throwing UnauthorizedException', async () => {
      const loginDto = { email: 'nonexistent@example.com', password: rawPassword };
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('Should reject login for disabled user account throwing ForbiddenException', async () => {
      const loginDto = { email: 'disabled@example.com', password: rawPassword };
      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('Should reject admin@gmail.com from standard user login route throwing UnauthorizedException', async () => {
      const loginDto = { email: 'admin@gmail.com', password: '12345678' };
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Admin accounts cannot log in via the user portal. Please use the Admin Portal.'),
      );
    });
  });

  describe('3. Dedicated Admin Portal Login', () => {
    it('Should authenticate main admin from Admin database collection', async () => {
      const loginDto = { email: 'admin@gmail.com', password: rawPassword };
      const result = await service.adminLogin(loginDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('admin@gmail.com');
      expect(result.user.role).toBe(AdminRole.MAIN_ADMIN);
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('Should reject disabled admin accounts with ForbiddenException', async () => {
      const loginDto = { email: 'disabled_admin@gmail.com', password: rawPassword };
      await expect(service.adminLogin(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('Should support environment fallback admin login when enabled', async () => {
      process.env.ADMIN_EMAIL = 'envadmin@example.com';
      process.env.ADMIN_PASSWORD = 'envsecretpassword';

      const loginDto = { email: 'envadmin@example.com', password: 'envsecretpassword' };
      const result = await service.adminLogin(loginDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('envadmin@example.com');
      expect(result.user.role).toBe(AdminRole.MAIN_ADMIN);
    });
  });

  describe('4. Token Refresh & Rotation Security', () => {
    it('Should issue new access and refresh tokens when valid refresh token matches stored hash', async () => {
      // Set mock user's hashed refresh token
      const salt = await bcrypt.genSalt(10);
      mockUser.refreshToken = await bcrypt.hash('valid_refresh_token', salt);

      const tokens = await service.refreshTokens({ refreshToken: 'valid_refresh_token' });
      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalled();
    });

    it('Should reject refresh attempt with invalid or expired JWT token', async () => {
      await expect(
        service.refreshTokens({ refreshToken: 'expired_or_tampered_token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Should reject refresh attempt if refresh token does not match stored hash', async () => {
      const salt = await bcrypt.genSalt(10);
      mockUser.refreshToken = await bcrypt.hash('different_token', salt);

      await expect(
        service.refreshTokens({ refreshToken: 'valid_refresh_token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('5. Password Change & Account Security', () => {
    it('Should successfully update password when current password matches', async () => {
      const changeDto = { oldPassword: rawPassword, newPassword: 'NewStrongPassword123!' };
      const success = await service.changePassword(mockUserId, changeDto);

      expect(success).toBe(true);
      expect(mockUsersService.updatePassword).toHaveBeenCalled();
    });

    it('Should reject password change when current password is incorrect throwing UnauthorizedException', async () => {
      const changeDto = { oldPassword: 'WrongCurrentPassword', newPassword: 'NewStrongPassword123!' };
      await expect(service.changePassword(mockUserId, changeDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('6. Logout & Session Invalidation', () => {
    it('Should clear stored refresh token on logout', async () => {
      const result = await service.logout(mockUserId);
      expect(result).toBe(true);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(mockUserId, null);
    });
  });
});
