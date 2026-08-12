import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lighting, LightingDocument } from './schemas/lighting.schema';

@Injectable()
export class LightingService {
  private readonly logger = new Logger(LightingService.name);

  private readonly seedLightings = [
    {
      slug: 'warm',
      name: 'Warm',
      description: 'Soft warm golden hour ambient lighting with 2700K temperature glow.',
      architecturalPromptBooster: 'illuminated by soft warm golden hour ambient lighting with 2700K warm temperature glow',
    },
    {
      slug: 'cool',
      name: 'Cool',
      description: 'Crisp daylight 5000K cool architectural lighting with high clarity.',
      architecturalPromptBooster: 'illuminated by crisp daylight 5000K cool bright architectural lighting with clear contrast',
    },
    {
      slug: 'luxury-lighting',
      name: 'Luxury Lighting',
      description: 'Bespoke architectural lighting, dramatic uplighting, recessed spotlights, and brass sconces.',
      architecturalPromptBooster: 'featuring luxury bespoke architectural lighting, dramatic uplighting, dimmable recessed spotlights, and brass sconces',
    },
    {
      slug: 'landscape-lighting',
      name: 'Landscape Lighting',
      description: 'Outdoor garden bollard lights, tree uplights, and pathway step lights.',
      architecturalPromptBooster: 'accentuated by warm outdoor landscape lighting, garden bollard lights, tree uplights, and pathway step lights',
    },
    {
      slug: 'hidden-led',
      name: 'Hidden LED',
      description: 'Architectural hidden LED cove lighting strips along perimeters, soffits, and floating elements.',
      architecturalPromptBooster: 'highlighted by architectural hidden LED cove lighting strips along wall perimeters, soffits, and floating cabinetry',
    },
    {
      slug: 'wall-lights',
      name: 'Wall Lights',
      description: 'Modern wall sconces, vertical beam lights, and fixture illumination.',
      architecturalPromptBooster: 'flanked by elegant modern exterior wall sconces, vertical beam lights, and architectural fixture glow',
    },
    {
      slug: 'cozy-warm',
      name: 'Cozy & Warm',
      description: 'Cozy intimate warm atmosphere with soft ambient dimming.',
      architecturalPromptBooster: 'inviting cozy warm atmosphere with soft ambient fireplace glow and warm lamp light',
    },
    {
      slug: 'bright-natural',
      name: 'Bright & Natural',
      description: 'Ultra-bright natural daylight streaming through open glass windows.',
      architecturalPromptBooster: 'bright natural daylight streaming throughout the space with crisp clean shadows',
    },
    {
      slug: 'dramatic-mood',
      name: 'Dramatic Mood',
      description: 'Dramatic moody aesthetic with deep shadows and targeted spotlighting.',
      architecturalPromptBooster: 'dramatic moody aesthetic with rich deep shadows and targeted architectural spotlighting',
    },
  ];

  constructor(
    @InjectModel(Lighting.name)
    private readonly lightingModel: Model<LightingDocument>,
  ) {}

  async findAll(): Promise<Lighting[]> {
    try {
      const lightings = await this.lightingModel.find().exec();
      if (lightings && lightings.length > 0) {
        return lightings;
      }
    } catch (err) {
      this.logger.warn(`MongoDB Lighting fallback: ${err.message}`);
    }
    return this.seedLightings as any;
  }

  async findBySlug(slug: string): Promise<Lighting | undefined> {
    try {
      const lighting = await this.lightingModel.findOne({ slug }).exec();
      if (lighting) return lighting;
    } catch (err) {
      // Fallback
    }
    return this.seedLightings.find((l) => l.slug === slug || l.name.toLowerCase() === slug.toLowerCase()) as any;
  }
}
