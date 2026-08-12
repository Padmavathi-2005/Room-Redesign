import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ColorPalette, ColorPaletteDocument } from './schemas/color-palette.schema';

const SEED_COLOR_PALETTES = [
  {
    slug: 'white',
    name: 'White',
    colors: ['#FFFFFF', '#F8F9FA', '#E9ECEF'],
    description: 'Ultra-bright, crisp white aesthetic with clean light reflections.',
  },
  {
    slug: 'beige',
    name: 'Beige',
    colors: ['#F5F5DC', '#E6D7C3', '#C2A68C'],
    description: 'Warm cream, soft ivory, and tranquil natural beige tones.',
  },
  {
    slug: 'black',
    name: 'Black',
    colors: ['#1C1C1E', '#2C2C2E', '#3A3A3C'],
    description: 'Sleek matte black accents, dark contrast, and dramatic depth.',
  },
  {
    slug: 'grey',
    name: 'Grey',
    colors: ['#8E8E93', '#AEAEB2', '#D1D1D6'],
    description: 'Monochromatic slate, cool charcoal, and balanced gray palette.',
  },
  {
    slug: 'earth-tone',
    name: 'Earth Tone',
    colors: ['#8C6D58', '#A0522D', '#D2B48C'],
    description: 'Terracotta pottery, warm ochre, sand, and rich clay earth tones.',
  },
  {
    slug: 'warm-wood',
    name: 'Warm Wood',
    colors: ['#8B4513', '#A0522D', '#CD853F'],
    description: 'Natural oak, teak, honey walnut, and warm timber finishes.',
  },
  {
    slug: 'dark-theme',
    name: 'Dark Theme',
    colors: ['#121212', '#1E1E1E', '#2D2D2D'],
    description: 'Moody dark mode interior aesthetic with warm ambient cove lighting.',
  },
  {
    slug: 'blue',
    name: 'Blue',
    colors: ['#1B263B', '#415A77', '#778DA9'],
    description: 'Serene navy blue, coastal ocean blue, and slate indigo hues.',
  },
  {
    slug: 'green',
    name: 'Green',
    colors: ['#2D5A27', '#4E7C48', '#8FBC8F'],
    description: 'Sage green, botanical olive, and fresh eucalyptus plant tones.',
  },
  {
    slug: 'neutral',
    name: 'Neutral',
    colors: ['#E5E5E0', '#D3D3CB', '#B0B0A8'],
    description: 'Harmonious muted neutrals, stone grey, and soft linen hues.',
  },
];

@Injectable()
export class ColorPalettesService implements OnModuleInit {
  private readonly logger = new Logger(ColorPalettesService.name);

  constructor(
    @InjectModel(ColorPalette.name)
    private readonly colorPaletteModel: Model<ColorPaletteDocument>,
  ) {}

  async onModuleInit() {
    try {
      for (const palette of SEED_COLOR_PALETTES) {
        await this.colorPaletteModel.updateOne(
          { slug: palette.slug },
          { $set: palette },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 10 Color Palettes into MongoDB colorpalettes collection!`);
    } catch (err) {
      this.logger.warn(`Could not seed colorpalettes into MongoDB Atlas (${err.message})`);
    }
  }

  async findAll(): Promise<ColorPalette[]> {
    try {
      const palettes = await this.colorPaletteModel.find().exec();
      if (palettes && palettes.length > 0) return palettes;
    } catch (e) {
      // Fall through
    }
    return SEED_COLOR_PALETTES as ColorPalette[];
  }

  async findBySlug(slug: string): Promise<ColorPalette> {
    try {
      const found = await this.colorPaletteModel.findOne({ slug }).exec();
      if (found) return found;
    } catch (e) {
      // Fall through
    }
    return SEED_COLOR_PALETTES.find((p) => p.slug === slug) as ColorPalette;
  }
}
