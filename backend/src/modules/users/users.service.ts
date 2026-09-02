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
    // 1. Ensure Admin accounts do NOT exist in the User table
    await this.userModel.deleteMany({
      $or: [{ email: 'admin@gmail.com' }, { role: UserRole.ADMIN }],
    });

    // 2. Seed Default User Account: test@yopmail.com with 0 initial credits
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
        credits: 0,
        subscriptionTier: 'FREE',
      });
    } else if (existingTestUser.credits > 0 && (!existingTestUser.subscriptionTier || existingTestUser.subscriptionTier === 'FREE')) {
      existingTestUser.credits = 0;
      await existingTestUser.save();
    }

    // 3. Reset test accounts without active paid plans to 0 credits
    await this.userModel.updateMany(
      { subscriptionTier: { $in: ['FREE', null] } },
      { $set: { credits: 0 } }
    ).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: userData.email?.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const newUser = new this.userModel({
      ...userData,
      credits: 0,
      subscriptionTier: 'FREE',
    });
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
