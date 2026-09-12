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
      await this.seedDefaultPages();
    } catch (e: any) {
      this.logger.warn(`CMS DB seeding bypassed (${e.message})`);
    }
  }

  private async seedDefaultPages() {
    const defaultPages = [
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        description: 'Official Terms of Service and legal usage agreement for RoomAI platform.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Terms of Service',
              subtitle: 'Please review our legal terms governing your access to RoomAI architectural & interior AI design services.',
              badge: 'LEGAL AGREEMENT',
              ctaText: 'View Acceptable Use Policy',
              ctaUrl: '/acceptable-use',
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: '1. Acceptance of Terms',
              body: '<p>By accessing or using RoomAI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our generative AI rendering services.</p>',
            },
          },
          {
            id: 'text-2',
            type: BlockType.TEXT,
            content: {
              title: '2. User Accounts & Subscriptions',
              body: '<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Commercial usage rights apply to active paid subscribers.</p>',
            },
          },
          {
            id: 'text-3',
            type: BlockType.TEXT,
            content: {
              title: '3. Intellectual Property & Commercial License',
              body: '<p>Subscribers on Pro and Agency plans receive full commercial ownership rights to renders generated on the platform. Free plan renders are intended strictly for personal exploration.</p>',
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Have Legal or Account Questions?',
              subhead: 'Our legal and support team is available 24/7 to assist with compliance inquiries.',
              buttonText: 'Contact Support',
              buttonUrl: '/contact',
            },
          },
        ],
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        description: 'Privacy Policy detailing data collection, AI model training, and privacy protections at RoomAI.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Privacy Policy',
              subtitle: 'Your privacy is paramount to us. Learn how RoomAI collects, protects, and handles your personal images & data.',
              badge: 'DATA PROTECTION',
              ctaText: 'Manage Cookie Preferences',
              ctaUrl: '/cookie-policy',
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: 'Information Collection & AI Processing',
              body: '<p>We collect information you provide directly to us when creating an account, uploading room images, rendering designs, or purchasing subscriptions. We do not sell your personal images or prompt inputs to third parties.</p>',
            },
          },
          {
            id: 'text-2',
            type: BlockType.TEXT,
            content: {
              title: 'GDPR & CCPA Rights',
              body: '<p>Under applicable privacy laws, you retain the right to request access to, correction of, or deletion of your personal account data and generated artwork at any time.</p>',
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Exercise Your Privacy Rights',
              subhead: 'Submit a data request or speak directly with our Data Protection Officer.',
              buttonText: 'Data Request',
              buttonUrl: '/contact',
            },
          },
        ],
      },
      {
        title: 'Refund & Cancellation Policy',
        slug: 'refund-policy',
        description: 'Official refund terms, credit adjustments, and subscription cancellation grace periods.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Refund & Cancellation Policy',
              subtitle: 'Clear, transparent billing terms for RoomAI subscriptions and AI generation credits.',
              badge: 'BILLING & REFUNDS',
              ctaText: 'Manage Subscription',
              ctaUrl: '/admin/plans',
            },
          },
          {
            id: 'features-1',
            type: BlockType.FEATURES,
            content: {
              title: 'Key Billing Guarantees',
              items: [
                { title: '14-Day Money-Back Guarantee', description: 'Request a full refund within 14 days if you have used fewer than 10 generation credits.' },
                { title: 'Cancel Anytime', description: 'Turn off auto-renewal anytime in your account profile without hidden penalties.' },
                { title: 'Pro-Rated Adjustments', description: 'Upgrade or downgrade plans anytime with automatic credit balance adjustments.' },
              ],
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: 'Subscription Renewals & Non-Refundable Credits',
              body: '<p>Subscriptions renew automatically on a recurring monthly or annual billing cycle unless cancelled before the renewal date. Unused bonus promotional credits are non-refundable once consumed.</p>',
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Need Help With a Billing Charge?',
              subhead: 'Submit a billing ticket and our support team will process your request within 24 hours.',
              buttonText: 'Submit Billing Ticket',
              buttonUrl: '/contact',
            },
          },
        ],
      },
      {
        title: 'Cookie & Data Policy',
        slug: 'cookie-policy',
        description: 'Detailed breakdown of cookie usage, session storage, and analytical tools.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Cookie & Tracking Policy',
              subtitle: 'How RoomAI uses cookies, local storage, and analytical sessions to optimize rendering speed.',
              badge: 'PRIVACY & COOKIES',
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: 'Essential & Analytical Cookies',
              body: '<p>RoomAI utilizes essential cookies to maintain secure authentication tokens and local user preferences. Analytical cookies assist us in diagnosing render latencies and improving AI generation speeds.</p>',
            },
          },
          {
            id: 'faq-1',
            type: BlockType.FAQ,
            content: {
              title: 'Frequently Asked Questions About Cookies',
              items: [
                { question: 'Can I opt out of analytics cookies?', answer: 'Yes, you can manage your browser preferences or disable non-essential cookies in your browser settings.' },
                { question: 'Do cookies store uploaded room photos?', answer: 'No, uploaded room photos are temporarily cached in secure cloud storage for render processing only.' },
              ],
            },
          },
        ],
      },
      {
        title: 'Acceptable Use & AI Rights Policy',
        slug: 'acceptable-use',
        description: 'Usage standards, image licensing, and prohibited prompt guidelines.',
        status: PageStatus.PUBLISHED,
        isSystemPage: true,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Acceptable Use & AI Rights',
              subtitle: 'Guidelines governing artificial intelligence render generation, prompt inputs, and commercial artwork rights.',
              badge: 'AI COMPLIANCE',
            },
          },
          {
            id: 'text-1',
            type: BlockType.TEXT,
            content: {
              title: 'Prohibited Uses & System Limits',
              body: '<p>Users may not generate illegal, defamatory, or abusive content, nor attempt to reverse-engineer RoomAI models or bypass rate limits. Accounts violating safety standards will be permanently suspended.</p>',
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Read Our Complete Terms of Service',
              subhead: 'Review legal terms and agreement details.',
              buttonText: 'Terms of Service',
              buttonUrl: '/terms-of-service',
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
              ctaText: 'Explore AI Studio',
              ctaUrl: '/generate',
            },
          },
          {
            id: 'image-1',
            type: BlockType.IMAGE,
            content: {
              imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
              caption: 'Photorealistic AI Render Generated in 1.4 seconds with RoomAI Japandi Model',
            },
          },
          {
            id: 'features-1',
            type: BlockType.FEATURES,
            content: {
              title: 'Why Designers Choose RoomAI',
              items: [
                { title: 'Sub-Second AI Renders', description: 'Transform raw floor plans and room photos into high-definition photorealistic 8K renders instantly.' },
                { title: '18 Specialized AI Models', description: 'Interior decorator, exterior facade, sketch-to-render, landscape, and color visualizer tools.' },
                { title: 'Commercial Licensing', description: 'Full commercial copyright rights to use generated renders in client pitches and marketing collateral.' },
              ],
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Experience Next-Gen Architectural Rendering',
              subhead: 'Join thousands of professional interior designers and architects already creating stunning spaces.',
              buttonText: 'Start Free Trial',
              buttonUrl: '/generate',
            },
          },
        ],
      },
      {
        title: 'Contact Support & Sales',
        slug: 'contact',
        description: 'Get in touch with RoomAI support, enterprise sales, and partnership inquiries.',
        status: PageStatus.PUBLISHED,
        isSystemPage: false,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Get in Touch With Our Team',
              subtitle: 'Have questions about RoomAI subscriptions, custom API integration, or enterprise licenses? We are here to help.',
              badge: 'WE ARE HERE TO HELP',
              ctaText: 'Launch AI Generator',
              ctaUrl: '/generate',
            },
          },
          {
            id: 'features-1',
            type: BlockType.FEATURES,
            content: {
              title: 'Support & Inquiry Channels',
              items: [
                { title: 'Technical Support', description: 'Available 24/7 for credit assistance and account questions via support@roomai.com.' },
                { title: 'Enterprise Sales', description: 'Custom API endpoints, dedicated GPU servers, and bulk multi-user team licensing.' },
                { title: 'Partnerships', description: 'Collaborate with us for real estate MLS integrations and furniture catalog placement.' },
              ],
            },
          },
          {
            id: 'faq-1',
            type: BlockType.FAQ,
            content: {
              title: 'Quick Contact FAQs',
              items: [
                { question: 'What is the average support response time?', answer: 'Our support team responds within 2 hours during standard business hours and 24 hours on weekends.' },
                { question: 'Do you offer custom API integrations?', answer: 'Yes! Enterprise plans include access to REST & WebSocket APIs for batch room processing.' },
              ],
            },
          },
        ],
      },
      {
        title: 'Frequently Asked Questions',
        slug: 'faq',
        description: 'Comprehensive answers to common questions about RoomAI renders, credits, and subscriptions.',
        status: PageStatus.PUBLISHED,
        isSystemPage: false,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Frequently Asked Questions',
              subtitle: 'Everything you need to know about RoomAI AI renders, credit usage, licensing, and model tools.',
              badge: 'HELP CENTER',
              ctaText: 'Try Generator',
              ctaUrl: '/generate',
            },
          },
          {
            id: 'faq-1',
            type: BlockType.FAQ,
            content: {
              title: 'General & Technical FAQs',
              items: [
                { question: 'How long does an AI room render take?', answer: 'Renders typically complete in 1 to 3 seconds depending on the selected AI model and resolution settings.' },
                { question: 'How do generation credits work?', answer: '1 standard generation consumes 1 credit. High-resolution 8K upscales consume 2 credits.' },
                { question: 'Can I upload hand-drawn sketches or floor plans?', answer: 'Yes! Our Sketch-to-Render and Floor Plan 3D models accept hand-drawn or CAD floor plan inputs.' },
                { question: 'Do I get commercial rights to generated images?', answer: 'Yes, subscribers on Pro and Agency plans hold 100% commercial usage rights for client work and listings.' },
                { question: 'What image formats can I export?', answer: 'You can export renders in high-resolution JPG, PNG, and WebP formats.' },
              ],
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Still Have Questions?',
              subhead: 'Our dedicated customer success team is ready to walk you through any feature.',
              buttonText: 'Contact Customer Support',
              buttonUrl: '/contact',
            },
          },
        ],
      },
      {
        title: 'Architectural Style & Design Guide',
        slug: 'styles-guide',
        description: 'Explore over 30+ interior design and architectural styles supported by RoomAI.',
        status: PageStatus.PUBLISHED,
        isSystemPage: false,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Interior Design & Style Guide',
              subtitle: 'Explore 30+ curated AI rendering styles: from Japandi and Minimalist to Industrial and Modern Villa.',
              badge: 'DESIGN CATALOG',
              ctaText: 'Test Styles Now',
              ctaUrl: '/generate',
            },
          },
          {
            id: 'image-1',
            type: BlockType.IMAGE,
            content: {
              imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
              caption: 'Japandi Modern Living Room Style Render with Natural Oak & Warm Ambient Lighting',
            },
          },
          {
            id: 'features-1',
            type: BlockType.FEATURES,
            content: {
              title: 'Popular AI Render Styles',
              items: [
                { title: 'Japandi & Scandinavian', description: 'Clean lines, warm muted tones, natural woods, and uncluttered organic elegance.' },
                { title: 'Industrial & Urban Loft', description: 'Exposed brick, matte black metal accents, concrete textures, and vintage leather.' },
                { title: 'Biophilic & Tropical Luxury', description: 'Abundant indoor greenery, floor-to-ceiling glass, natural stone, and soothing sunlight.' },
              ],
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Apply Any Style to Your Room Photos',
              subhead: 'Upload a picture of your space and watch it transform in seconds.',
              buttonText: 'Open Style Generator',
              buttonUrl: '/generate',
            },
          },
        ],
      },
      {
        title: 'Solutions for Real Estate Agents',
        slug: 'for-real-estate',
        description: 'Virtual staging and exterior renovation renders for real estate listing acceleration.',
        status: PageStatus.PUBLISHED,
        isSystemPage: false,
        blocks: [
          {
            id: 'hero-1',
            type: BlockType.HERO,
            content: {
              title: 'Virtual Staging for Real Estate Listings',
              subtitle: 'Sell properties up to 50% faster with photorealistic virtual staging and instant curb-appeal renovations.',
              badge: 'REAL ESTATE STAGING',
              ctaText: 'Stage a Room Free',
              ctaUrl: '/generate',
            },
          },
          {
            id: 'image-1',
            type: BlockType.IMAGE,
            content: {
              imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
              caption: 'Vacant Property Staged in Seconds with High-End Designer Furniture',
            },
          },
          {
            id: 'features-1',
            type: BlockType.FEATURES,
            content: {
              title: 'Real Estate Advantages',
              items: [
                { title: '90% Cost Reduction', description: 'Replace physical staging costing $3,000+ with instant sub-second AI virtual staging.' },
                { title: 'Day-to-Dusk Twilight Renders', description: 'Transform daytime exterior photos into striking golden-hour twilight property shots.' },
                { title: 'MLS Compliant High-Res Exports', description: 'Download ultra-high resolution images ready for Zillow, Realtor.com, and MLS portals.' },
              ],
            },
          },
          {
            id: 'cta-1',
            type: BlockType.CTA,
            content: {
              headline: 'Boost Your Listing Conversions Today',
              subhead: 'Start virtual staging your properties with RoomAI.',
              buttonText: 'Start Virtual Staging',
              buttonUrl: '/generate',
            },
          },
        ],
      },
    ];

    for (const page of defaultPages) {
      await this.cmsPageModel.findOneAndUpdate(
        { slug: page.slug },
        page,
        { upsert: true, new: true },
      );
    }
    this.logger.log('✅ 10 Default CMS Pages (System & Custom) seeded and updated successfully');
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

  async findBySlug(slug: string, isVisitor = false, visitorIp?: string): Promise<CmsPageDocument> {
    let slugQuery: any = { slug };
    if (slug === 'about' || slug === 'about-us') {
      slugQuery = { slug: { $in: ['about', 'about-us'] } };
    } else if (slug === 'terms' || slug === 'terms-of-service') {
      slugQuery = { slug: { $in: ['terms', 'terms-of-service'] } };
    } else if (slug === 'privacy' || slug === 'privacy-policy') {
      slugQuery = { slug: { $in: ['privacy', 'privacy-policy'] } };
    }

    const page = await this.cmsPageModel.findOne(slugQuery).exec();
    if (!page) {
      throw new NotFoundException(`CMS Page with slug "${slug}" not found.`);
    }

    if (isVisitor) {
      if (page.status !== PageStatus.PUBLISHED) {
        throw new NotFoundException(`CMS Page with slug "${slug}" is currently unpublished.`);
      }
      
      // Calculate view count based on UNIQUE IP addresses
      if (visitorIp) {
        this.cmsPageModel.findOneAndUpdate(
          { _id: page._id, viewedIps: { $ne: visitorIp } },
          {
            $addToSet: { viewedIps: visitorIp },
            $inc: { views: 1 },
          },
        ).exec().catch(() => {});
      }
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
