import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument, ThemeMode } from './schemas/setting.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

export const DEFAULT_HOMEPAGE_SECTIONS = {
  hero: {
    translations: {
      en: {
        badge: 'Trusted Construction ERP',
        title: 'Build Better. Manage Smarter. Deliver Faster.',
        subtitle: 'The only digital craftsmanship platform designed to unite your field and office. Seamlessly manage budgets, logistics, and labor in one high-performance interface.',
        primaryCta: 'Start Free Trial',
        secondaryCta: 'Book a Demo',
      },
      ar: {
        badge: 'نظام معتمد لإدارة وتصميم الإنشاءات',
        title: 'ابنِ بشكل أفضل. أدر بذكاء أكبر. سلّم بشكل أسرع.',
        subtitle: 'المنصة الحرفية الرقمية الوحيدة المصممة لتوحيد موقع العمل والمكتب. أدر الميزانيات والخدمات اللوجستية والعمالة بسلاسة في واجهة واحدة عالية الأداء.',
        primaryCta: 'ابدأ التجربة المجانية',
        secondaryCta: 'احجز عرضاً توضيحياً',
      },
    },
  },
  video: {
    translations: {
      en: {
        badge: 'Platform Demonstration',
        title: 'Experience the Power of RoomAI',
        subtitle: 'Watch how our AI-driven design studio transforms ordinary spatial concepts into high-end architectural reality in seconds.',
      },
      ar: {
        badge: 'عرض توضيحي للمنصة',
        title: 'اختبر قوة منصة RoomAI',
        subtitle: 'شاهد كيف يحول استوديو التصميم المدعوم بالذكاء الاصطناعي المفاهيم المكانية العادية إلى واقع معماري راقٍ في ثوانٍ.',
      },
    },
  },
  whyChoose: {
    translations: {
      en: {
        badge: 'Core Advantages',
        title: 'Why Choose RoomAI for Your Spaces',
        subtitle: 'Architectural precision meets cutting-edge generative AI, delivering professional render fidelity in seconds.',
      },
      ar: {
        badge: 'المزايا الجوهرية',
        title: 'لماذا تختار RoomAI لتصميم مساحاتك',
        subtitle: 'الدقة المعمارية تلتقي بأحدث تقنيات الذكاء الاصطناعي التوليدي لتقديم تصاميم فائقة الجودة في ثوانٍ.',
      },
    },
  },
  whoBenefits: {
    translations: {
      en: {
        badge: 'Target Audiences',
        title: 'Who Benefits From Our Digital Platform',
        subtitle: 'Empowering interior designers, architects, real estate developers, and homeowners with photorealistic visualization tools.',
      },
      ar: {
        badge: 'لمن صُممت المنصة',
        title: 'من يستفيد من منصتنا الرقمية',
        subtitle: 'تمكين مصممي الديكور الداخلي والمهندسين المعماريين والمطورين العقاريين وأصحاب المنازل بأدوات تصوير واقعية مذهلة.',
      },
    },
  },
  exploreTools: {
    translations: {
      en: {
        badge: 'AI Studio Suite',
        title: 'Explore Powerful Architectural Redesign Tools',
        subtitle: 'From interior revamps to exterior transformations, explore our suite of intelligent redesign tools tailored to your spatial needs.',
      },
      ar: {
        badge: 'مجموعة أدوات استوديو الذكاء الاصطناعي',
        title: 'استكشف أدوات إعادة التصميم المعماري القوية',
        subtitle: 'من التجديدات الداخلية إلى التحولات الخارجية، استكشف أدوات إعادة التصميم الذكية المصممة خصيصاً لاحتياجاتك المكانية.',
      },
    },
  },
  howItWorks: {
    translations: {
      en: {
        badge: 'Workflow',
        title: 'How It Works in 3 Simple Steps',
        subtitle: 'Transform any space with photorealistic precision effortlessly.',
      },
      ar: {
        badge: 'طريقة العمل',
        title: 'كيف يعمل في 3 خطوات بسيطة',
        subtitle: 'حوّل أي مساحة بدقة واقعية فائقة بكل سهولة.',
      },
    },
  },
  ctaBanner: {
    translations: {
      en: {
        badge: 'Start Your Journey',
        title: 'Start Smarter Home Design with RoomAI Today',
        subtitle: 'Join thousands of designers, architects, and homeowners elevating spatial concepts into photorealistic reality.',
        primaryCta: 'Get Started Free',
      },
      ar: {
        badge: 'ابدأ رحلتك الآن',
        title: 'ابدأ تصميماً أذكى لمنزلك مع RoomAI اليوم',
        subtitle: 'انضم إلى آلاف المصممين والمهندسين وأصحاب المنازل الذين يحولون الأفكار المكانية إلى واقع ملموس بدقة فائقة.',
        primaryCta: 'ابدأ مجاناً الآن',
      },
    },
  },
};

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>,
  ) {}

  /**
   * Application Startup Hook: Seed or update settings in DB with default colors & homepage sections
   */
  async onModuleInit() {
    try {
      const existing = await this.settingModel.findOne();
      if (!existing) {
        await this.settingModel.create({
          applicationName: 'RoomAI',
          activeTheme: ThemeMode.LIGHT,
          primaryColor: '#1D4ED8',
          secondaryColor: '#7C3AED',
          accentColor: '#06B6D4',
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
          borderRadius: 16,
          glassOpacity: 0.7,
          blurStrength: 20,
          maintenanceMode: false,
          creditsPerGeneration: 1,
          homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
        });
        this.logger.log('✅ Default Settings Created with Homepage Multilingual Sections');
      } else {
        const updatePayload: any = {
          primaryColor: '#1D4ED8',
          secondaryColor: '#7C3AED',
          creditsPerGeneration: 1,
        };
        // If homepageSections is empty or not present, seed it
        if (!existing.homepageSections || Object.keys(existing.homepageSections).length === 0) {
          updatePayload.homepageSections = DEFAULT_HOMEPAGE_SECTIONS;
        }
        await this.settingModel.updateOne({}, { $set: updatePayload });
        this.logger.log('✅ Settings Initialized with Homepage Sections');
      }
    } catch (e) {
      this.logger.warn(`Settings DB initialization bypassed (${e.message})`);
    }
  }

  /**
   * Get application settings document
   */
  async getSettings(): Promise<SettingDocument> {
    let settings = await this.settingModel.findOne().exec();
    if (!settings) {
      settings = await this.settingModel.create({
        applicationName: 'RoomAI',
        activeTheme: ThemeMode.LIGHT,
        primaryColor: '#1D4ED8',
        secondaryColor: '#7C3AED',
        accentColor: '#06B6D4',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        borderRadius: 16,
        glassOpacity: 0.7,
        blurStrength: 20,
        maintenanceMode: false,
        creditsPerGeneration: 1,
      });
    }
    return settings;
  }

  /**
   * Update application settings
   */
  async updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<SettingDocument> {
    const settings = await this.getSettings();
    Object.assign(settings, updateSettingsDto);
    return settings.save();
  }
}
