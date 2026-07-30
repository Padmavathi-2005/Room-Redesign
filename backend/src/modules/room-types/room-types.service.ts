import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomType, RoomTypeDocument } from './schemas/room-type.schema';

const SEED_ROOM_TYPES = [
  {
    slug: 'living-room',
    name: 'Living Room',
    category: 'interior',
    description: 'Transform modern living spaces with custom sofa layouts, coffee tables, wall art, and ambient lighting.',
    icon: 'Sofa',
    popularStyles: ['Modern', 'Japandi', 'Scandinavian', 'Industrial', 'Luxury', 'Boho'],
    compatibleToolSlugs: [
      'interior-design',
      'ai-room-decorator',
      'paint-color-visualizer',
      'ai-room-cleaner',
      'change-furniture-ai',
      'ai-wall-design',
      'ai-flooring-design',
      'change-room-light',
    ],
  },
  {
    slug: 'bedroom',
    name: 'Master & Guest Bedroom',
    category: 'interior',
    description: 'Design cozy, peaceful bedrooms with upholstered headboards, soft neutral tones, and warm bedside lighting.',
    icon: 'Bed',
    popularStyles: ['Cozy Japandi', 'Modern Luxury', 'Minimalist Neutral', 'Boho Chic'],
    compatibleToolSlugs: [
      'bedroom-design',
      'interior-design',
      'ai-room-decorator',
      'paint-color-visualizer',
      'change-furniture-ai',
      'change-room-light',
    ],
  },
  {
    slug: 'kitchen',
    name: 'Kitchen & Dining Space',
    category: 'interior',
    description: 'Create chef-worthy kitchens with custom marble countertops, island seating, tile backsplashes, and cabinetry.',
    icon: 'Utensils',
    popularStyles: ['Modern Marble', 'Farmhouse', 'Minimalist Wood', 'Industrial Metallic'],
    compatibleToolSlugs: [
      'kitchen-design',
      'interior-design',
      'paint-color-visualizer',
      'ai-flooring-design',
      'ai-room-cleaner',
    ],
  },
  {
    slug: 'bathroom',
    name: 'Bathroom & Spa Suite',
    category: 'interior',
    description: 'Reimagine bathrooms as luxury spa retreats with walk-in glass showers, freestanding tubs, and marble vanities.',
    icon: 'ShowerHead',
    popularStyles: ['Modern Spa', 'Marble Luxury', 'Minimalist Tile', 'Rustic Wood'],
    compatibleToolSlugs: [
      'bathroom-design',
      'interior-design',
      'paint-color-visualizer',
      'ai-flooring-design',
    ],
  },
  {
    slug: 'office',
    name: 'Home Office & Workspace',
    category: 'interior',
    description: 'Build productive home workspaces with executive desks, ergonomic seating, oak bookshelves, and soft warm lighting.',
    icon: 'Briefcase',
    popularStyles: ['Ergonomic Modern', 'Industrial Loft', 'Minimalist Wood', 'Executive Dark Leather'],
    compatibleToolSlugs: [
      'office-design',
      'interior-design',
      'ai-room-decorator',
      'change-furniture-ai',
      'paint-color-visualizer',
    ],
  },
  {
    slug: 'dining-room',
    name: 'Dining Room',
    category: 'interior',
    description: 'Design elegant dining rooms featuring statement chandeliers, wooden dining tables, and accent walls.',
    icon: 'Wine',
    popularStyles: ['Modern Scandinavian', 'Mid-Century Modern', 'Classic Elegance'],
    compatibleToolSlugs: [
      'interior-design',
      'ai-wall-design',
      'change-furniture-ai',
      'paint-color-visualizer',
    ],
  },
  {
    slug: 'exterior-facade',
    name: 'Building Facade & Exterior',
    category: 'exterior',
    description: 'Redesign building facades with modern glass panels, warm wood cladding, stone textures, and architectural lighting.',
    icon: 'Building2',
    popularStyles: ['Modern Glass Villa', 'Modern Farmhouse', 'Contemporary Wood & Concrete'],
    compatibleToolSlugs: [
      'exterior-design',
      'landscape-design',
      'change-sky',
      'sketch-to-render',
      'ai-architecture-generator',
    ],
  },
  {
    slug: 'garden-landscape',
    name: 'Garden & Outdoor Landscape',
    category: 'exterior',
    description: 'Transform backyards and gardens with stone pathways, pergolas, lush lawns, swimming pools, and resort seating.',
    icon: 'Trees',
    popularStyles: ['Zen Japanese', 'Modern Lawn', 'Tropical Resort', 'English Countryside'],
    compatibleToolSlugs: [
      'landscape-design',
      'garden-design',
      'change-sky',
    ],
  },
  {
    slug: 'floor-plan-space',
    name: 'Floor Plan & Layout Space',
    category: 'floorplan',
    description: 'Convert floor plan sketches and space dimensions into 2D schematics and 3D isometric cutaway models.',
    icon: 'Ruler',
    popularStyles: ['Architectural 2D', '3D Isometric', 'Clean Blueprint'],
    compatibleToolSlugs: [
      'floor-plan-generator',
      '3d-floor-plan',
      'floor-plan-maker',
    ],
  },
];

@Injectable()
export class RoomTypesService implements OnModuleInit {
  private readonly logger = new Logger(RoomTypesService.name);

  constructor(
    @InjectModel(RoomType.name)
    private readonly roomTypeModel: Model<RoomTypeDocument>,
  ) {}

  /**
   * Automatically seed roomtypes collection in MongoDB Atlas on startup
   */
  async onModuleInit() {
    try {
      for (const roomType of SEED_ROOM_TYPES) {
        await this.roomTypeModel.updateOne(
          { slug: roomType.slug },
          { $set: roomType },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 9 Room Types into MongoDB roomtypes collection!`);
    } catch (err) {
      this.logger.warn(`Could not seed roomtypes into MongoDB Atlas (${err.message})`);
    }
  }

  /**
   * Get all room types
   */
  async findAll(): Promise<RoomType[]> {
    try {
      const roomTypes = await this.roomTypeModel.find().exec();
      if (roomTypes && roomTypes.length > 0) return roomTypes;
    } catch (e) {
      // Fall through to memory dataset
    }
    return SEED_ROOM_TYPES as RoomType[];
  }

  /**
   * Get single room type by slug
   */
  async findBySlug(slug: string): Promise<RoomType> {
    try {
      const found = await this.roomTypeModel.findOne({ slug }).exec();
      if (found) return found;
    } catch (e) {
      // Fall through
    }
    return SEED_ROOM_TYPES.find((r) => r.slug === slug) as RoomType;
  }
}
