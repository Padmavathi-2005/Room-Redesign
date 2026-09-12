import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RoomGeneration, RoomDocument } from '../../rooms/schemas/room.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService implements OnModuleInit {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RoomGeneration.name) private readonly roomModel: Model<RoomDocument>,
  ) {}

  async onModuleInit() {
    try {
      await this.seedDefaultReviews();
    } catch (err: any) {
      console.warn('Reviews seeding note:', err.message);
    }
  }

  private async seedDefaultReviews() {
    // 1. Find user@yopmail.com (Alex User)
    const alexUser = await this.userModel.findOne({
      $or: [{ email: 'user@yopmail.com' }, { email: 'alex@yopmail.com' }],
    }).exec();

    // 2. Find any generated designs by Alex
    let alexGeneration: any = null;
    if (alexUser) {
      alexGeneration = await this.roomModel.findOne({ userId: alexUser._id }).exec();
    }

    // 3. Ensure Alex User review exists
    const alexEmail = alexUser ? alexUser.email : 'user@yopmail.com';
    const alexReviewExists = await this.reviewModel.findOne({ email: alexEmail }).exec();

    if (!alexReviewExists) {
      await this.reviewModel.create({
        name: alexUser ? `${alexUser.firstName || 'Alex'} ${alexUser.lastName || 'User'}`.trim() : 'Alex User',
        email: alexEmail,
        role: 'Verified Homeowner & Creator',
        company: 'Living Room Japandi Redesign',
        avatar: alexUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'RoomAI completely transformed my living room space into a modern Japandi sanctuary! The 8K photorealistic renders and lighting simulation gave our contractors the exact blueprints to follow without any guesswork.',
        roomType: alexGeneration?.roomType || 'Living Room',
        designTheme: alexGeneration?.theme || 'Japandi',
        designImageUrl: alexGeneration?.generatedImage || '',
        userId: alexUser ? alexUser._id : undefined,
        generationId: alexGeneration ? alexGeneration._id : undefined,
        isFeatured: true,
        status: 'approved',
      });
      console.log('✅ Seeded verified review for user@yopmail.com (Alex User) in MongoDB!');
    }

    // 4. Seed canonical designer reviews if collection has fewer than 6 reviews
    const count = await this.reviewModel.countDocuments().exec();
    if (count < 6) {
      const canonicalReviews = [
        {
          name: 'Elena Rostova',
          email: 'elena.rostova@luxinteriors.com',
          role: 'Lead Interior Designer',
          company: 'Studio Lux Interiors',
          avatar: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          text: 'RoomAI cut our client proposal rendering time from 4 days to literally 3 minutes. Our client proposal conversion rate went up 40% immediately!',
          roomType: 'Master Bedroom',
          designTheme: 'Modern Luxury',
          isFeatured: true,
          status: 'approved',
        },
        {
          name: 'Marcus Vance',
          email: 'marcus.vance@apexbuilders.com',
          role: 'Managing Director',
          company: 'Apex Commercial Builders',
          avatar: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          text: 'The AI 3D floor plan generator and site attendance tracking in the ERP module have been game changers for our multi-story commercial projects.',
          roomType: 'Commercial Office',
          designTheme: 'Industrial Chic',
          isFeatured: true,
          status: 'approved',
        },
        {
          name: 'Sarah Jenkins',
          email: 'sarah.j@compassluxury.com',
          role: 'Real Estate Broker',
          company: 'Compass Luxury Properties',
          avatar: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          text: 'Virtual staging with RoomAI lets us list empty homes looking fully furnished in luxury contemporary style without spending thousands on physical staging.',
          roomType: 'Open Living Space',
          designTheme: 'Scandinavian Contemporary',
          isFeatured: true,
          status: 'approved',
        },
        {
          name: 'David Chen',
          email: 'david@chenarchitecture.com',
          role: 'Principal Architect',
          company: 'Chen & Partners Architecture',
          avatar: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          text: 'Sketch to 4K render is magic. I upload hand sketches during client meetings and show them photorealistic exterior facade options live in real time.',
          roomType: 'Villa Exterior',
          designTheme: 'Biophilic Modern',
          isFeatured: true,
          status: 'approved',
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@designers.in',
          role: 'Homeowner & Renovator',
          company: 'Villa Redesign Project',
          avatar: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          text: 'Redesigned our entire villa interior before hiring contractors. We saved over $8,000 by testing furniture layouts and color schemes virtually first!',
          roomType: 'Kitchen & Dining',
          designTheme: 'Warm Minimalist',
          isFeatured: true,
          status: 'approved',
        },
      ];

      for (const item of canonicalReviews) {
        const existing = await this.reviewModel.findOne({ email: item.email }).exec();
        if (!existing) {
          await this.reviewModel.create(item);
        }
      }
      console.log('✅ Canonical reviews seeded into MongoDB successfully!');
    }
  }

  /**
   * Get all approved reviews with optional filters
   */
  async findAll(featuredOnly = false): Promise<ReviewDocument[]> {
    const filter: any = { status: 'approved' };
    if (featuredOnly) {
      filter.isFeatured = true;
    }
    return this.reviewModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get statistical summary for reviews (average rating, count, etc.)
   */
  async getStats() {
    const reviews = await this.reviewModel.find({ status: 'approved' }).exec();
    const count = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const avgRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 5.0;

    return {
      averageRating: avgRating,
      totalCount: count,
      companiesCount: '500+',
      onTimeRate: '99.4%',
      distribution: {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      },
    };
  }

  /**
   * Submit a new review & rating
   */
  async create(dto: CreateReviewDto, userId?: string): Promise<ReviewDocument> {
    const { generationId, ...restDto } = dto;
    const reviewData: any = {
      ...restDto,
      status: 'approved',
      isFeatured: true,
    };

    if (userId && Types.ObjectId.isValid(userId)) {
      reviewData.userId = new Types.ObjectId(userId);
      const user = await this.userModel.findById(userId).exec();
      if (user) {
        if (!reviewData.name) {
          reviewData.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
        }
        if (!reviewData.email) {
          reviewData.email = user.email;
        }
        if (user.avatar && !reviewData.avatar) {
          reviewData.avatar = user.avatar;
        }
      }
    }

    if (dto.generationId && Types.ObjectId.isValid(dto.generationId)) {
      reviewData.generationId = new Types.ObjectId(dto.generationId);
      const room = await this.roomModel.findById(dto.generationId).exec();
      if (room) {
        if (!reviewData.roomType) reviewData.roomType = room.roomType;
        if (!reviewData.designTheme) reviewData.designTheme = room.theme;
        if (!reviewData.designImageUrl && room.generatedImage) {
          reviewData.designImageUrl = room.generatedImage;
        }
      }
    }

    return this.reviewModel.create(reviewData);
  }
}
