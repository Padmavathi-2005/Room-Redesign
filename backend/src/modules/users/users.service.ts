import { Injectable, ConflictException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    try {
      await this.userModel.collection.dropIndex('phone_1');
    } catch (e) {
      // Index did not exist or already dropped
    }
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    // 1. Seed System Admin Account
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await this.userModel.create({
        email: adminEmail,
        password: '12345678',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
        credits: 1000,
        subscriptionTier: 'PROFESSIONAL',
      });
      console.log('----------------------------------------------------');
      console.log('Seeded default admin account: admin@gmail.com / 12345678');
      console.log('----------------------------------------------------');
    } else if (existingAdmin.role !== UserRole.ADMIN) {
      existingAdmin.role = UserRole.ADMIN;
      await existingAdmin.save();
      console.log('----------------------------------------------------');
      console.log('Promoted existing user to ADMIN role: admin@gmail.com');
      console.log('----------------------------------------------------');
    }

    // 2. Seed Default User Account: test@yopmail.com
    const testUserEmail = 'test@yopmail.com';
    const existingTestUser = await this.userModel.findOne({ email: testUserEmail });
    if (!existingTestUser) {
      await this.userModel.create({
        email: testUserEmail,
        password: '12345678',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
        credits: 100,
        subscriptionTier: 'STARTER',
      });
      console.log('----------------------------------------------------');
      console.log('Seeded default test user account: test@yopmail.com / 12345678');
      console.log('----------------------------------------------------');
    }

    // 3. Seed Additional Sample End-User Accounts
    const demoUsers = [
      { email: 'john.designer@gmail.com', firstName: 'John', lastName: 'Designer', role: UserRole.USER, credits: 50, subscriptionTier: 'STANDARD' },
      { email: 'sarah.architect@yahoo.com', firstName: 'Sarah', lastName: 'Architect', role: UserRole.USER, credits: 250, subscriptionTier: 'PROFESSIONAL' },
    ];

    for (const u of demoUsers) {
      const exists = await this.userModel.findOne({ email: u.email });
      if (!exists) {
        await this.userModel.create({
          email: u.email,
          password: '12345678',
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          isActive: true,
          credits: u.credits,
          subscriptionTier: u.subscriptionTier,
        });
      }
    }
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: userData.email?.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findByEmail(email: string, selectSecrets = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (selectSecrets) {
      query.select('+password +refreshToken');
    }
    return query.exec();
  }

  async findById(id: string, selectSecrets = false): Promise<UserDocument> {
    const query = this.userModel.findById(id);
    if (selectSecrets) {
      query.select('+password +refreshToken');
    }
    const user = await query.exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date(), loginAttempts: 0 }).exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword }).exec();
  }
}
