import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeOfDay, TimeOfDayDocument } from './schemas/time-of-day.schema';

@Injectable()
export class TimeOfDayService {
  private readonly logger = new Logger(TimeOfDayService.name);

  private readonly seedTimesOfDay = [
    {
      slug: 'morning',
      name: 'Morning',
      description: 'Crisp early morning sunlight with clear soft ambient shadows.',
      architecturalPromptBooster: 'captured during crisp early morning sunlight with clear soft ambient shadows',
    },
    {
      slug: 'afternoon',
      name: 'Afternoon',
      description: 'Bright clear midday afternoon sun with high visibility and sharp detail.',
      architecturalPromptBooster: 'captured during bright clear midday afternoon sun with high visibility and sharp detail',
    },
    {
      slug: 'golden-hour',
      name: 'Golden Hour',
      description: 'Warm rich golden hour sunlight streaming with long soft amber shadows.',
      architecturalPromptBooster: 'bathed in warm rich golden hour sunlight streaming with long soft amber shadows',
    },
    {
      slug: 'sunset',
      name: 'Sunset',
      description: 'Dramatic twilight sunset with vibrant crimson and orange sky gradients.',
      architecturalPromptBooster: 'captured during dramatic twilight sunset with vibrant crimson and orange sky gradients',
    },
    {
      slug: 'night',
      name: 'Night',
      description: 'Dark night sky, illuminated by exterior architectural fixture lighting and warm window glow.',
      architecturalPromptBooster: 'captured at night with dark night sky, illuminated by exterior architectural fixture lighting and warm window glow',
    },
    {
      slug: 'rainy',
      name: 'Rainy',
      description: 'Atmospheric overcast rainy weather with wet pavement reflections and soft mist.',
      architecturalPromptBooster: 'captured during atmospheric overcast rainy weather with wet pavement reflections and soft mist',
    },
    {
      slug: 'snow',
      name: 'Snow',
      description: 'Peaceful snowfall with fresh white snow covering surfaces and soft winter daylight.',
      architecturalPromptBooster: 'captured during peaceful snowfall with fresh white snow covering surfaces and soft winter daylight',
    },
  ];

  constructor(
    @InjectModel(TimeOfDay.name)
    private readonly timeOfDayModel: Model<TimeOfDayDocument>,
  ) {}

  async findAll(): Promise<TimeOfDay[]> {
    try {
      const records = await this.timeOfDayModel.find().exec();
      if (records && records.length > 0) {
        return records;
      }
    } catch (err) {
      this.logger.warn(`MongoDB TimeOfDay fallback: ${err.message}`);
    }
    return this.seedTimesOfDay as any;
  }

  async findBySlug(slug: string): Promise<TimeOfDay | undefined> {
    try {
      const record = await this.timeOfDayModel.findOne({ slug }).exec();
      if (record) return record;
    } catch (err) {
      // Fallback
    }
    return this.seedTimesOfDay.find((t) => t.slug === slug || t.name.toLowerCase() === slug.toLowerCase()) as any;
  }
}
