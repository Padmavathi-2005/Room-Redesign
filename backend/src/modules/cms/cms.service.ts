import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CmsPage, CmsPageDocument, PageStatus, BlockType } from './schemas/cms-page.schema';
import { CreateCmsPageDto } from './dto/create-cms-page.dto';
import { UpdateCmsPageDto } from './dto/update-cms-page.dto';

@Injectable()
export class CmsService implements OnModuleInit {
  private readonly logger = new Logger(CmsService.name);

  constructor(
    @InjectModel(CmsPage.name)
    private readonly cmsPageModel: Model<CmsPageDocument>,
  ) {}

  /**
   * Application Startup Hook: Seed default system CMS pages if clean
   */
  async onModuleInit() {
    try {
      const count = await this.cmsPageModel.countDocuments();
      if (count === 0) {
        await this.seedDefaultPages();
      }
    } catch (e: any) {
      this.logger.warn(`CMS DB seeding bypassed (${e.message})`);
    }
  }

  private async seedDefaultPages() {
    const defaultPages = [
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        description: 'Official Terms of Service and usage agreement for RoomAI platform.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Terms of Service',
              subtitle: 'Please review our terms of service governing your access and use of the RoomAI AI design platform.',
              badge: 'LEGAL AGREEMENT',
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using RoomAI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our services.',
            },
          },
          {
            id: 'text-2',
            type: BlockType.TEXT,
            content: {
              title: '2. User Accounts & Subscriptions',
              body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Commercial usage rights apply to paid subscribers.',
            },
          },
        ],
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        description: 'Privacy Policy detailing data collection, processing, and storage practices at RoomAI.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Privacy Policy',
              subtitle: 'Your privacy is paramount to us. Learn how RoomAI collects, protects, and handles your personal data.',
              badge: 'DATA PROTECTION',
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: 'Information Collection & Usage',
              body: 'We collect information you provide directly to us when creating an account, rendering room designs, or purchasing subscriptions. We do not sell your personal information to third parties.',
            },
          },
        ],
      },
      {
        title: 'About Us',
        slug: 'about-us',
        description: 'Discover RoomAI, the leading AI architectural rendering and interior redesign platform.',
        status: PageStatus.PUBLISHED,
        isSystemPage: false,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Redefining Architectural Visualization',
              subtitle: 'RoomAI empowers interior designers, architects, real estate agents, and homeowners with instant generative AI renders.',
              badge: 'OUR MISSION',
            },
          },
          {
            id: 'features-1',
            type: BlockType.FEATURES,
            content: {
              title: 'Why Designers Choose RoomAI',
              items: [
                { title: 'Sub-Second AI Renders', description: 'Transform raw floor plans and room photos into high-definition photorealistic 8K renders instantly.' },
                { title: '18 Specialized Design Models', description: 'Interior decorator, exterior facade, sketch-to-render, landscape, and color visualizer tools.' },
                { title: 'Monetized Marketplace', description: 'Publish custom project themes and earn credits when other designers purchase your workflows.' },
              ],
            },
          },
        ],
      },
    ];

    for (const page of defaultPages) {
      await this.cmsPageModel.create(page);
    }
    this.logger.log('✅ Default CMS Pages (Terms, Privacy, About) seeded successfully');
  }

  async create(createCmsPageDto: CreateCmsPageDto): Promise<CmsPageDocument> {
    const existing = await this.cmsPageModel.findOne({ slug: createCmsPageDto.slug }).exec();
    if (existing) {
      throw new ConflictException(`A CMS page with slug "${createCmsPageDto.slug}" already exists.`);
    }
    return this.cmsPageModel.create(createCmsPageDto);
  }

  async findAll(includeDrafts = true): Promise<CmsPageDocument[]> {
    const filter = includeDrafts ? {} : { status: PageStatus.PUBLISHED };
    return this.cmsPageModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findBySlug(slug: string, isVisitor = false): Promise<CmsPageDocument> {
    const page = await this.cmsPageModel.findOne({ slug }).exec();
    if (!page) {
      throw new NotFoundException(`CMS Page with slug "${slug}" not found.`);
    }

    if (isVisitor) {
      if (page.status !== PageStatus.PUBLISHED) {
        throw new NotFoundException(`CMS Page with slug "${slug}" is currently unpublished.`);
      }
      // Increment view count asynchronously
      this.cmsPageModel.updateOne({ _id: page._id }, { $inc: { views: 1 } }).exec().catch(() => {});
    }

    return page;
  }

  async findById(id: string): Promise<CmsPageDocument> {
    const page = await this.cmsPageModel.findById(id).exec();
    if (!page) {
      throw new NotFoundException(`CMS Page with ID "${id}" not found.`);
    }
    return page;
  }

  async update(id: string, updateCmsPageDto: UpdateCmsPageDto): Promise<CmsPageDocument> {
    if (updateCmsPageDto.slug) {
      const existing = await this.cmsPageModel.findOne({
        slug: updateCmsPageDto.slug,
        _id: { $ne: id },
      }).exec();

      if (existing) {
        throw new ConflictException(`A CMS page with slug "${updateCmsPageDto.slug}" already exists.`);
      }
    }

    const page = await this.cmsPageModel.findByIdAndUpdate(id, updateCmsPageDto, { new: true }).exec();
    if (!page) {
      throw new NotFoundException(`CMS Page with ID "${id}" not found.`);
    }
    return page;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const page = await this.findById(id);
    if (page.isSystemPage) {
      throw new ConflictException(`Core system pages (like ${page.title}) cannot be deleted.`);
    }
    await this.cmsPageModel.findByIdAndDelete(id).exec();
    return { success: true, message: 'CMS Page deleted successfully.' };
  }
}
