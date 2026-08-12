import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Environment, EnvironmentDocument } from './schemas/environment.schema';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);

  private readonly seedEnvironments = [
    {
      slug: 'city',
      name: 'City',
      description: 'Vibrant modern urban cityscape with glass high-rises and paved streetscape.',
      architecturalPromptBooster: 'set in a vibrant modern urban cityscape environment with surrounding glass high-rises and paved streetscape',
    },
    {
      slug: 'village',
      name: 'Village',
      description: 'Quaint rural village environment with cobblestone paths and rolling green hills.',
      architecturalPromptBooster: 'set in a charming quaint rural village environment with cobblestone paths and rolling green hills',
    },
    {
      slug: 'beach',
      name: 'Beach',
      description: 'Coastal tropical beach environment with ocean views and white palm sands.',
      architecturalPromptBooster: 'situated in a coastal tropical beach environment with ocean views, white palm sands, and sea breeze',
    },
    {
      slug: 'forest',
      name: 'Forest',
      description: 'Alpine pine forest environment surrounded by tall timber trees and woodland.',
      architecturalPromptBooster: 'surrounded by a dense alpine pine forest environment with tall timber trees and natural woodland backdrop',
    },
    {
      slug: 'mountain',
      name: 'Mountain',
      description: 'Dramatic mountain landscape environment with rocky peaks and alpine backdrop.',
      architecturalPromptBooster: 'perched in a dramatic mountain landscape environment with rocky peaks, clear sky, and alpine backdrop',
    },
    {
      slug: 'snow',
      name: 'Snow',
      description: 'Pristine winter wonderland environment with fresh snow covering ground and trees.',
      architecturalPromptBooster: 'set in a pristine winter wonderland environment with fresh white snow covering ground and pine trees',
    },
    {
      slug: 'lake-side',
      name: 'Lake Side',
      description: 'Tranquil lakeside waterfront environment with serene water reflections.',
      architecturalPromptBooster: 'situated on a tranquil lakeside waterfront environment with serene lake reflections and dock view',
    },
    {
      slug: 'desert',
      name: 'Desert',
      description: 'Warm desert landscape environment with sand dunes, rocks, and arid flora.',
      architecturalPromptBooster: 'located in a warm desert landscape environment with sand dunes, terracotta rocks, and arid flora',
    },
    {
      slug: 'countryside',
      name: 'Countryside',
      description: 'Wide open countryside environment with green meadows and wooden fences.',
      architecturalPromptBooster: 'nestled in a wide open countryside environment with green meadows, wooden fences, and natural horizon',
    },
  ];

  constructor(
    @InjectModel(Environment.name)
    private readonly environmentModel: Model<EnvironmentDocument>,
  ) {}

  async findAll(): Promise<Environment[]> {
    try {
      const environments = await this.environmentModel.find().exec();
      if (environments && environments.length > 0) {
        return environments;
      }
    } catch (err) {
      this.logger.warn(`MongoDB Environment fallback: ${err.message}`);
    }
    return this.seedEnvironments as any;
  }

  async findBySlug(slug: string): Promise<Environment | undefined> {
    try {
      const env = await this.environmentModel.findOne({ slug }).exec();
      if (env) return env;
    } catch (err) {
      // Fallback
    }
    return this.seedEnvironments.find((e) => e.slug === slug || e.name.toLowerCase() === slug.toLowerCase()) as any;
  }
}
