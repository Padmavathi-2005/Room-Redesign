import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiTool, AiToolDocument } from './schemas/ai-tool.schema';

const SEED_AI_TOOLS = [
  { slug: 'complete-redesign', name: 'Complete Redesign', description: 'Full architectural room transformation with new furniture, lighting & materials.', category: 'interior', creditCost: 2 },
  { slug: 'furniture-decor', name: 'Furniture & Decor', description: 'Re-furnish room with curated modern furniture & decor accents.', category: 'interior', creditCost: 2 },
  { slug: 'paint-textures', name: 'Wall Paint & Textures', description: 'Swap wall colors, wood slat paneling, plaster, and wallpaper textures.', category: 'interior', creditCost: 1 },
  { slug: 'lighting-fixtures', name: 'Lighting & Fixtures', description: 'Re-engineer ambient cove lights, chandeliers, and natural daylight.', category: 'interior', creditCost: 1 },
  { slug: 'flooring-tiles', name: 'Flooring & Tiles', description: 'Transform floors with hardwood, herringbone oak, marble, or slate tiles.', category: 'interior', creditCost: 1 },
  { slug: 'sky-weather-swap', name: 'Sky & Weather Swap', description: 'Change outdoor lighting, sunset glow, rain, snow, or clear blue skies.', category: 'exterior', creditCost: 2 },
  { slug: 'sketch-to-render', name: 'Sketch to Render', description: 'Convert hand-drawn architectural sketches or blueprints into 8K renders.', category: 'architectural', creditCost: 3 },
  { slug: 'video-walkthrough', name: 'Video Walkthrough', description: 'Generate 3D immersive video camera fly-through of redesigned spaces.', category: 'video', creditCost: 5 },
  { slug: 'ai-blueprint', name: 'AI Blueprints & Architecture', description: 'Generate 2D floor plans & CAD layout schematics.', category: 'architectural', creditCost: 2 },
  { slug: 'landscape-design', name: 'Garden & Landscape', description: 'Design backyards, patios, stone paths, manicured lawns & pool resorts.', category: 'garden', creditCost: 2 },
  { slug: 'exterior-design', name: 'Exterior Facade', description: 'Redesign home exterior cladding, rooflines, window frames & timber accents.', category: 'exterior', creditCost: 2 },
  { slug: 'kitchen-makeover', name: 'Kitchen Makeover', description: 'Transform kitchen cabinetry, marble islands, backsplash tiles & appliances.', category: 'interior', creditCost: 2 },
  { slug: 'bathroom-makeover', name: 'Bathroom Spa', description: 'Create luxury spa bathrooms with freestanding tubs, rain showers & marble.', category: 'interior', creditCost: 2 },
  { slug: 'living-room-makeover', name: 'Living Room Lounge', description: 'Spacious living room layouts with sectional sofas, fireplaces & media walls.', category: 'interior', creditCost: 2 },
  { slug: 'office-makeover', name: 'Office Workspace', description: 'Executive home office setups with ergonomic desks, bookshelves & task lights.', category: 'interior', creditCost: 2 },
  { slug: 'bedroom-makeover', name: 'Bedroom Suite', description: 'Serene bedroom master suites with upholstered headboards & warm lamps.', category: 'interior', creditCost: 2 },
  { slug: 'dining-room-makeover', name: 'Dining Room', description: 'Elegant dining rooms with solid wood dining tables & pendant chandeliers.', category: 'interior', creditCost: 2 },
  { slug: 'commercial-makeover', name: 'Commercial & Cafe', description: 'Boutique retail stores, coffee shops, hotel lobbies & restaurants.', category: 'commercial', creditCost: 3 },
  { slug: 'patio-makeover', name: 'Patio & Decking', description: 'Outdoor decking, pergolas, fire pits & al-fresco dining areas.', category: 'garden', creditCost: 2 },
  { slug: 'pool-makeover', name: 'Pool & Resort', description: 'Infinity pools, sun loungers, poolside cabanas & palm landscaping.', category: 'garden', creditCost: 3 },
  { slug: 'lighting-studio', name: 'Lighting Studio', description: 'Studio photography lighting & realistic shadows.', category: 'specialty', creditCost: 2 },
  { slug: 'material-swap', name: 'Material Swap', description: 'Replace countertop marble, cabinet wood stains, and sofa fabrics.', category: 'interior', creditCost: 1 },
  { slug: 'virtual-staging', name: 'Virtual Staging', description: 'Virtually stage empty real estate room photos with luxury furnishings.', category: 'real-estate', creditCost: 2 },
];

@Injectable()
export class AiToolsService implements OnModuleInit {
  private readonly logger = new Logger(AiToolsService.name);

  constructor(
    @InjectModel(AiTool.name)
    private readonly aiToolModel: Model<AiToolDocument>,
  ) {}

  async onModuleInit() {
    try {
      for (const tool of SEED_AI_TOOLS) {
        await this.aiToolModel.updateOne(
          { slug: tool.slug },
          { $set: tool },
          { upsert: true },
        );
      }
      this.logger.log(`✅ Successfully seeded/synced 23 AI Tools into MongoDB aitools collection!`);
    } catch (err) {
      this.logger.warn(`Could not seed aitools into MongoDB Atlas (${err.message})`);
    }
  }

  async findAll(category?: string): Promise<AiTool[]> {
    try {
      const query = category ? { category } : {};
      const tools = await this.aiToolModel.find(query).exec();
      if (tools && tools.length > 0) return tools;
    } catch (e) {
      // Fall through
    }
    return (category ? SEED_AI_TOOLS.filter(t => t.category === category) : SEED_AI_TOOLS) as AiTool[];
  }

  async findBySlug(slug: string): Promise<AiTool> {
    try {
      const found = await this.aiToolModel.findOne({ slug }).exec();
      if (found) return found;
    } catch (e) {
      // Fall through
    }
    return SEED_AI_TOOLS.find((t) => t.slug === slug) as AiTool;
  }
}
