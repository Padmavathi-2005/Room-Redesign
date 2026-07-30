import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaFile, MediaFileDocument } from './schemas/media-file.schema';
import { ProductTool, ProductToolDocument } from './schemas/product-tool.schema';
import * as fs from 'fs';
import * as path from 'path';

const SEED_TOOLS = [
  // --- FLOOR PLAN ---
  {
    slug: 'floor-plan-generator',
    name: 'Floor Plan Generator',
    category: 'floorplan',
    creditCost: 4,
    supportedRoomTypes: ['Full House', 'Apartment', 'Studio'],
    supportedStyles: ['Architectural 2D', 'Clean Blueprint'],
    defaultPromptTemplate: 'A 2D architectural floor plan generator with dimensions and room labels',
  },
  {
    slug: '3d-floor-plan',
    name: '3D Floor Plan',
    category: 'floorplan',
    creditCost: 8,
    supportedRoomTypes: ['Full House', 'Apartment', 'Villa'],
    supportedStyles: ['3D Isometric', 'Photorealistic Cutaway'],
    defaultPromptTemplate: 'An isometric 3D floor plan render with furniture layout and soft lighting',
  },
  {
    slug: 'floor-plan-maker',
    name: 'Floor Plan Maker',
    category: 'floorplan',
    creditCost: 4,
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
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'],
    supportedStyles: ['Modern', 'Scandinavian', 'Japandi', 'Industrial', 'Luxury', 'Boho', 'Minimalist'],
    defaultPromptTemplate: 'A photorealistic interior redesign of a {roomType} in {style} style',
  },
  {
    slug: 'ai-room-decorator',
    name: 'AI Room Decorator',
    category: 'interior',
    creditCost: 4,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Office'],
    supportedStyles: ['Modern', 'Cozy Chic', 'Art Deco', 'Bohemian'],
    defaultPromptTemplate: 'Decorate room with stylish furniture, wall art, plants, and ambient lighting',
  },
  {
    slug: 'ai-room-cleaner',
    name: 'AI Room Cleaner',
    category: 'interior',
    creditCost: 2,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Office'],
    supportedStyles: ['Clean', 'Empty Space'],
    defaultPromptTemplate: 'De-clutter and clean room space removing all unwanted mess and stray items',
  },
  {
    slug: 'paint-color-visualizer',
    name: 'Paint Color Visualizer',
    category: 'editing',
    creditCost: 2,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen'],
    supportedStyles: ['Matte', 'Gloss', 'Satin', 'Eggshell'],
    defaultPromptTemplate: 'Change room wall paint color to {colorPalette}',
  },
  {
    slug: 'style-transfer',
    name: 'Style Transfer',
    category: 'interior',
    creditCost: 4,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Office'],
    supportedStyles: ['Japandi', 'Industrial', 'Scandinavian', 'Cyberpunk', 'Mid-Century'],
    defaultPromptTemplate: 'Apply architectural style transfer using {style} design aesthetic',
  },
  {
    slug: 'change-room-light',
    name: 'Change Room Light',
    category: 'editing',
    creditCost: 2,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen'],
    supportedStyles: ['Sunset Warm', 'Golden Hour', 'Cool Daylight', 'Cyberpunk Neon', 'Soft Evening'],
    defaultPromptTemplate: 'Transform room lighting mood to {lighting}',
  },
  {
    slug: 'ai-wall-design',
    name: 'AI Wall Design',
    category: 'interior',
    creditCost: 3,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Dining Room'],
    supportedStyles: ['Accent Wood Slat', 'Textured Marble', 'Wallpaper Pattern', 'Exposed Brick'],
    defaultPromptTemplate: 'Redesign main wall with luxury accent materials',
  },
  {
    slug: 'kitchen-design',
    name: 'Kitchen Design AI',
    category: 'interior',
    creditCost: 4,
    supportedRoomTypes: ['Kitchen'],
    supportedStyles: ['Modern', 'Farmhouse', 'Minimalist', 'Industrial', 'Marble Luxury'],
    defaultPromptTemplate: 'A luxury kitchen redesign with modern countertops and custom cabinetry',
  },
  {
    slug: 'bathroom-design',
    name: 'Bathroom Design AI',
    category: 'interior',
    creditCost: 4,
    supportedRoomTypes: ['Bathroom', 'Powder Room'],
    supportedStyles: ['Modern Spa', 'Marble Luxury', 'Minimalist Tile', 'Rustic Wood'],
    defaultPromptTemplate: 'A modern luxury bathroom redesign with walk-in glass shower and marble vanity',
  },
  {
    slug: 'bedroom-design',
    name: 'Bedroom Design AI',
    category: 'interior',
    creditCost: 4,
    supportedRoomTypes: ['Master Bedroom', 'Guest Bedroom', 'Kids Room'],
    supportedStyles: ['Cozy Japandi', 'Modern Luxury', 'Minimalist Neutral', 'Boho Chic'],
    defaultPromptTemplate: 'A peaceful master bedroom design with upholstered bed and warm ambient lighting',
  },
  {
    slug: 'office-design',
    name: 'Office Design AI',
    category: 'interior',
    creditCost: 4,
    supportedRoomTypes: ['Home Office', 'Corporate Office', 'Executive Suite'],
    supportedStyles: ['Ergonomic Modern', 'Industrial Loft', 'Minimalist Wood', 'Executive Dark Leather'],
    defaultPromptTemplate: 'A modern ergonomic home office setup with executive desk and bookshelf',
  },
  {
    slug: 'change-furniture-ai',
    name: 'Change Furniture AI',
    category: 'editing',
    creditCost: 3,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Office'],
    supportedStyles: ['Modern Leather', 'Scandinavian Fabric', 'Velvet Luxury'],
    defaultPromptTemplate: 'Replace existing furniture with new stylish design pieces',
  },
  {
    slug: 'ai-flooring-design',
    name: 'AI Flooring Design',
    category: 'editing',
    creditCost: 3,
    supportedRoomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Hallway'],
    supportedStyles: ['Herringbone Hardwood', 'Light Oak Plank', 'Polished Concrete', 'Terrazzo Tile'],
    defaultPromptTemplate: 'Replace room floor material with high quality premium flooring',
  },

  // --- EXTERIOR ---
  {
    slug: 'exterior-design',
    name: 'Exterior Design AI',
    category: 'exterior',
    creditCost: 4,
    supportedRoomTypes: ['House Front', 'Villa Facade', 'Commercial Building'],
    supportedStyles: ['Modern Glass Villa', 'Modern Farmhouse', 'Contemporary Wood & Concrete', 'Mediterranean'],
    defaultPromptTemplate: 'A photorealistic architectural exterior redesign of building facade',
  },
  {
    slug: 'landscape-design',
    name: 'Landscape Design',
    category: 'exterior',
    creditCost: 4,
    supportedRoomTypes: ['Backyard', 'Front Lawn', 'Patio Area'],
    supportedStyles: ['Zen Garden', 'Modern Lawn', 'Tropical Resort', 'English Countryside'],
    defaultPromptTemplate: 'A luxury landscape garden design with stone pathways and lush greenery',
  },
  {
    slug: 'garden-design',
    name: 'Garden Design',
    category: 'exterior',
    creditCost: 4,
    supportedRoomTypes: ['Garden', 'Courtyard'],
    supportedStyles: ['Japanese Zen', 'Botanical Paradise', 'Minimalist Patio'],
    defaultPromptTemplate: 'A tranquil garden design with flower beds and outdoor seating area',
  },
  {
    slug: 'change-sky',
    name: 'Change Sky',
    category: 'editing',
    creditCost: 2,
    supportedRoomTypes: ['Exterior Facade', 'Landscape'],
    supportedStyles: ['Dramatic Sunset', 'Blue Sky Sunshine', 'Starry Night', 'Golden Hour'],
    defaultPromptTemplate: 'Replace exterior sky background with clear atmospheric lighting',
  },
  {
    slug: 'sketch-to-render',
    name: 'Sketch to Render',
    category: 'exterior',
    creditCost: 6,
    supportedRoomTypes: ['Architectural Drawing', 'Hand Sketch'],
    supportedStyles: ['Photorealistic 3D Render', 'Unreal Engine 5'],
    defaultPromptTemplate: 'Convert hand-drawn architectural line sketch into 8k photorealistic building render',
  },
  {
    slug: 'ai-architecture-generator',
    name: 'AI Architecture Generator',
    category: 'exterior',
    creditCost: 6,
    supportedRoomTypes: ['Residential Villa', 'Skyscraper', 'Cultural Center'],
    supportedStyles: ['Parametric', 'Futuristic Glass', 'Brutalist Concrete', 'Sustainable Green Architecture'],
    defaultPromptTemplate: 'Generative architectural design for iconic building facade with structural realism',
  },
  {
    slug: 'ai-blueprint-generator',
    name: 'AI Blueprint Generator',
    category: 'exterior',
    creditCost: 6,
    supportedRoomTypes: ['House Blueprint', 'Site Plan'],
    supportedStyles: ['Blue Technical Grid', 'White CAD Drawing'],
    defaultPromptTemplate: 'High precision architectural blueprint schematic with elevation and dimensions',
  },
];

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadRootDir = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectModel(MediaFile.name)
    private readonly mediaFileModel: Model<MediaFileDocument>,
    @InjectModel(ProductTool.name)
    private readonly productToolModel: Model<ProductToolDocument>,
  ) {
    this.ensureDirectoryExists(path.join(this.uploadRootDir, 'original'));
    this.ensureDirectoryExists(path.join(this.uploadRootDir, 'generated'));
  }

  /**
   * Automatically seed producttools collection in MongoDB Atlas on startup
   */
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
    } catch (err) {
      this.logger.warn(`Could not seed producttools into MongoDB Atlas (${err.message}). Using memory fallback.`);
    }
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Saves image buffer or file metadata and creates a MediaFile database document
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
    
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetDir = path.join(this.uploadRootDir, subfolder, yearMonth);
    this.ensureDirectoryExists(targetDir);

    const ext = path.extname(fileData.originalName) || '.jpg';
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}_${randomHex}${ext}`;
    const relativePath = path.join('uploads', subfolder, yearMonth, filename).replace(/\\/g, '/');

    if (fileData.buffer) {
      fs.writeFileSync(path.join(targetDir, filename), fileData.buffer);
    }

    const fileRecord = {
      originalName: fileData.originalName,
      filename,
      path: relativePath,
      url: fileData.externalUrl || `/${relativePath}`,
      mimeType: fileData.mimeType || 'image/jpeg',
      size: fileData.size || (fileData.buffer ? fileData.buffer.length : 0),
      type,
      userId: fileData.userId ? (fileData.userId as any) : undefined,
    };

    try {
      const createdFile = new this.mediaFileModel(fileRecord);
      return await createdFile.save();
    } catch (err) {
      this.logger.warn(`MediaFile MongoDB save bypassed (${err.message}). Returning memory model.`);
      return fileRecord as MediaFile;
    }
  }

  /**
   * Returns complete list of all 23 supported tools from MongoDB collection producttools
   */
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
