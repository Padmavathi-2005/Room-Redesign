import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

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
