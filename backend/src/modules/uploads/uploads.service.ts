import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaFile, MediaFileDocument } from './schemas/media-file.schema';
import { ProductTool, ProductToolDocument } from './schemas/product-tool.schema';
import * as path from 'path';
import axios from 'axios';
import { StorageService } from '../storage/storage.service';
import { PreprocessingService } from '../preprocessing/preprocessing.service';

const SEED_TOOLS = [
  // --- FLOOR PLAN ---
  {
    slug: 'floor-plan-generator',
    name: 'Floor Plan Generator',
    category: 'floorplan',
    creditCost: 4,
    badge: 'Model 01',
    description: 'Convert sketches or layout specs into precise 2D architectural floor plans with dimensions.',
    originalImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Full House', 'Apartment', 'Studio'],
    supportedStyles: ['Architectural 2D', 'Clean Blueprint'],
    defaultPromptTemplate: 'A 2D architectural floor plan generator with dimensions and room labels',
  },
  {
    slug: '3d-floor-plan',
    name: '3D Floor Plan',
    category: 'floorplan',
    creditCost: 8,
    badge: 'Popular',
    description: 'Transform 2D floor plans into interactive isometric 3D cutaway models with realistic furniture.',
    originalImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Full House', 'Apartment', 'Villa'],
    supportedStyles: ['3D Isometric', 'Photorealistic Cutaway'],
    defaultPromptTemplate: 'An isometric 3D floor plan render with furniture layout and soft lighting',
  },
  {
    slug: 'floor-plan-maker',
    name: 'Floor Plan Maker',
    category: 'floorplan',
    creditCost: 4,
    badge: 'CAD Builder',
    description: 'Generative CAD schematic maker for wall layouts, doors, windows, and room dimensions.',
    originalImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Office'],
    supportedStyles: ['CAD Schematic', 'Vector Layout'],
    defaultPromptTemplate: 'A vector schematic floor plan with wall thickness and furniture placement',
  },

  // --- INTERIOR ---
  {
    slug: 'interior-design',
    name: 'Interior Design AI',
    category: 'interior',
    creditCost: 4,
    badge: 'Top Rated',
    description: 'Reimagine living rooms, bedrooms, and kitchens in 15+ architectural styles (Japandi, Modern, Boho).',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'],
    supportedStyles: ['Modern', 'Scandinavian', 'Japandi', 'Industrial', 'Luxury', 'Boho', 'Minimalist'],
    defaultPromptTemplate: 'A photorealistic interior redesign of a {roomType} in {style} style',
  },
  {
    slug: 'kitchen-design',
    name: 'Kitchen Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Design luxury kitchens with custom marble countertops, modern islands, and elegant cabinetry.',
    originalImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Kitchen'],
    supportedStyles: ['Modern', 'Farmhouse', 'Minimalist', 'Industrial', 'Marble Luxury'],
    defaultPromptTemplate: 'A luxury kitchen redesign with modern countertops and custom cabinetry',
  },
  {
    slug: 'bathroom-design',
    name: 'Bathroom Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Create spa-like bathroom retreats with marble vanities, glass showers, and brass fixtures.',
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Bathroom', 'Powder Room'],
    supportedStyles: ['Modern Spa', 'Marble Luxury', 'Minimalist Tile', 'Rustic Wood'],
    defaultPromptTemplate: 'A modern luxury bathroom redesign with walk-in glass shower and marble vanity',
  },
  {
    slug: 'bedroom-design',
    name: 'Bedroom Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Redesign bedrooms with plush headboards, warm ambient lighting, and cozy neutral palettes.',
    originalImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Master Bedroom', 'Guest Bedroom', 'Kids Room'],
    supportedStyles: ['Cozy Japandi', 'Modern Luxury', 'Minimalist Neutral', 'Boho Chic'],
    defaultPromptTemplate: 'A peaceful master bedroom design with upholstered bed and warm ambient lighting',
  },
  {
    slug: 'office-design',
    name: 'Office Design AI',
    category: 'interior',
    creditCost: 4,
    description: 'Build modern executive home offices with ergonomic setups, oak shelving, and ambient warmth.',
    originalImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Home Office', 'Corporate Office', 'Executive Suite'],
    supportedStyles: ['Ergonomic Modern', 'Industrial Loft', 'Minimalist Wood', 'Executive Dark Leather'],
    defaultPromptTemplate: 'A modern ergonomic home office setup with executive desk and bookshelf',
  },
  {
    slug: 'ai-room-decorator',
    name: 'AI Room Decorator',
    category: 'interior',
    creditCost: 4,
    badge: 'Popular',
    description: 'Instantly add curated furniture, indoor plants, wall art, and cozy decor to any space.',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Office'],
    supportedStyles: ['Modern', 'Cozy Chic', 'Art Deco', 'Bohemian'],
    defaultPromptTemplate: 'Decorate room with stylish furniture, wall art, plants, and ambient lighting',
  },
  {
    slug: 'style-transfer',
    name: 'Style Transfer',
    category: 'interior',
    creditCost: 4,
    badge: 'Reference AI',
    description: 'Extract aesthetics from reference photos and transfer them directly into your room render.',
    originalImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Office'],
    supportedStyles: ['Japandi', 'Industrial', 'Scandinavian', 'Cyberpunk', 'Mid-Century'],
    defaultPromptTemplate: 'Apply architectural style transfer using {style} design aesthetic',
  },
  {
    slug: 'ai-room-cleaner',
    name: 'AI Room Cleaner',
    category: 'editing',
    creditCost: 2,
    badge: 'Declutter',
    description: 'Remove clutter, stray boxes, and unwanted items to reveal clean, empty architectural spaces.',
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Office'],
    supportedStyles: ['Clean', 'Empty Space'],
    defaultPromptTemplate: 'De-clutter and clean room space removing all unwanted mess and stray items',
  },
  {
    slug: 'paint-color-visualizer',
    name: 'Paint Color Visualizer',
    category: 'editing',
    creditCost: 2,
    badge: 'Wall Paint',
    description: 'Test thousands of paint colors on your room walls before purchasing real paint.',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen'],
    supportedStyles: ['Matte', 'Gloss', 'Satin', 'Eggshell'],
    defaultPromptTemplate: 'Change room wall paint color to {colorPalette}',
  },
  {
    slug: 'change-room-light',
    name: 'Change Room Light',
    category: 'editing',
    creditCost: 2,
    badge: 'Lighting AI',
    description: 'Switch daylighting to golden hour, cozy sunset warm lights, or moody ambient dusk glow.',
    originalImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen'],
    supportedStyles: ['Sunset Warm', 'Golden Hour', 'Cool Daylight', 'Cyberpunk Neon', 'Soft Evening'],
    defaultPromptTemplate: 'Transform room lighting mood to {lighting}',
  },
  {
    slug: 'ai-wall-design',
    name: 'AI Wall Design',
    category: 'editing',
    creditCost: 3,
    badge: 'Wall Accent',
    description: 'Add luxury wood slat panels, textured marble backdrops, or exposed brick accent walls.',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Dining Room'],
    supportedStyles: ['Accent Wood Slat', 'Textured Marble', 'Wallpaper Pattern', 'Exposed Brick'],
    defaultPromptTemplate: 'Redesign main wall with luxury accent materials',
  },
  {
    slug: 'ai-flooring-design',
    name: 'AI Flooring Design',
    category: 'editing',
    creditCost: 3,
    badge: 'Flooring',
    description: 'Replace flooring with herringbone oak hardwood, terrazzo tiles, or polished concrete.',
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Hallway'],
    supportedStyles: ['Herringbone Hardwood', 'Light Oak Plank', 'Polished Concrete', 'Terrazzo Tile'],
    defaultPromptTemplate: 'Replace room floor material with high quality premium flooring',
  },
  {
    slug: 'change-furniture-ai',
    name: 'Change Furniture AI',
    category: 'editing',
    creditCost: 3,
    description: 'Swap individual sofas, tables, or beds while preserving room walls and ceiling layout.',
    originalImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Office'],
    supportedStyles: ['Modern Leather', 'Scandinavian Fabric', 'Velvet Luxury'],
    defaultPromptTemplate: 'Replace existing furniture with new stylish design pieces',
  },

  // --- EXTERIOR ---
  {
    slug: 'exterior-design',
    name: 'Exterior Design AI',
    category: 'exterior',
    creditCost: 4,
    badge: 'Facade AI',
    description: 'Redesign building facades with modern glass, warm wood accents, and contemporary cladding.',
    originalImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['House Front', 'Villa Facade', 'Commercial Building'],
    supportedStyles: ['Modern Glass Villa', 'Modern Farmhouse', 'Contemporary Wood & Concrete', 'Mediterranean'],
    defaultPromptTemplate: 'A photorealistic architectural exterior redesign of building facade',
  },
  {
    slug: 'landscape-design',
    name: 'Landscape Design',
    category: 'exterior',
    creditCost: 4,
    badge: 'Outdoor',
    description: 'Design lush front lawns, stone pathways, outdoor pergolas, and serene backyard patios.',
    originalImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Backyard', 'Front Lawn', 'Patio Area'],
    supportedStyles: ['Zen Garden', 'Modern Lawn', 'Tropical Resort', 'English Countryside'],
    defaultPromptTemplate: 'A luxury landscape garden design with stone pathways and luxury greenery',
  },
  {
    slug: 'garden-design',
    name: 'Garden Design',
    category: 'exterior',
    creditCost: 4,
    badge: 'Botanical',
    description: 'Create tranquil botanical gardens, Japanese Zen courtyards, and flower-bed arrangements.',
    originalImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Garden', 'Courtyard'],
    supportedStyles: ['Japanese Zen', 'Botanical Paradise', 'Minimalist Patio'],
    defaultPromptTemplate: 'A tranquil garden design with flower beds and outdoor seating area',
  },
  {
    slug: 'change-sky',
    name: 'Change Sky',
    category: 'editing',
    creditCost: 2,
    badge: 'Sky Swap',
    description: 'Replace dull overcast exterior skies with vibrant blue sunshine or dramatic sunset clouds.',
    originalImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Exterior Facade', 'Landscape'],
    supportedStyles: ['Dramatic Sunset', 'Blue Sky Sunshine', 'Starry Night', 'Golden Hour'],
    defaultPromptTemplate: 'Replace exterior sky background with clear atmospheric lighting',
  },
  {
    slug: 'sketch-to-render',
    name: 'Sketch to Render',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Convert quick pencil or CAD line sketches into 8k photorealistic architectural renders.',
    originalImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Architectural Drawing', 'Hand Sketch'],
    supportedStyles: ['Photorealistic 3D Render', 'Unreal Engine 5'],
    defaultPromptTemplate: 'Convert hand-drawn architectural line sketch into 8k photorealistic building render',
  },
  {
    slug: 'ai-architecture-generator',
    name: 'AI Architecture Generator',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Generative AI for designing cutting-edge parametric villas, skyscrapers, and structural facades.',
    originalImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['Residential Villa', 'Skyscraper', 'Cultural Center'],
    supportedStyles: ['Parametric', 'Futuristic Glass', 'Brutalist Concrete', 'Sustainable Green Architecture'],
    defaultPromptTemplate: 'Generative architectural design for iconic building facade with structural realism',
  },
  {
    slug: 'ai-blueprint-generator',
    name: 'AI Blueprint Generator',
    category: 'exterior',
    creditCost: 6,
    badge: 'Pro AI',
    description: 'Generate high-precision technical blueprints with architectural elevation lines.',
    originalImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    supportedRoomTypes: ['House Blueprint', 'Site Plan'],
    supportedStyles: ['Blue Technical Grid', 'White CAD Drawing'],
    defaultPromptTemplate: 'High precision architectural blueprint schematic with elevation and dimensions',
  },
];

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @InjectModel(MediaFile.name)
    private readonly mediaFileModel: Model<MediaFileDocument>,
    @InjectModel(ProductTool.name)
    private readonly productToolModel: Model<ProductToolDocument>,
    private readonly storageService: StorageService,
    private readonly preprocessingService: PreprocessingService,
  ) {}

  async onModuleInit() {
    try {
      for (const tool of SEED_TOOLS) {
        await this.productToolModel.updateOne(
          { slug: tool.slug },
          { $set: tool },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 23 Product Tools into MongoDB producttools collection!`);
    } catch (err: any) {
      this.logger.warn(`Could not seed producttools into MongoDB Atlas (${err.message}). Using memory fallback.`);
    }
  }

  /**
   * Preprocesses and saves image buffer or URL/Base64 input and creates a MediaFile database document.
   */
  async registerUploadedFile(fileData: {
    originalName: string;
    buffer?: Buffer;
    mimeType?: string;
    size?: number;
    type?: 'original_input' | 'ai_generated' | 'mask_image';
    userId?: string;
    externalUrl?: string;
  }): Promise<MediaFile> {
    const type = fileData.type || 'original_input';
    const subfolder = type === 'ai_generated' ? 'generated' : 'original';
    
    let activeBuffer: Buffer | undefined = fileData.buffer;
    let activeMimeType = fileData.mimeType || 'image/jpeg';

    // 1. Resolve Base64 or external HTTP URLs to buffer
    if (!activeBuffer && fileData.externalUrl) {
      if (fileData.externalUrl.startsWith('data:image/')) {
        const parts = fileData.externalUrl.split(',');
        const meta = parts[0];
        const base64Data = parts[1];
        activeBuffer = Buffer.from(base64Data, 'base64');
        const match = meta.match(/data:(image\/[a-zA-Z+.-]+);base64/);
        if (match) {
          activeMimeType = match[1];
        }
      } else if (fileData.externalUrl.startsWith('http://') || fileData.externalUrl.startsWith('https://')) {
        try {
          const downloadResponse = await axios.get(fileData.externalUrl, { responseType: 'arraybuffer' });
          activeBuffer = Buffer.from(downloadResponse.data);
          activeMimeType = String(downloadResponse.headers['content-type'] || 'image/jpeg');
        } catch (downloadErr: any) {
          this.logger.error(`Failed to download external image: ${downloadErr.message}`);
          throw new BadRequestException(`Failed to resolve external image URL: ${downloadErr.message}`);
        }
      }
    }

    if (!activeBuffer) {
      throw new BadRequestException('No image buffer or valid external URL provided.');
    }

    // 2. Validate and preprocess the image (only for uploads and original inputs, generated outputs can skip validation/resize)
    let processedBuffer = activeBuffer;
    let width = 0;
    let height = 0;

    if (type !== 'ai_generated') {
      await this.preprocessingService.validate(activeBuffer, activeMimeType);
      const processed = await this.preprocessingService.process(activeBuffer, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 80,
      });
      processedBuffer = processed.buffer;
      width = processed.width;
      height = processed.height;
      activeMimeType = processed.mimeType;
    }

    // 3. Save file using storage provider adapter (Local Disk or S3)
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const ext = activeMimeType.split('/')[1] === 'jpeg' ? '.jpg' : `.${activeMimeType.split('/')[1] || 'jpg'}`;
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}_${randomHex}${ext}`;
    const relativePath = path.join(subfolder, yearMonth, filename).replace(/\\/g, '/');

    const publicUrl = await this.storageService.save(processedBuffer, relativePath, activeMimeType);

    const fileRecord = {
      originalName: fileData.originalName,
      filename,
      path: relativePath,
      url: publicUrl,
      mimeType: activeMimeType,
      size: processedBuffer.length,
      type,
      userId: fileData.userId ? (fileData.userId as any) : undefined,
    };

    try {
      const createdFile = new this.mediaFileModel(fileRecord);
      return await createdFile.save();
    } catch (err: any) {
      this.logger.warn(`MediaFile MongoDB save bypassed (${err.message}). Returning memory model.`);
      return fileRecord as MediaFile;
    }
  }

  async getProductTools(): Promise<ProductTool[]> {
    try {
      const tools = await this.productToolModel.find().exec();
      if (tools && tools.length > 0) return tools;
    } catch (e) {
      // Fall through to memory dataset fallback
    }
    return SEED_TOOLS as ProductTool[];
  }
}
