import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * GET /api/v1/reviews
   * Public list of reviews for landing page & customer showcase
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllReviews(@Query('featured') featured?: string) {
    const isFeatured = featured === 'true';
    const [reviews, stats] = await Promise.all([
      this.reviewsService.findAll(isFeatured),
      this.reviewsService.getStats(),
    ]);

    return {
      success: true,
      data: reviews,
      stats,
    };
  }

  /**
   * GET /api/v1/reviews/stats
   * Aggregated rating statistics
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    const stats = await this.reviewsService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * POST /api/v1/reviews
   * Submit a new customer review & rating
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    const created = await this.reviewsService.create(dto, userId);

    return {
      success: true,
      message: 'Thank you! Your review was submitted successfully.',
      data: created,
    };
  }
}
