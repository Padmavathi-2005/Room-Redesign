import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { PublishProjectDto } from './dto/publish-project.dto';
import { PurchaseProjectDto } from './dto/purchase-project.dto';
import { AddReviewDto } from './dto/add-review.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  /**
   * GET /api/v1/marketplace - List published projects filtered by toolSlug, roomType, style
   */
  @Get()
  findAll(
    @Query('toolSlug') toolSlug?: string,
    @Query('roomType') roomType?: string,
    @Query('style') style?: string,
    @Query('userId') userId?: string,
  ) {
    return this.marketplaceService.findAllPublished({
      toolSlug,
      roomType,
      style,
      userId,
    });
  }

  /**
   * GET /api/v1/marketplace/wishlist - Get active user wishlisted projects
   */
  @Get('wishlist')
  getUserWishlist(@Query('userId') userId: string) {
    return this.marketplaceService.getUserWishlist(userId);
  }

  /**
   * GET /api/v1/marketplace/earnings - Get seller earnings & sales history
   */
  @Get('earnings')
  getUserEarnings(@Query('userId') userId: string) {
    return this.marketplaceService.getUserEarnings(userId);
  }

  /**
   * GET /api/v1/marketplace/:id - Get single project details (Sanitized preview vs Full unlocked)
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.marketplaceService.findOne(id, userId);
  }

  /**
   * POST /api/v1/marketplace/publish - Publish redesign project to Community Marketplace
   */
  @Post('publish')
  publish(@Body() publishDto: PublishProjectDto) {
    return this.marketplaceService.publishProject(publishDto);
  }

  /**
   * POST /api/v1/marketplace/:id/purchase - Unlock published project (80% seller / 20% platform)
   */
  @Post(':id/purchase')
  purchase(@Param('id') id: string, @Body() purchaseDto: PurchaseProjectDto) {
    return this.marketplaceService.purchaseProject(id, purchaseDto);
  }

  /**
   * POST /api/v1/marketplace/:id/wishlist - Toggle project in user wishlist
   */
  @Post(':id/wishlist')
  toggleWishlist(@Param('id') id: string, @Body('userId') userId: string) {
    return this.marketplaceService.toggleWishlist(userId, id);
  }

  /**
   * POST /api/v1/marketplace/:id/review - Submit rating & review for published project
   */
  @Post(':id/review')
  addReview(@Param('id') id: string, @Body() addReviewDto: AddReviewDto) {
    return this.marketplaceService.addReview(id, addReviewDto);
  }
}
