import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PublishedProject, PublishedProjectDocument } from './schemas/published-project.schema';
import { ProjectPurchase, ProjectPurchaseDocument } from './schemas/project-purchase.schema';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { UserWallet, UserWalletDocument } from './schemas/user-wallet.schema';
import { PublishProjectDto } from './dto/publish-project.dto';
import { PurchaseProjectDto } from './dto/purchase-project.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(PublishedProject.name)
    private publishedProjectModel: Model<PublishedProjectDocument>,
    @InjectModel(ProjectPurchase.name)
    private projectPurchaseModel: Model<ProjectPurchaseDocument>,
    @InjectModel(Wishlist.name)
    private wishlistModel: Model<WishlistDocument>,
    @InjectModel(UserWallet.name)
    private userWalletModel: Model<UserWalletDocument>,
  ) {}

  /**
   * Publish a completed redesign project
   */
  async publishProject(dto: PublishProjectDto): Promise<PublishedProject> {
    const totalCount = dto.totalImageCount || (dto.lockedImageUrls ? dto.lockedImageUrls.length + 1 : 1);

    const createdProject = new this.publishedProjectModel({
      authorId: new Types.ObjectId(dto.authorId),
      sourceProjectId: dto.sourceProjectId ? new Types.ObjectId(dto.sourceProjectId) : undefined,
      title: dto.title,
      description: dto.description || '',
      price: dto.price,
      toolSlug: dto.toolSlug,
      roomType: dto.roomType,
      style: dto.style || 'Modern',
      sampleImageUrl: dto.sampleImageUrl,
      lockedImageUrls: dto.lockedImageUrls || [],
      originalImageUrl: dto.originalImageUrl || '',
      totalImageCount: totalCount,
      tags: dto.tags || [],
      status: 'published',
    });

    return createdProject.save();
  }

  /**
   * List all published projects with filters & paywall preview sanitization
   */
  async findAllPublished(filters: {
    toolSlug?: string;
    roomType?: string;
    style?: string;
    userId?: string;
  }) {
    const query: any = { status: 'published' };
    if (filters.toolSlug) query.toolSlug = filters.toolSlug;
    if (filters.roomType) query.roomType = filters.roomType;
    if (filters.style) query.style = filters.style;

    const projects = await this.publishedProjectModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email avatarUrl')
      .exec();

    // Check wishlist status for requesting user
    let userWishlistSet = new Set<string>();
    if (filters.userId && Types.ObjectId.isValid(filters.userId)) {
      const userWishlists = await this.wishlistModel
        .find({ userId: new Types.ObjectId(filters.userId) })
        .exec();
      userWishlistSet = new Set(userWishlists.map((w) => w.projectId.toString()));
    }

    // Sanitize response: Unpurchased listings show 1 sample image & metadata only
    return projects.map((p) => {
      const obj = p.toObject();
      const isWishlisted = userWishlistSet.has(obj._id.toString());

      return {
        _id: obj._id,
        author: obj.authorId,
        title: obj.title,
        description: obj.description,
        price: obj.price,
        toolSlug: obj.toolSlug,
        roomType: obj.roomType, // Space type details e.g., Living Room, Bedroom
        style: obj.style,
        sampleImageUrl: obj.sampleImageUrl, // 1 Sample Image for preview display
        totalImageCount: obj.totalImageCount, // Render count metadata e.g. 5 Renders
        tags: obj.tags,
        salesCount: obj.salesCount,
        wishlistCount: obj.wishlistCount,
        isWishlisted,
        isLocked: true, // Paywall indicator
        createdAt: obj.createdAt,
      };
    });
  }

  /**
   * Fetch single project detail with paywall logic check
   */
  async findOne(id: string, requesterId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }

    const project = await this.publishedProjectModel
      .findById(id)
      .populate('authorId', 'name email avatarUrl')
      .exec();

    if (!project) {
      throw new NotFoundException('Published project not found');
    }

    let hasFullAccess = false;
    let isWishlisted = false;

    if (requesterId && Types.ObjectId.isValid(requesterId)) {
      const reqObjId = new Types.ObjectId(requesterId);

      // Author has full access
      if (project.authorId['_id'].toString() === requesterId) {
        hasFullAccess = true;
      } else {
        // Check if user purchased the project
        const purchase = await this.projectPurchaseModel.findOne({
          buyerId: reqObjId,
          projectId: project._id,
          status: 'completed',
        });
        if (purchase) {
          hasFullAccess = true;
        }
      }

      // Check wishlist
      const wish = await this.wishlistModel.findOne({
        userId: reqObjId,
        projectId: project._id,
      });
      if (wish) isWishlisted = true;
    }

    const obj = project.toObject();

    if (hasFullAccess || obj.price === 0) {
      return {
        ...obj,
        author: obj.authorId,
        hasPurchased: true,
        isWishlisted,
        allImages: [obj.sampleImageUrl, ...(obj.lockedImageUrls || [])],
      };
    }

    // Paywall view: Return 1 sample image & metadata only
    return {
      _id: obj._id,
      author: obj.authorId,
      title: obj.title,
      description: obj.description,
      price: obj.price,
      toolSlug: obj.toolSlug,
      roomType: obj.roomType,
      style: obj.style,
      sampleImageUrl: obj.sampleImageUrl,
      totalImageCount: obj.totalImageCount,
      tags: obj.tags,
      salesCount: obj.salesCount,
      wishlistCount: obj.wishlistCount,
      hasPurchased: false,
      isWishlisted,
      isLocked: true,
      lockedCount: (obj.lockedImageUrls || []).length,
      createdAt: obj.createdAt,
    };
  }

  /**
   * Toggle item in user wishlist
   */
  async toggleWishlist(userId: string, projectId: string) {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid user or project ID');
    }

    const userObjId = new Types.ObjectId(userId);
    const projObjId = new Types.ObjectId(projectId);

    const existing = await this.wishlistModel.findOne({
      userId: userObjId,
      projectId: projObjId,
    });

    if (existing) {
      await this.wishlistModel.deleteOne({ _id: existing._id });
      await this.publishedProjectModel.findByIdAndUpdate(projObjId, {
        $inc: { wishlistCount: -1 },
      });
      return { wishlisted: false, message: 'Removed from wishlist' };
    } else {
      await this.wishlistModel.create({
        userId: userObjId,
        projectId: projObjId,
      });
      await this.publishedProjectModel.findByIdAndUpdate(projObjId, {
        $inc: { wishlistCount: 1 },
      });
      return { wishlisted: true, message: 'Added to wishlist' };
    }
  }

  /**
   * Fetch active user wishlisted projects
   */
  async getUserWishlist(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const wishlists = await this.wishlistModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'projectId',
        populate: { path: 'authorId', select: 'name email avatarUrl' },
      })
      .sort({ createdAt: -1 })
      .exec();

    return wishlists
      .filter((w) => w.projectId)
      .map((w) => {
        const p: any = w.projectId;
        return {
          _id: p._id,
          author: p.authorId,
          title: p.title,
          description: p.description,
          price: p.price,
          toolSlug: p.toolSlug,
          roomType: p.roomType,
          style: p.style,
          sampleImageUrl: p.sampleImageUrl,
          totalImageCount: p.totalImageCount,
          isWishlisted: true,
          createdAt: p.createdAt,
        };
      });
  }

  /**
   * Purchase published project & process creator payout (80% seller / 20% platform)
   */
  async purchaseProject(projectId: string, dto: PurchaseProjectDto) {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(dto.buyerId)) {
      throw new BadRequestException('Invalid project or buyer ID');
    }

    const project = await this.publishedProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Published project not found');
    }

    const buyerObjId = new Types.ObjectId(dto.buyerId);
    const sellerObjId = project.authorId;

    if (sellerObjId.toString() === dto.buyerId) {
      throw new BadRequestException('Author cannot purchase their own project');
    }

    // Check existing purchase
    const existingPurchase = await this.projectPurchaseModel.findOne({
      buyerId: buyerObjId,
      projectId: project._id,
      status: 'completed',
    });

    if (existingPurchase) {
      throw new ConflictException('User has already purchased this project');
    }

    const amountPaid = project.price;
    const platformFee = Number((amountPaid * 0.2).toFixed(2)); // 20% commission
    const sellerEarnings = Number((amountPaid * 0.8).toFixed(2)); // 80% net credited

    // Record purchase transaction
    const purchase = await this.projectPurchaseModel.create({
      buyerId: buyerObjId,
      sellerId: sellerObjId,
      projectId: project._id,
      amountPaid,
      platformFee,
      sellerEarnings,
      stripePaymentIntentId: dto.stripePaymentMethodId || `pi_sim_${Date.now()}`,
      status: 'completed',
    });

    // Update project sales count
    await this.publishedProjectModel.findByIdAndUpdate(project._id, {
      $inc: { salesCount: 1 },
    });

    // Credit seller wallet
    await this.userWalletModel.findOneAndUpdate(
      { userId: sellerObjId },
      {
        $inc: { balance: sellerEarnings, totalEarned: sellerEarnings },
      },
      { upsert: true, new: true },
    );

    return {
      success: true,
      message: `Project purchased successfully! $${sellerEarnings} credited to seller.`,
      purchaseId: purchase._id,
      unlockedContent: {
        title: project.title,
        sampleImageUrl: project.sampleImageUrl,
        lockedImageUrls: project.lockedImageUrls,
        originalImageUrl: project.originalImageUrl,
        totalImageCount: project.totalImageCount,
      },
    };
  }

  /**
   * Fetch seller earnings, wallet balance & sales history
   */
  async getUserEarnings(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userObjId = new Types.ObjectId(userId);

    const wallet = await this.userWalletModel.findOne({ userId: userObjId });
    const sales = await this.projectPurchaseModel
      .find({ sellerId: userObjId, status: 'completed' })
      .populate('projectId', 'title price roomType sampleImageUrl')
      .populate('buyerId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .exec();

    return {
      balance: wallet ? wallet.balance : 0,
      totalEarned: wallet ? wallet.totalEarned : 0,
      totalSalesCount: sales.length,
      recentSales: sales,
    };
  }
}
