import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mood, MoodDocument } from './schemas/mood.schema';

const SEED_MOODS = [
  { slug: 'cozy', name: 'Cozy', description: 'Warm, intimate atmosphere with soft plush textures and ambient lamps.' },
  { slug: 'luxury', name: 'Luxury', description: 'Opulent atmosphere featuring rich materials and high-end accents.' },
  { slug: 'elegant', name: 'Elegant', description: 'Sophisticated refined ambiance with classic proportions.' },
  { slug: 'warm', name: 'Warm', description: 'Welcoming golden sunlight and natural wood heat.' },
  { slug: 'bright', name: 'Bright', description: 'Sun-drenched, airy space filled with natural daylight.' },
  { slug: 'minimal', name: 'Minimal', description: 'Peaceful, clutter-free serenity and clean lines.' },
  { slug: 'professional', name: 'Professional', description: 'Focused executive look suitable for high productivity.' },
  { slug: 'creative', name: 'Creative', description: 'Inspiring artistic vibe with expressive colors and accents.' },
  { slug: 'relaxing', name: 'Relaxing', description: 'Calming spa-like retreat with gentle neutral tones.' },
  { slug: 'modern', name: 'Modern', description: 'Contemporary fresh atmosphere with polished finishes.' },
  { slug: 'premium', name: 'Premium', description: 'High-quality bespoke design aesthetic.' },
  { slug: 'family-friendly', name: 'Family Friendly', description: 'Comfortable, safe, durable and inviting layout.' },
];

@Injectable()
export class MoodsService implements OnModuleInit {
  private readonly logger = new Logger(MoodsService.name);

  constructor(
    @InjectModel(Mood.name)
    private readonly moodModel: Model<MoodDocument>,
  ) {}

  async onModuleInit() {
    try {
      for (const mood of SEED_MOODS) {
        await this.moodModel.updateOne(
          { slug: mood.slug },
          { $set: mood },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 12 Moods into MongoDB moods collection!`);
    } catch (err) {
      this.logger.warn(`Could not seed moods into MongoDB Atlas (${err.message})`);
    }
  }

  async findAll(): Promise<Mood[]> {
    try {
      const moods = await this.moodModel.find().exec();
      if (moods && moods.length > 0) return moods;
    } catch (e) {
      // Fall through
    }
    return SEED_MOODS as Mood[];
  }

  async findBySlug(slug: string): Promise<Mood> {
    try {
      const found = await this.moodModel.findOne({ slug }).exec();
      if (found) return found;
    } catch (e) {
      // Fall through
    }
    return SEED_MOODS.find((m) => m.slug === slug) as Mood;
  }
}
