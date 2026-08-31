import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiTool, AiToolDocument } from './schemas/ai-tool.schema';

const SEED_AI_TOOLS = [
  {
    slug: 'complete-redesign',
    name: 'Complete Redesign',
    description: 'Full architectural room transformation with new furniture, lighting & materials.',
    category: 'interior',
    creditCost: 2,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', required: true, width: 'half' },
      { id: 'design-style', type: 'Select Dropdown', label: 'Design Style', dataSource: 'design-styles', required: true, width: 'half' },
      { id: 'color-palette', type: 'Select Dropdown', label: 'Color Palette', dataSource: 'color-palettes', required: false, width: 'half' },
      { id: 'lighting-atmosphere', type: 'Select Dropdown', label: 'Lighting Atmosphere', dataSource: 'lighting', required: false, width: 'half' },
      { id: 'furniture-layout', type: 'Option Grid', label: 'Furniture & Layout Handling', options: ['Replace everything', 'Reuse everything possible', 'Replace only damaged furniture'], required: true, width: 'full' },
      { id: 'budget-level', type: 'Option Grid', label: 'Budget Level', options: ['Low', 'Medium', 'Premium', 'Luxury'], required: true, width: 'full' },
      { id: 'selected-products', type: 'Check Grid', label: 'Select Specific Products / Furniture', dataSource: 'products', required: false, width: 'full' },
      { id: 'room-size', type: 'Option Grid', label: 'Room Size', options: ['Small (< 150 sq ft)', 'Medium (150 - 300 sq ft)', 'Large (300 - 600 sq ft)', 'Open Concept (> 600 sq ft)'], required: true, width: 'full' }
    ]
  },
  {
    slug: 'ai-room-decorator',
    name: 'AI Room Decorator',
    description: 'Dress up your room with accessories, plants, paintings, and coordinate styling.',
    category: 'interior',
    creditCost: 2,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', options: ['Living Room', 'Open Kitchen Living Room', 'Bedroom', 'Guest Bedroom', 'Kids Room', 'Nursery', 'Bathroom', 'Dining Room', 'Kitchen', 'Home Office', 'Outdoor Patio'], required: true },
      { id: 'design-style', type: 'Select Dropdown', label: 'Design Style', dataSource: 'design-styles', options: ['Modern', 'Scandinavian', 'Bohemian', 'Japandi', 'Minimalist', 'Industrial', 'Luxury', 'Traditional'], required: true },
      { id: 'decor-mode', type: 'Option Grid', label: 'Decoration Mode', options: ['Decorate Only', 'Refurnish & Decorate', 'Furnish Empty Space'], required: true },
      { id: 'decor-accents', type: 'Option Grid', label: 'Decorative Textures & Accents', options: ['Bouclé Fabric', 'Warm Wood', 'Matte Black Metal', 'Brass & Gold', 'Premium Leather'] },
      { id: 'decor-items', type: 'Check Grid', label: 'Select Decor Items to Add', options: ['Floor Rug', 'Indoor Greenery', 'Abstract Wall Art', 'Throw Pillows', 'Mirror', 'Staging Books'] }
    ]
  },
  {
    slug: 'furniture-decor',
    name: 'Furniture & Decor',
    description: 'Re-furnish room with curated modern furniture & decor accents.',
    category: 'interior',
    creditCost: 2,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', options: ['Living Room', 'Open Kitchen Living Room', 'Bedroom', 'Guest Bedroom', 'Kids Room', 'Nursery', 'Bathroom', 'Dining Room', 'Kitchen', 'Home Office', 'Outdoor Patio'], required: true },
      { id: 'design-style', type: 'Select Dropdown', label: 'Design Style', dataSource: 'design-styles', options: ['Modern', 'Scandinavian', 'Bohemian', 'Japandi', 'Minimalist', 'Industrial', 'Luxury', 'Traditional'], required: true },
      { id: 'decor-mode', type: 'Option Grid', label: 'Decoration Mode', options: ['Decorate Only', 'Refurnish & Decorate', 'Furnish Empty Space'], required: true },
      { id: 'decor-accents', type: 'Option Grid', label: 'Decorative Textures & Accents', options: ['Bouclé Fabric', 'Warm Wood', 'Matte Black Metal', 'Brass & Gold', 'Premium Leather'] },
      { id: 'decor-items', type: 'Check Grid', label: 'Select Decor Items to Add', options: ['Floor Rug', 'Indoor Greenery', 'Abstract Wall Art', 'Throw Pillows', 'Mirror', 'Staging Books'] }
    ]
  },
  {
    slug: 'paint-textures',
    name: 'Wall Paint & Textures',
    description: 'Swap wall colors, wood slat paneling, plaster, and wallpaper textures.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', required: true },
      { id: 'color-palette', type: 'Color Swatch', label: 'Wall Paint Color', dataSource: 'color-palettes', required: true }
    ]
  },
  {
    slug: 'lighting-fixtures',
    name: 'Lighting & Fixtures',
    description: 'Re-engineer ambient cove lights, chandeliers, and natural daylight.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', required: true },
      { id: 'lighting-mood', type: 'Select Dropdown', label: 'Lighting Option', dataSource: 'lighting', required: true }
    ]
  },
  {
    slug: 'flooring-tiles',
    name: 'Flooring & Tiles',
    description: 'Transform floors with hardwood, herringbone oak, marble, or slate tiles.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', required: true },
      { id: 'floor-material', type: 'Select Dropdown', label: 'Floor Material', options: ['Light Oak Hardwood', 'Dark Herringbone Oak', 'White Carrara Marble', 'Grey Concrete Slabs', 'Terracotta Tiles'], required: true }
    ]
  },
  {
    slug: 'ai-room-cleaner',
    name: 'AI Room Cleaner',
    description: 'Clean up cluttered rooms, organize objects, and sweep floors.',
    category: 'interior',
    creditCost: 2,
    widgets: [
      { id: 'room-type', type: 'Select Dropdown', label: 'Room Type', dataSource: 'room-types', options: ['Living Room', 'Open Kitchen Living Room', 'Bedroom', 'Guest Bedroom', 'Kids Room', 'Nursery', 'Bathroom', 'Dining Room', 'Kitchen', 'Home Office', 'Outdoor Patio'], required: true, width: 'full' },
      { id: 'clean-level', type: 'Option Grid', label: 'Declutter Level', options: ['Light Tidy-up', 'Deep Clean Floors & Surfaces', 'Complete Empty Space'], required: true, width: 'full' },
      { id: 'preserve-elements', type: 'Text Input', label: 'Preserve Elements', placeholder: 'e.g. Keep sofa, wall art & indoor plants', maxLength: 40, required: false, width: 'full' },
      { id: 'items-to-remove', type: 'Text Input', label: 'Items to Remove', placeholder: 'e.g. Trash, boxes & loose wires', maxLength: 40, required: false, width: 'full' }
    ]
  },
  {
    slug: 'paint-color-visualizer',
    name: 'Paint Color Visualizer',
    description: 'Visualize different colors and finishes on your walls.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'paint-color', type: 'Option Grid', label: 'Select Wall Paint Color', options: ['Warm Beige', 'Sage Green', 'Charcoal Gray', 'Navy Blue', 'Soft Lavender', 'Terracotta Red'], required: true, width: 'full' },
      { id: 'paint-finish', type: 'Select Dropdown', label: 'Paint Finish', options: ['Matte', 'Satin (Low Sheen)', 'Eggshell', 'Glossy'], required: true, width: 'half' },
      { id: 'target-area', type: 'Option Grid', label: 'Target Area', options: ['All Walls', 'Accent Wall Only', 'Ceiling Only'], required: false, width: 'full' }
    ]
  },
  {
    slug: 'ai-flooring-design',
    name: 'AI Flooring Design',
    description: 'Replace flooring textures, tiles, carpets, and patterns.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'floor-material', type: 'Select Dropdown', label: 'Floor Material', options: ['Light Oak Hardwood', 'Walnut Parquet', 'Marble Tiles', 'Polished Concrete', 'Cozy Carpet'], required: true, width: 'half' },
      { id: 'pattern', type: 'Option Grid', label: 'Layout Pattern', options: ['Straight Plank', 'Herringbone Pattern', 'Chevron Pattern', 'Subway Grid'], required: false, width: 'full' }
    ]
  },
  {
    slug: 'change-room-light',
    name: 'Change Room Light',
    description: 'Change natural sunlight, shadows, temperature, and artificial lights.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'sunlight', type: 'Option Grid', label: 'Time of Day (Sunlight)', options: ['Bright Morning Sun', 'Golden Hour Sunset', 'Overcast Gloomy Day', 'Midnight Moonlight'], required: true, width: 'full' },
      { id: 'lamps', type: 'Check Grid', label: 'Artificial Lamp Lights', options: ['LED Ceiling Strips', 'Wall Spotlights', 'Warm Floor Lamp', 'Neon Colors'], required: false, width: 'full' }
    ]
  },
  {
    slug: 'ai-wall-design',
    name: 'AI Wall Design',
    description: 'Add wood slat paneling, marble backdrops, or accent wallpaper.',
    category: 'interior',
    creditCost: 1,
    widgets: [
      { id: 'wall-treatment', type: 'Select Dropdown', label: 'Wall Accent Material', options: ['Vertical Wood Slats', 'Exposed Brick Wall', 'Decorative Paneling', 'Polished Concrete Plaster', 'Floral Wallpaper'], required: true, width: 'half' },
      { id: 'accent-color', type: 'Option Grid', label: 'Accent Trim Color', options: ['Natural Wood Tone', 'Matte Black', 'Bright White', 'Classic Brick Red'], required: false, width: 'full' }
    ]
  },
  {
    slug: 'style-transfer',
    name: 'Style Transfer',
    description: 'Transfer aesthetics and material palettes from a reference design.',
    category: 'interior',
    creditCost: 2,
    widgets: [
      { id: 'style-preset', type: 'Select Dropdown', label: 'Aesthetic Reference Preset', options: ['Luxury Penthouse', 'Scandinavian Minimal', 'Wabi-Sabi Organic', 'Industrial Loft'], required: true, width: 'full' }
    ]
  },
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
        const exists = await this.aiToolModel.findOne({ slug: tool.slug }).exec();
        if (!exists) {
          await this.aiToolModel.create(tool);
        } else {
          await this.aiToolModel.updateOne(
            { slug: tool.slug },
            {
              $set: {
                name: tool.name,
                description: tool.description,
                category: tool.category,
                creditCost: tool.creditCost,
                widgets: (tool as any).widgets || []
              }
            }
          );
        }
      }

      // Force update existing Mongo documents to sync dataSource: 'room-types' & options for room-type widgets
      await this.aiToolModel.updateMany(
        { 'widgets.id': 'room-type' },
        {
          $set: {
            'widgets.$[elem].dataSource': 'room-types',
            'widgets.$[elem].options': [
              'Living Room',
              'Open Kitchen Living Room',
              'Bedroom',
              'Guest Bedroom',
              'Kids Room',
              'Nursery',
              'Bathroom',
              'Dining Room',
              'Kitchen',
              'Home Office',
              'Outdoor Patio'
            ]
          }
        },
        { arrayFilters: [{ 'elem.id': 'room-type' }] }
      ).exec();

      await this.aiToolModel.updateMany(
        { 'widgets.id': 'design-style' },
        {
          $set: {
            'widgets.$[elem].dataSource': 'design-styles',
            'widgets.$[elem].options': [
              'Modern',
              'Scandinavian',
              'Bohemian',
              'Japandi',
              'Minimalist',
              'Industrial',
              'Luxury',
              'Traditional'
            ]
          }
        },
        { arrayFilters: [{ 'elem.id': 'design-style' }] }
      ).exec();

      this.logger.log(`🚀 Successfully seeded/synced 23 AI Tools with default form schemas into MongoDB!`);
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
