import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesignStyle, DesignStyleDocument } from './schemas/design-style.schema';

const SEED_DESIGN_STYLES = [
  {
    slug: 'modern',
    name: 'Modern',
    description: 'Clean geometric lines, sleek furniture, bright contrast, polished surfaces, and subtle warm illumination.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'minimalist',
    name: 'Minimalist',
    description: 'Clutter-free spacious layout, essential furniture only, light oak and neutral tones.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'industrial',
    name: 'Industrial',
    description: 'Exposed brick wall, dark steel accents, rich cognac leather seating, concrete textures.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'traditional',
    name: 'Traditional',
    description: 'Classic crown molding, rich mahogany wood, velvet upholstered armchairs, and warm chandeliers.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'scandinavian',
    name: 'Scandinavian',
    description: 'Ultra-bright sunlit space, light oak wood elements, cozy white textiles, neutral beige.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'japandi',
    name: 'Japandi',
    description: 'Wabi-sabi aesthetic, warm sunlit minimalism, light bamboo & oak, paper pendant lamps.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'luxury',
    name: 'Luxury',
    description: 'High-end marble surfaces, gold metallic accents, plush velvet furniture, and ambient cove lighting.',
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'rustic',
    name: 'Rustic',
    description: 'Reclaimed timber beams, raw stone fireplace hearth, earthy textured fabrics.',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c5163?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'bohemian',
    name: 'Bohemian',
    description: 'Vivid woven textiles, rattan furniture, layered rugs, terracotta pottery, lush indoor tropical plants.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'classic',
    name: 'Classic',
    description: 'Timeless proportioned furnishings, ornate wall paneling, sophisticated neutral palette.',
    image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'contemporary',
    name: 'Contemporary',
    description: 'State-of-the-art bright lighting fixtures, smooth glossy textures, curved modern furniture.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'mediterranean',
    name: 'Mediterranean',
    description: 'Terracotta tile flooring, whitewashed stucco walls, wrought iron accents, warm coastal glow.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'farmhouse',
    name: 'Farmhouse',
    description: 'Apron front sinks, shiplap accent walls, distressed wood dining tables, rustic metal fixtures.',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
  {
    slug: 'coastal',
    name: 'Coastal',
    description: 'Breezy light blues, natural jute rugs, driftwood decor, relaxed linen fabrics.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop',
    category: 'interior',
  },
];

@Injectable()
export class DesignStylesService implements OnModuleInit {
  private readonly logger = new Logger(DesignStylesService.name);

  constructor(
    @InjectModel(DesignStyle.name)
    private readonly designStyleModel: Model<DesignStyleDocument>,
  ) {}

  async onModuleInit() {
    try {
      for (const style of SEED_DESIGN_STYLES) {
        await this.designStyleModel.updateOne(
          { slug: style.slug },
          { $set: style },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 14 Design Styles into MongoDB designstyles collection!`);
    } catch (err) {
      this.logger.warn(`Could not seed designstyles into MongoDB Atlas (${err.message})`);
    }
  }

  async findAll(): Promise<DesignStyle[]> {
    try {
      const styles = await this.designStyleModel.find().exec();
      if (styles && styles.length > 0) return styles;
    } catch (e) {
      // Fall through
    }
    return SEED_DESIGN_STYLES as DesignStyle[];
  }

  async findBySlug(slug: string): Promise<DesignStyle> {
    try {
      const found = await this.designStyleModel.findOne({ slug }).exec();
      if (found) return found;
    } catch (e) {
      // Fall through
    }
    return SEED_DESIGN_STYLES.find((s) => s.slug === slug) as DesignStyle;
  }
}
