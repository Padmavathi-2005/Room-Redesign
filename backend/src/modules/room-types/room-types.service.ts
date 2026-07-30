import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomType, RoomTypeDocument } from './schemas/room-type.schema';

const SEED_ROOM_TYPES = [
  {
    slug: 'living-room',
    name: 'Living room',
    category: 'interior',
    description: 'Transform modern living spaces with custom sofa layouts, coffee tables, wall art, and ambient lighting.',
    icon: 'Sofa',
    popularStyles: ['Modern', 'Japandi', 'Scandinavian', 'Industrial', 'Luxury', 'Boho'],
    compatibleToolSlugs: ['interior-design', 'ai-room-decorator', 'paint-color-visualizer', 'change-furniture-ai'],
  },
  {
    slug: 'open-kitchen-living',
    name: 'Open Kitchen Living Room',
    category: 'interior',
    description: 'Seamless open-concept layout connecting living, dining, and kitchen spaces.',
    icon: 'Layout',
    popularStyles: ['Modern Japandi', 'Contemporary Open', 'Scandinavian'],
    compatibleToolSlugs: ['interior-design', 'ai-room-decorator', 'kitchen-design'],
  },
  {
    slug: 'bedroom',
    name: 'Bedroom',
    category: 'interior',
    description: 'Design cozy, peaceful bedrooms with upholstered headboards, soft neutral tones, and warm bedside lighting.',
    icon: 'Bed',
    popularStyles: ['Cozy Japandi', 'Modern Luxury', 'Minimalist Neutral', 'Boho Chic'],
    compatibleToolSlugs: ['bedroom-design', 'interior-design', 'paint-color-visualizer', 'change-room-light'],
  },
  {
    slug: 'bathroom',
    name: 'Bathroom',
    category: 'interior',
    description: 'Reimagine bathrooms as luxury spa retreats with walk-in glass showers, freestanding tubs, and marble vanities.',
    icon: 'ShowerHead',
    popularStyles: ['Modern Spa', 'Marble Luxury', 'Minimalist Tile', 'Rustic Wood'],
    compatibleToolSlugs: ['bathroom-design', 'interior-design', 'paint-color-visualizer', 'ai-flooring-design'],
  },
  {
    slug: 'kitchen',
    name: 'Kitchen',
    category: 'interior',
    description: 'Create chef-worthy kitchens with custom marble countertops, island seating, tile backsplashes, and cabinetry.',
    icon: 'Utensils',
    popularStyles: ['Modern Marble', 'Farmhouse', 'Minimalist Wood', 'Industrial Metallic'],
    compatibleToolSlugs: ['kitchen-design', 'interior-design', 'paint-color-visualizer'],
  },
  {
    slug: 'dining-room',
    name: 'Dining room',
    category: 'interior',
    description: 'Design elegant dining rooms featuring statement chandeliers, wooden dining tables, and accent walls.',
    icon: 'Wine',
    popularStyles: ['Modern Scandinavian', 'Mid-Century Modern', 'Classic Elegance'],
    compatibleToolSlugs: ['interior-design', 'ai-wall-design', 'change-furniture-ai'],
  },
  {
    slug: 'attic',
    name: 'Attic',
    category: 'interior',
    description: 'Convert skylit attic spaces into cozy reading nooks, bedrooms, or creative studios.',
    icon: 'Home',
    popularStyles: ['Rustic Wood', 'Cozy Loft', 'Scandinavian Attic'],
    compatibleToolSlugs: ['interior-design', 'change-furniture-ai'],
  },
  {
    slug: 'study-room',
    name: 'Study room',
    category: 'interior',
    description: 'Quiet study sanctuaries with built-in bookshelves, reading lamps, and focused task desks.',
    icon: 'BookOpen',
    popularStyles: ['Academic Dark Wood', 'Minimalist Modern', 'Scandinavian Study'],
    compatibleToolSlugs: ['office-design', 'interior-design'],
  },
  {
    slug: 'home-office',
    name: 'Home office',
    category: 'interior',
    description: 'Build productive home workspaces with executive desks, ergonomic seating, and warm lighting.',
    icon: 'Briefcase',
    popularStyles: ['Ergonomic Modern', 'Industrial Loft', 'Executive Dark Leather'],
    compatibleToolSlugs: ['office-design', 'interior-design', 'change-furniture-ai'],
  },
  {
    slug: 'family-room',
    name: 'Family Room',
    category: 'interior',
    description: 'Spacious family gathering areas with sectional sofas, media centers, and kid-friendly layouts.',
    icon: 'Users',
    popularStyles: ['Cozy Family', 'Contemporary Warm', 'Bohemian Family'],
    compatibleToolSlugs: ['interior-design', 'ai-room-decorator'],
  },
  {
    slug: 'formal-dining',
    name: 'Formal Dining Room',
    category: 'interior',
    description: 'Sophisticated dining halls for formal hosting, grand tables, and ambient chandeliers.',
    icon: 'Sparkles',
    popularStyles: ['Classic Elegance', 'Modern Glam', 'Luxury Wood'],
    compatibleToolSlugs: ['interior-design', 'change-furniture-ai'],
  },
  {
    slug: 'kids-room',
    name: 'Kids Room',
    category: 'interior',
    description: 'Playful, vibrant kids bedrooms with bunk beds, study corners, and creative wall murals.',
    icon: 'Smile',
    popularStyles: ['Playful Pastel', 'Modern Scandinavian Kids', 'Adventure Theme'],
    compatibleToolSlugs: ['bedroom-design', 'interior-design', 'paint-color-visualizer'],
  },
  {
    slug: 'balcony',
    name: 'Balcony',
    category: 'exterior',
    description: 'Urban outdoor balconies with rattan lounge chairs, potted plants, and wooden deck tiles.',
    icon: 'Sun',
    popularStyles: ['Boho Oasis', 'Modern Urban Garden', 'Minimalist Deck'],
    compatibleToolSlugs: ['landscape-design', 'exterior-design'],
  },
  {
    slug: 'gaming-room',
    name: 'Gaming room',
    category: 'interior',
    description: 'Immersive gaming setups with RGB ambient neon strip lights, acoustic wall panels, and dual-monitor desks.',
    icon: 'Gamepad2',
    popularStyles: ['Cyberpunk RGB', 'Futuristic Dark Mode', 'Minimalist Gamer'],
    compatibleToolSlugs: ['interior-design', 'change-room-light'],
  },
  {
    slug: 'meeting-room',
    name: 'Meeting room',
    category: 'commercial',
    description: 'Professional conference rooms with video-call screens, conference tables, and acoustic ceiling baffles.',
    icon: 'Monitor',
    popularStyles: ['Executive Corporate', 'Tech Startup Modern', 'Minimalist Glass'],
    compatibleToolSlugs: ['office-design', 'interior-design'],
  },
  {
    slug: 'workshop',
    name: 'Workshop',
    category: 'commercial',
    description: 'Functional craft and maker workshops with heavy-duty workbenches, pegboards, and industrial lighting.',
    icon: 'Wrench',
    popularStyles: ['Industrial Woodworking', 'Modern Garage Workshop', 'Craft Studio'],
    compatibleToolSlugs: ['interior-design'],
  },
  {
    slug: 'fitness-gym',
    name: 'Fitness gym',
    category: 'commercial',
    description: 'Home & commercial gyms with rubber flooring, dumbbell racks, mirrors, and motivational wall art.',
    icon: 'Activity',
    popularStyles: ['Industrial Gym', 'Luxury Wellness Suite', 'Minimalist Home Gym'],
    compatibleToolSlugs: ['interior-design', 'ai-flooring-design'],
  },
  {
    slug: 'coffee-shop',
    name: 'Coffee shop',
    category: 'commercial',
    description: 'Cozy boutique coffee shops with espresso bars, warm wood seating, pendant lamps, and chalkboard menus.',
    icon: 'Coffee',
    popularStyles: ['Artisanal Industrial', 'Modern Minimalist Cafe', 'Rustic Warm Wood'],
    compatibleToolSlugs: ['interior-design', 'exterior-design'],
  },
  {
    slug: 'clothing-store',
    name: 'Clothing store',
    category: 'commercial',
    description: 'High-end retail boutiques with clothes racks, fitting rooms, display pedestals, and spotlighting.',
    icon: 'ShoppingBag',
    popularStyles: ['Luxury Minimalist Retail', 'Modern Industrial Boutique', 'Nordic Fashion'],
    compatibleToolSlugs: ['interior-design', 'change-room-light'],
  },
  {
    slug: 'restaurant',
    name: 'Restaurant',
    category: 'commercial',
    description: 'Atmospheric dining restaurants with booth seating, bar counter design, mood lighting, and accent entryways.',
    icon: 'UtensilsCrossed',
    popularStyles: ['Luxury Fine Dining', 'Modern Bistro', 'Industrial Gastropub'],
    compatibleToolSlugs: ['interior-design', 'exterior-design'],
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
      this.logger.log(`✅ Successfully seeded/synced 20 Room Types into MongoDB roomtypes collection!`);
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
