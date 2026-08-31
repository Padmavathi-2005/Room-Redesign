'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Wand2,
  Sparkles,
  ChevronDown,
  FileText,
  ShieldCheck,
  Zap,
  Download,
  Search,
  RotateCcw,
  Sliders,
  Check,
  CheckCircle2,
  Info,
  Image as ImageIcon,
  Home,
  Layout,
  Flower2,
  Play,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  Folder,
  FolderPlus,
  Lock,
  Ruler,
  Paintbrush,
  Sun,
  Layers,
  Compass,
  FileCode2,
  Trees,
  Building2,
  X,
} from 'lucide-react';
import { ROOM_TYPES, DESIGN_STYLES, COLOR_PALETTES, MOODS, BUDGET_LEVELS, BUILDING_TYPES, ROOF_TYPES, LIGHTING_OPTIONS, ENVIRONMENTS, TIMES_OF_DAY } from '@/constants';
import { projectService, ProjectData } from '@/services/project.service';
import { useToast } from '@/context/ToastContext';
import { CreditTokenIcon } from '@/components/ui';

interface StudioToolConfig {
  id: string;
  name: string;
  category: 'floor-plans' | 'interiors' | 'exteriors' | 'gardens';
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  demoBeforeImage?: string;
  demoAfterImage?: string;
}

const ALL_STUDIO_TOOLS: StudioToolConfig[] = [
  // FLOOR PLANS (3 tools)
  {
    id: 'floor-plan-generator',
    name: 'Floor Plan Generator',
    category: 'floor-plans',
    description: 'Convert sketches or layout specs into precise 2D architectural CAD floor plans with dimensions.',
    badge: 'Model 01',
    icon: Ruler,
  },
  {
    id: '3d-floor-plan',
    name: '3D Floor Plan',
    category: 'floor-plans',
    description: 'Transform 2D floor plans into interactive isometric 3D cutaway models with realistic furniture.',
    badge: '3D Isometric',
    icon: Layers,
  },
  {
    id: 'floor-plan-maker',
    name: 'Floor Plan Maker',
    category: 'floor-plans',
    description: 'Generative CAD schematic maker for wall layouts, doors, windows, and room dimensions.',
    badge: 'CAD Builder',
    icon: FileCode2,
  },

  // INTERIORS (8 tools)
  {
    id: 'interior-design',
    name: 'Interior Design AI',
    category: 'interiors',
    description: 'Reimagine living rooms, bedrooms, and kitchens in 15+ architectural styles.',
    badge: 'Top Rated',
    icon: Layout,
  },
  {
    id: 'ai-room-decorator',
    name: 'AI Room Decorator',
    category: 'interiors',
    description: 'Instantly add curated furniture, indoor plants, wall art, and cozy decor to any space.',
    badge: 'Popular',
    icon: Wand2,
  },
  {
    id: 'ai-room-cleaner',
    name: 'AI Room Cleaner',
    category: 'interiors',
    description: 'Remove clutter, stray boxes, and unwanted items to reveal clean empty architectural space.',
    badge: 'Declutter',
    icon: Sparkles,
  },
  {
    id: 'paint-color-visualizer',
    name: 'Paint Color Visualizer',
    category: 'interiors',
    description: 'Test thousands of paint colors on your room walls before purchasing real paint.',
    badge: 'Wall Paint',
    icon: Paintbrush,
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    category: 'interiors',
    description: 'Extract aesthetics from reference photos and transfer them directly into your room render.',
    badge: 'Reference AI',
    icon: Sliders,
  },
  {
    id: 'change-room-light',
    name: 'Change Room Light',
    category: 'interiors',
    description: 'Switch daylighting to golden hour, cozy sunset warm lights, or moody ambient dusk glow.',
    badge: 'Lighting AI',
    icon: Sun,
  },
  {
    id: 'ai-wall-design',
    name: 'AI Wall Design',
    category: 'interiors',
    description: 'Add luxury wood slat panels, textured marble backdrops, or exposed brick accent walls.',
    badge: 'Wall Accent',
    icon: Layers,
  },
  {
    id: 'ai-flooring-design',
    name: 'AI Flooring Design',
    category: 'interiors',
    description: 'Replace flooring with herringbone oak hardwood, terrazzo tiles, or polished concrete.',
    badge: 'Flooring',
    icon: Layers,
  },

  // EXTERIORS (7 tools)
  {
    id: 'exterior-design',
    name: 'Exterior Design AI',
    category: 'exteriors',
    description: 'Redesign building facades with modern glass, warm wood accents, and contemporary cladding.',
    badge: 'Facade AI',
    icon: Home,
  },
  {
    id: 'landscape-design',
    name: 'Landscape Design',
    category: 'gardens',
    description: 'Design lush front lawns, stone pathways, outdoor pergolas, and serene backyard patios.',
    badge: 'Outdoor',
    icon: Trees,
  },
  {
    id: 'garden-design',
    name: 'Garden Design',
    category: 'gardens',
    description: 'Create tranquil botanical gardens, Japanese Zen courtyards, and flower-bed arrangements.',
    badge: 'Botanical',
    icon: Flower2,
  },
  {
    id: 'change-sky',
    name: 'Change Sky',
    category: 'exteriors',
    description: 'Replace dull overcast exterior skies with vibrant blue sunshine or dramatic sunset clouds.',
    badge: 'Sky Swap',
    icon: Sun,
  },
  {
    id: 'sketch-to-render',
    name: 'Sketch to Render',
    category: 'exteriors',
    description: 'Convert quick pencil or CAD line sketches into 8K photorealistic architectural renders.',
    badge: 'Pro AI',
    icon: Compass,
  },
  {
    id: 'ai-architecture-generator',
    name: 'AI Architecture Generator',
    category: 'exteriors',
    description: 'Generative AI for designing cutting-edge parametric villas, skyscrapers, and structural facades.',
    badge: 'Pro AI',
    icon: Building2,
  },
  {
    id: 'ai-blueprint-generator',
    name: 'AI Blueprint Generator',
    category: 'exteriors',
    description: 'Convert 2D blueprint schematics into full 3D architectural renders.',
    badge: 'Pro AI',
    icon: FileCode2,
  },
];

const ROOM_SIZES = [
  { id: 'Small', label: 'Small (< 150 sq ft)' },
  { id: 'Medium', label: 'Medium (150 - 300 sq ft)' },
  { id: 'Large', label: 'Large (300 - 600 sq ft)' },
  { id: 'Open Concept', label: 'Open Concept (> 600 sq ft)' },
];

const HOUSE_ANGLES = [
  'Side of house',
  'Front of house',
  'Backyard / Patio',
  'Angle / Corner view',
  'Roof / Top-down aerial',
];

const EXTERIOR_TOOLS = [
  'Redesign',
  'Sky & Weather Swap',
  'Sketch to Render',
  'Video Walkthrough',
];

const EXTERIOR_STYLES = [
  'Modern',
  'Contemporary',
  'Minimalist',
  'Luxury',
  'Traditional',
  'Colonial',
  'Mediterranean',
  'Japanese',
  'Scandinavian',
  'Industrial',
  'Rustic',
  'Victorian',
  'Tropical',
  'Eco-friendly',
];

const GARDEN_TYPES = [
  'Backyard Oasis',
  'Front Lawn',
  'Patio & Decking',
  'Garden Bed',
  'Courtyard Sanctuary',
];

const GARDEN_STYLES = [
  'Modern Landscape',
  'Zen Japanese',
  'English Cottage',
  'Tropical Resort',
  'Mediterranean Stone',
  'Minimalist Stepping Paver',
];

const INTERVENTION_LEVELS = ['Very Low', 'Low', 'Medium', 'Extreme'];

const FURNITURE_HANDLING_OPTIONS = [
  { id: 'replace-all', label: 'Replace everything' },
  { id: 'reuse', label: 'Reuse everything possible' },
  { id: 'replace-damaged', label: 'Replace only damaged furniture' },
];

const SELECTABLE_PRODUCT_ITEMS = [
  // Furniture (15 items)
  { id: 'Sectional Sofa', name: 'Sectional Sofa', type: 'furniture' },
  { id: 'Executive Walnut Desk', name: 'Executive Desk', type: 'furniture' },
  { id: 'King Velvet Bed', name: 'King Velvet Bed', type: 'furniture' },
  { id: 'Solid Oak Dining Table', name: 'Oak Dining Table', type: 'furniture' },
  { id: 'Cognac Leather Armchair', name: 'Cognac Armchair', type: 'furniture' },
  { id: 'Power Recliner Chair', name: 'Leather Recliner Chair', type: 'furniture' },
  { id: 'Floating TV Console', name: 'Floating TV Console', type: 'furniture' },
  { id: 'Tall Oak Bookshelf', name: 'Oak Bookshelf & Display', type: 'furniture' },
  { id: 'Vanity Dressing Table', name: 'Vanity Dressing Table', type: 'furniture' },
  { id: 'Nesting Marble Side Tables', name: 'Nesting Marble Tables', type: 'furniture' },
  { id: 'Kitchen Island Barstools', name: 'Kitchen Barstools', type: 'furniture' },
  { id: 'Kids Bunk Bed', name: 'Kids Bunk Bed', type: 'furniture' },
  { id: 'Teak Patio Sofa', name: 'Teak Patio Sofa', type: 'furniture' },
  { id: 'Custom Wardrobe System', name: 'Walk-in Wardrobe', type: 'furniture' },
  { id: 'Oak Wine Rack', name: 'Oak Wine Rack', type: 'furniture' },

  // Electronics & Cooling / Fans (10 items)
  { id: 'Ceiling Electric Fan', name: 'Ceiling Electric Fan', type: 'electronics' },
  { id: 'Split Air Conditioner AC', name: 'Split AC Unit', type: 'electronics' },
  { id: 'Retro Table Fan', name: 'Retro Table Fan', type: 'electronics' },
  { id: 'Tower Air Cooler', name: 'Tower Fan & Air Cooler', type: 'electronics' },
  { id: 'Smart 4K OLED TV', name: '65" Smart 4K TV', type: 'electronics' },
  { id: 'Dolby Atmos Soundbar', name: 'Dolby Atmos Soundbar', type: 'electronics' },
  { id: 'Smart Air Purifier', name: 'HEPA Air Purifier', type: 'electronics' },
  { id: 'Ceramic Electric Heater', name: 'Tower Space Heater', type: 'electronics' },
  { id: '4K Laser Cinema Projector', name: '4K Laser Projector', type: 'electronics' },
  { id: 'Robot Vacuum Cleaner', name: 'Robot Vacuum & Mop', type: 'electronics' },

  // Decoration (10 items)
  { id: 'Terracotta Vase Set', name: 'Terracotta Vases', type: 'decoration' },
  { id: 'Abstract Wall Canvas', name: 'Abstract Canvas', type: 'decoration' },
  { id: 'Full-Length Arch Mirror', name: 'Brass Arch Mirror', type: 'decoration' },
  { id: 'Boho Wool Berber Rug', name: 'Boho Berber Rug', type: 'decoration' },
  { id: 'Ceramic Table Sculpture', name: 'Ceramic Sculpture', type: 'decoration' },
  { id: 'Vintage Wall Clock', name: 'Minimalist Wall Clock', type: 'decoration' },
  { id: 'Silk Drapery Curtains', name: 'Silk Drapery Curtains', type: 'decoration' },
  { id: 'Decorative Throw Cushions', name: 'Accent Throw Pillows', type: 'decoration' },
  { id: 'Fluted Wood Wall Panels', name: 'Fluted Wood Panels', type: 'decoration' },
  { id: 'Woven Macrame Tapestry', name: 'Macrame Wall Hanging', type: 'decoration' },

  // Lighting (10 items)
  { id: 'Nordic Arc Floor Lamp', name: 'Nordic Arc Lamp', type: 'lighting' },
  { id: 'Sputnik Brass Chandelier', name: 'Brass Chandelier', type: 'lighting' },
  { id: 'Architectural LED Cove Strip', name: 'LED Cove Lighting', type: 'lighting' },
  { id: 'Smoked Glass Bedside Lamp', name: 'Smoked Glass Lamp', type: 'lighting' },
  { id: 'Edison Wall Sconce', name: 'Edison Wall Sconce', type: 'lighting' },
  { id: 'Track Spotlight System', name: 'Ceiling Track Lights', type: 'lighting' },
  { id: 'Rattan Pendant Light', name: 'Rattan Pendant Light', type: 'lighting' },
  { id: 'Crystal Waterdrop Chandelier', name: 'Crystal Chandelier', type: 'lighting' },
  { id: 'Minimalist LED Desk Lamp', name: 'Slim LED Desk Lamp', type: 'lighting' },
  { id: 'Outdoor Solar Garden Lantern', name: 'Solar Garden Lantern', type: 'lighting' },

  // Flooring (10 items)
  { id: 'Herringbone Oak Hardwood', name: 'Herringbone Oak Floor', type: 'flooring' },
  { id: 'Calacatta Marble Tile', name: 'Calacatta Marble Tile', type: 'flooring' },
  { id: 'Charcoal Slate Stone Tile', name: 'Slate Stone Tile', type: 'flooring' },
  { id: 'Polished Concrete Floor', name: 'Polished Concrete', type: 'flooring' },
  { id: 'Dark Walnut Parquet', name: 'Dark Walnut Parquet', type: 'flooring' },
  { id: 'Travertine Stone Tile', name: 'Travertine Stone Tile', type: 'flooring' },
  { id: 'Terrazzo Mosaic Tile', name: 'Terrazzo Mosaic Tile', type: 'flooring' },
  { id: 'Plush Wool Carpet', name: 'Plush Wool Carpet', type: 'flooring' },
  { id: 'Bamboo Wood Flooring', name: 'Bamboo Wood Plank', type: 'flooring' },
  { id: 'Hexagon Porcelain Tile', name: 'Hexagon Ceramic Tile', type: 'flooring' },

  // Appliances (10 items)
  { id: 'Smart French Door Refrigerator', name: 'Smart Refrigerator', type: 'appliances' },
  { id: '49-Inch Curved OLED Monitor', name: '49" OLED Monitor', type: 'appliances' },
  { id: 'Espresso Machine', name: 'Espresso Machine', type: 'appliances' },
  { id: 'Smart Treadmill', name: 'Smart Treadmill', type: 'appliances' },
  { id: 'Built-In Quiet Dishwasher', name: 'Built-In Dishwasher', type: 'appliances' },
  { id: 'Induction Glass Cooktop', name: 'Induction Cooktop', type: 'appliances' },
  { id: 'Front-Load Washer Dryer', name: 'Smart Washer Dryer', type: 'appliances' },
  { id: 'Dual-Zone Wine Cooler', name: 'Dual-Zone Wine Cooler', type: 'appliances' },
  { id: 'Countertop Air Fryer', name: 'Air Fryer Oven', type: 'appliances' },
  { id: 'Stainless Range Hood', name: 'Kitchen Range Hood', type: 'appliances' },

  // Fixtures (10 items)
  { id: 'Freestanding Bathtub', name: 'Freestanding Bathtub', type: 'fixtures' },
  { id: 'Matte Black Rainfall Shower', name: 'Rainfall Showerhead', type: 'fixtures' },
  { id: 'Cedar Wood Sauna Cabin', name: 'Cedar Wood Sauna', type: 'fixtures' },
  { id: 'Brushed Brass Vanity Faucet', name: 'Brass Vanity Faucet', type: 'fixtures' },
  { id: 'Double Vessel Sink Vanity', name: 'Double Vessel Vanity', type: 'fixtures' },
  { id: 'Wall-Hung Smart Toilet', name: 'Wall-Hung Smart Toilet', type: 'fixtures' },
  { id: 'Stone Fireplace Hearth', name: 'Stone Fireplace Hearth', type: 'fixtures' },
  { id: 'Apron Farmhouse Sink', name: 'Farmhouse Apron Sink', type: 'fixtures' },
  { id: 'Electric Towel Warmer', name: 'Heated Towel Warmer', type: 'fixtures' },
  { id: 'Hydrotherapy Jacuzzi Tub', name: 'Jacuzzi Spa Tub', type: 'fixtures' },

  // Plants (10 items)
  { id: 'Fiddle Leaf Fig Tree', name: 'Fiddle Leaf Fig Tree', type: 'plant' },
  { id: 'Monstera Deliciosa Plant', name: 'Monstera Plant', type: 'plant' },
  { id: 'Snake Plant Sansevieria', name: 'Snake Plant', type: 'plant' },
  { id: 'Olive Tree Terracotta', name: 'Potted Olive Tree', type: 'plant' },
  { id: 'Bird of Paradise Plant', name: 'Bird of Paradise', type: 'plant' },
  { id: 'Golden Pothos Hanging Basket', name: 'Pothos Hanging Vine', type: 'plant' },
  { id: 'Japanese Zen Bonsai', name: 'Zen Bonsai Tree', type: 'plant' },
  { id: 'Areca Feather Palm', name: 'Areca Feather Palm', type: 'plant' },
  { id: 'Peace Lily Plant', name: 'White Peace Lily', type: 'plant' },
  { id: 'Hanging Succulent Terrarium', name: 'Glass Succulent Terrarium', type: 'plant' },
];

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const DEFAULT_TOOLS_CONFIG = [
  {
    id: "interior-design",
    slug: "interior-design",
    name: "Interior Design AI",
    category: "interiors",
    widgets: [
      { id: "room-type", type: "Select Dropdown", label: "Room Type", dataSource: "room-types", options: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining Room", "Kids Room"], required: true, width: "half" },
      { id: "design-style", type: "Select Dropdown", label: "Design Style", dataSource: "design-styles", options: ["Modern", "Minimalist", "Scandinavian", "Japandi", "Industrial", "Bohemian", "Cyberpunk", "Traditional"], required: true, width: "half" },
      { id: "color-palette", type: "Select Dropdown", label: "Color Palette", dataSource: "color-palettes", options: ["Beige", "Charcoal Gray", "Sage Green", "Navy Blue", "Pure White", "Warm Terracotta", "Gold & Black"], required: false, width: "half" },
      { id: "lighting-atmosphere", type: "Select Dropdown", label: "Lighting Atmosphere", options: ["Warm Ambient", "Bright Daylight", "Soft Studio", "Dim Accent", "Neon Cyber"], required: false, width: "half" },
      { id: "furniture-layout", type: "Option Grid", label: "Furniture & Layout Handling", options: ["Replace everything", "Reuse everything possible", "Replace only damaged furniture"], required: true, width: "full" },
      { id: "budget-level", type: "Option Grid", label: "Budget Level", options: ["Low", "Medium", "Premium", "Luxury"], required: true, width: "full" },
      { id: "selected-products", type: "Check Grid", label: "Select Specific Products / Furniture", dataSource: "products", options: ["Sectional Sofa", "Executive Desk", "King Velvet Bed", "Oak Dining Table", "Cognac Armchair", "Leather Recliner Chair", "Floating TV Console", "Oak Bookshelf & Display"], required: false, width: "full" },
      { id: "room-size", type: "Option Grid", label: "Room Size", options: ["Small (< 150 sq ft)", "Medium (150 - 300 sq ft)", "Large (300 - 600 sq ft)", "Open Concept (> 600 sq ft)"], required: true, width: "full" }
    ]
  },
  {
    id: "ai-room-decorator",
    slug: "ai-room-decorator",
    name: "AI Room Decorator",
    category: "interiors",
    widgets: [
      { id: "room-type", type: "Select Dropdown", label: "Room Type", dataSource: "room-types", options: ["Living Room", "Open Kitchen Living Room", "Bedroom", "Guest Bedroom", "Kids Room", "Nursery", "Bathroom", "Dining Room", "Kitchen", "Home Office", "Outdoor Patio"], required: true },
      { id: "design-style", type: "Select Dropdown", label: "Design Style", dataSource: "design-styles", options: ["Modern", "Scandinavian", "Bohemian", "Japandi", "Minimalist", "Industrial", "Luxury", "Traditional"], required: true },
      { id: "decor-mode", type: "Option Grid", label: "Decoration Mode", options: ["Decorate Only", "Refurnish & Decorate", "Furnish Empty Space"], required: true },
      { id: "decor-accents", type: "Option Grid", label: "Decorative Textures & Accents", options: ["Bouclé Fabric", "Warm Wood", "Matte Black Metal", "Brass & Gold", "Premium Leather"] },
      { id: "decor-items", type: "Check Grid", label: "Select Decor Items to Add", options: ["Floor Rug", "Indoor Greenery", "Abstract Wall Art", "Throw Pillows", "Mirror", "Staging Books"] }
    ]
  },
  {
    id: "ai-room-cleaner",
    slug: "ai-room-cleaner",
    name: "AI Room Cleaner",
    category: "interiors",
    widgets: [
      { id: "room-type", type: "Select Dropdown", label: "Room Type", dataSource: "room-types", options: ["Living Room", "Open Kitchen Living Room", "Bedroom", "Guest Bedroom", "Kids Room", "Nursery", "Bathroom", "Dining Room", "Kitchen", "Home Office", "Outdoor Patio"], required: true },
      { id: "clean-level", type: "Option Grid", label: "Declutter Level", options: ["Light Tidy-up", "Deep Clean Floors & Surfaces", "Complete Empty Space"], required: true },
      { id: "preserve-elements", type: "Text Input", label: "Preserve Elements", placeholder: "e.g. Keep sofa, wall art & indoor plants", maxLength: 40 },
      { id: "items-to-remove", type: "Text Input", label: "Items to Remove", placeholder: "e.g. Trash, boxes & loose wires", maxLength: 40 }
    ]
  },
  {
    id: "paint-color-visualizer",
    slug: "paint-color-visualizer",
    name: "Paint Color Visualizer",
    category: "interiors",
    widgets: [
      { id: "paint-color", type: "Option Grid", label: "Select Wall Paint Color", options: ["Warm Beige", "Sage Green", "Charcoal Gray", "Navy Blue", "Soft Lavender", "Terracotta Red"], required: true },
      { id: "paint-finish", type: "Select Dropdown", label: "Paint Finish", options: ["Matte", "Satin (Low Sheen)", "Eggshell", "Glossy"], required: true },
      { id: "target-area", type: "Option Grid", label: "Target Area", options: ["All Walls", "Accent Wall Only", "Ceiling Only"] }
    ]
  },
  {
    id: "ai-flooring-design",
    slug: "ai-flooring-design",
    name: "AI Flooring Design",
    category: "interiors",
    widgets: [
      { id: "floor-material", type: "Select Dropdown", label: "Floor Material", options: ["Light Oak Hardwood", "Walnut Parquet", "Marble Tiles", "Polished Concrete", "Cozy Carpet"], required: true },
      { id: "pattern", type: "Option Grid", label: "Layout Pattern", options: ["Straight Plank", "Herringbone Pattern", "Chevron Pattern", "Subway Grid"] }
    ]
  },
  {
    id: "change-room-light",
    slug: "change-room-light",
    name: "Change Room Light",
    category: "interiors",
    widgets: [
      { id: "sunlight", type: "Option Grid", label: "Time of Day (Sunlight)", options: ["Bright Morning Sun", "Golden Hour Sunset", "Overcast Gloomy Day", "Midnight Moonlight"], required: true },
      { id: "lamps", type: "Check Grid", label: "Artificial Lamp Lights", options: ["LED Ceiling Strips", "Wall Spotlights", "Warm Floor Lamp", "Neon Colors"] }
    ]
  },
  {
    id: "ai-wall-design",
    slug: "ai-wall-design",
    name: "AI Wall Design",
    category: "interiors",
    widgets: [
      { id: "wall-treatment", type: "Select Dropdown", label: "Wall Accent Material", options: ["Vertical Wood Slats", "Exposed Brick Wall", "Decorative Paneling", "Polished Concrete Plaster", "Floral Wallpaper"], required: true },
      { id: "accent-color", type: "Option Grid", label: "Accent Trim Color", options: ["Natural Wood Tone", "Matte Black", "Bright White", "Classic Brick Red"] }
    ]
  },
  {
    id: "style-transfer",
    slug: "style-transfer",
    name: "Style Transfer",
    category: "interiors",
    widgets: [
      { id: "style-preset", type: "Select Dropdown", label: "Aesthetic Reference Preset", options: ["Luxury Penthouse", "Scandinavian Minimal", "Wabi-Sabi Organic", "Industrial Loft"], required: true }
    ]
  }
];

function GenerateStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolSlug = searchParams.get('tool');

  const [activeSpace, setActiveSpace] = useState<'floor-plans' | 'interiors' | 'exteriors' | 'gardens'>('interiors');
  const [selectedToolId, setSelectedToolId] = useState<string>(toolSlug || 'interior-design');

  useEffect(() => {
    const currentSlug = toolSlug || 'interior-design';
    setSelectedToolId(currentSlug);

    const matchingTool = ALL_STUDIO_TOOLS.find((t) => t.id === currentSlug);
    if (matchingTool) {
      setActiveSpace(matchingTool.category);
    } else {
      if (['floor-plan-generator', '3d-floor-plan', 'floor-plan-maker'].includes(currentSlug)) {
        setActiveSpace('floor-plans');
      } else if (['garden-design', 'landscape-design'].includes(currentSlug)) {
        setActiveSpace('gardens');
      } else if (['exterior-design', 'change-sky', 'sketch-to-render', 'ai-architecture-generator', 'ai-blueprint-generator'].includes(currentSlug)) {
        setActiveSpace('exteriors');
      } else {
        setActiveSpace('interiors');
      }
    }
  }, [toolSlug]);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isMouseDownRef = React.useRef<boolean>(false);
  const startXRef = React.useRef<number>(0);
  const scrollLeftRef = React.useRef<number>(0);

  const onDragMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const onDragMouseLeave = () => {
    isMouseDownRef.current = false;
  };

  const onDragMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const onDragMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleSelectToolWithDrag = (toolId: string) => {
    handleSelectTool(toolId);
  };

  const handleSelectTool = (toolId: string) => {
    setSelectedToolId(toolId);
    const tool = ALL_STUDIO_TOOLS.find((t) => t.id === toolId);
    if (tool) {
      setActiveSpace(tool.category);
    }
    router.push(`/generate?tool=${toolId}`);
  };

  const handleSelectSpace = (space: 'floor-plans' | 'interiors' | 'exteriors' | 'gardens') => {
    setActiveSpace(space);
    const currentToolObj = ALL_STUDIO_TOOLS.find((t) => t.id === selectedToolId);
    if (!currentToolObj || currentToolObj.category !== space) {
      const defaultForSpace = ALL_STUDIO_TOOLS.find((t) => t.category === space);
      if (defaultForSpace) {
        setSelectedToolId(defaultForSpace.id);
        router.push(`/generate?tool=${defaultForSpace.id}`);
      }
    }
  };

  const activeToolConfig = ALL_STUDIO_TOOLS.find((t) => t.id === selectedToolId) || ALL_STUDIO_TOOLS[3];
  const ActiveToolIcon = activeToolConfig.icon;

  // Model 01: Floor Plan Generator State
  const [bedroomsCount, setBedroomsCount] = useState<number>(3);
  const [bathroomsCount, setBathroomsCount] = useState<number>(2);
  const [floorPlanStyle, setFloorPlanStyle] = useState<string>('Modern Open-Concept');
  const [plotDimensions, setPlotDimensions] = useState<string>('40ft x 60ft');

  // Interior state
  const [selectedRoomType, setSelectedRoomType] = useState<string>('Living Room');
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [selectedSize, setSelectedSize] = useState<string>('Medium');
  const [selectedPalette, setSelectedPalette] = useState<string>('beige');
  const [selectedMood, setSelectedMood] = useState<string>('Cozy');
  const [selectedLighting, setSelectedLighting] = useState<string>('Warm');
  const [selectedBudget, setSelectedBudget] = useState<string>('medium');
  const [furnitureHandling, setFurnitureHandling] = useState<string>('replace-all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [showCustomRequirements, setShowCustomRequirements] = useState<boolean>(false);
  const [customRequirements, setCustomRequirements] = useState<string>('');
  const [preserveStructure, setPreserveStructure] = useState<boolean>(true);

  const toggleProductSelection = (productName: string) => {
    if (selectedProducts.includes(productName)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== productName));
    } else {
      if (selectedProducts.length >= 10) return; // Limit to 10 products
      setSelectedProducts([...selectedProducts, productName]);
    }
  };

  // Exterior & Garden state
  const [houseAngle, setHouseAngle] = useState<string>('Side of house');
  const [buildingType, setBuildingType] = useState<string>('House');
  const [roofType, setRoofType] = useState<string>('Flat Roof');
  const [environment, setEnvironment] = useState<string>('City');
  const [timeOfDay, setTimeOfDay] = useState<string>('Morning');
  const [exteriorTool, setExteriorTool] = useState<string>('Redesign');
  const [exteriorStyle, setExteriorStyle] = useState<string>('Modern');
  const [gardenType, setGardenType] = useState<string>('Backyard Oasis');
  const [gardenStyle, setGardenStyle] = useState<string>('Modern Landscape');
  const [aiInterventionIndex, setAiInterventionIndex] = useState<number>(2);
  const [showCustomInstructions, setShowCustomInstructions] = useState<boolean>(false);
  const [customAiInstructions, setCustomAiInstructions] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState<boolean>(true);
  const [generatedImagesList, setGeneratedImagesList] = useState<string[]>([]);
  const { showToast } = useToast();

  // Projects state
  const [projectsList, setProjectsList] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [isUserUploaded, setIsUserUploaded] = useState<boolean>(false);
  const [dbTools, setDbTools] = useState<any[]>(DEFAULT_TOOLS_CONFIG);
  const activeDbTool = dbTools.find((t: any) => {
    if (!t) return false;
    const tSlug = (t.slug || t.id || '').toLowerCase();
    const targetSlug = (selectedToolId || toolSlug || 'interior-design').toLowerCase();
    return (
      tSlug === targetSlug ||
      t._id === targetSlug ||
      tSlug.replace(/-/g, '') === targetSlug.replace(/-/g, '') ||
      (targetSlug.includes('room-decorator') && (tSlug.includes('room-decorator') || tSlug.includes('furniture-decor'))) ||
      (targetSlug.includes('cleaner') && tSlug.includes('cleaner')) ||
      (targetSlug.includes('paint') && tSlug.includes('paint')) ||
      (targetSlug.includes('floor') && tSlug.includes('floor')) ||
      (targetSlug.includes('wall') && tSlug.includes('wall')) ||
      (targetSlug.includes('light') && tSlug.includes('light')) ||
      (targetSlug.includes('interior') && tSlug.includes('interior'))
    );
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [demoAfterResult, setDemoAfterResult] = useState<string | null>(null);

  const resolveDirectImageUrl = (rawUrl: string): string => {
    let cleanUrl = rawUrl.trim();
    if (!cleanUrl) return '';

    // Direct image asset URL check (.jpg, .png, .webp, or images.unsplash.com / images.pexels.com)
    if (
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(cleanUrl) ||
      cleanUrl.includes('images.unsplash.com') ||
      cleanUrl.includes('images.pexels.com') ||
      cleanUrl.startsWith('data:image/')
    ) {
      return cleanUrl;
    }

    // 1. Convert Unsplash photo webpage URLs (e.g. https://unsplash.com/photos/white-and-blue-knit-textile-53BjYSxca5g)
    const unsplashMatch = cleanUrl.match(/unsplash\.com\/photos\/(?:[^\/]+-)?([a-zA-Z0-9_-]+)/i);
    if (unsplashMatch && unsplashMatch[1]) {
      const segment = unsplashMatch[1];
      const photoId = segment.includes('-') ? segment.split('-').pop()! : segment;
      if (photoId.startsWith('photo-')) {
        return `https://images.unsplash.com/${photoId}?q=80&w=1200&auto=format&fit=crop`;
      }
      return `https://unsplash.com/photos/${photoId}/download?force=true`;
    }

    // 2. Convert Pexels photo webpage URLs (e.g. https://pexels.com/photo/...)
    const pexelsMatch = cleanUrl.match(/pexels\.com\/photo\/(?:[^\/]+-)?([0-9]+)/i);
    if (pexelsMatch && pexelsMatch[1]) {
      const photoId = pexelsMatch[1];
      return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
    }

    return cleanUrl;
  };

  const handleFetchUrlImage = async () => {
    const rawUrl = imageUrlInput.trim();
    if (!rawUrl) return;

    // 1. Instant client-side resolution for Unsplash / Pexels / direct image links
    const resolvedUrl = resolveDirectImageUrl(rawUrl);
    if (resolvedUrl && resolvedUrl !== rawUrl) {
      setUploadedImage(resolvedUrl);
      setGeneratedResult(null);
      setDemoAfterResult(null);
      setIsUserUploaded(true);
      return;
    }

    // 2. Direct image URL check (.jpg, .png, .webp, data:image, etc.)
    if (
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(rawUrl) ||
      rawUrl.includes('images.unsplash.com') ||
      rawUrl.includes('images.pexels.com') ||
      rawUrl.startsWith('data:image/')
    ) {
      setUploadedImage(rawUrl);
      setGeneratedResult(null);
      setDemoAfterResult(null);
      setIsUserUploaded(true);
      return;
    }

    // 3. Fallback to Backend URL Scraper API if available
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/uploads/resolve-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        const resolved = data.data?.url || data.url || data.directUrl;
        if (resolved && (resolved.startsWith('http') || resolved.startsWith('data:image/'))) {
          setUploadedImage(resolved);
          setGeneratedResult(null);
          setDemoAfterResult(null);
          setIsUserUploaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to resolve URL via backend API:', e);
    }

    setUploadedImage(rawUrl);
    setGeneratedResult(null);
    setDemoAfterResult(null);
    setIsUserUploaded(true);
  };

  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);

  const CustomSelect: React.FC<{
    value: string;
    onChange: (val: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    className?: string;
  }> = ({ value, onChange, options, placeholder = 'Select option', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (!isOpen) setSearchQuery('');
    }, [isOpen]);

    const selectedItem = options.find((opt) => opt.value === value);
    const displayLabel = selectedItem ? selectedItem.label : value || placeholder;

    const showSearch = options.length > 5;
    const filteredOptions = showSearch
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    return (
      <div className={`relative w-full ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2 bg-white border border-slate-200 hover:border-purple-500 focus:border-purple-600 rounded-lg text-xs font-bold text-slate-900 flex items-center justify-between transition-all cursor-pointer shadow-2xs group hover:bg-purple-50/20"
        >
          <span className="truncate text-left font-heading">{displayLabel}</span>
          <ChevronDown className={`w-4 h-4 text-purple-600 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 backdrop-blur-md rounded-xl border border-purple-100 shadow-xl p-1.5 max-h-64 overflow-y-auto space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {showSearch && (
                <div className="sticky top-0 z-10 bg-white pb-1.5 pt-0.5 px-0.5 border-b border-slate-100 mb-1">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search options..."
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 text-center">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={`${opt.value}-${idx}`}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-all cursor-pointer font-heading ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-purple-50 hover:text-purple-900 font-semibold'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dynamicWidgetValues, setDynamicWidgetValues] = useState<Record<string, any>>({});
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setGenerationElapsedSeconds(0);
      timer = setInterval(() => {
        setGenerationElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating]);

  const getGenerationProgressStatus = (seconds: number) => {
    if (seconds < 5) return '🚀 Task Enqueued • Initializing AI Model & Prompts...';
    if (seconds < 15) return '📐 Preserving Structural Geometry, Windows & Walls...';
    if (seconds < 45) return '🎨 Rendering Photorealistic 8K Architectural Transformation...';
    if (seconds < 90) return '✨ Refining Materials, Lighting & Furniture Details...';
    return '⚡ Finalizing High-Res Output & Updating Project Credits...';
  };

  const sliderContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const fetchProjects = async () => {
      const projs = await projectService.getProjects();
      setProjectsList(projs);
    };
    const fetchDbTools = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await fetch(`${baseUrl}/ai-tools`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setDbTools(json.data);
          }
        }
      } catch (e) {
        console.warn('Could not fetch DB tools:', e);
      }
    };
    fetchProjects();
    fetchDbTools();
  }, []);

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    if (!projId) return;
    const proj = projectsList.find((p) => p._id === projId || p.id === projId);
    if (proj && proj.theme) {
      setSelectedStyle(proj.theme);
      setExteriorStyle(proj.theme);
      setGardenStyle(proj.theme);
      if (proj.colorPalette) setSelectedPalette(proj.colorPalette);
      if (proj.lighting) setSelectedLighting(proj.lighting);
    }
  };

  useEffect(() => {
    const updateWidth = () => {
      if (sliderContainerRef.current) {
        setContainerWidth(sliderContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const [apiTokenStatus, setApiTokenStatus] = useState<{ configured: boolean; message: string } | null>(null);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await fetch(`${baseUrl}/health`);
        if (res.ok) {
          const data = await res.json();
          setApiTokenStatus({
            configured: !!(data.manusApiTokenConfigured ?? data.replicateApiTokenConfigured),
            message: data.message || '',
          });
        }
      } catch (err) {
        setApiTokenStatus({
          configured: false,
          message: 'Backend server is offline. Run npm run dev:backend to start backend.',
        });
      }
    };
    checkApiHealth();
  }, []);

  // Handle image upload input
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUploadedImage(evt.target?.result as string);
        setGeneratedResult(null);
        setDemoAfterResult(null);
        setIsUserUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger AI Redesign Generation
  const handleGenerate = async () => {
    if (!uploadedImage) return;

    let currentUser: any = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {
      // Ignore parse error
    }

    if (currentUser && currentUser.credits !== undefined && currentUser.credits <= 0) {
      showToast({
        type: 'error',
        title: 'Insufficient Credits',
        message: 'You have 0 credits remaining. Please top up your plan to continue generating AI redesigns.',
      });
      return;
    }

    if (!uploadedImage) {
      showToast({
        type: 'error',
        title: 'Photo Required',
        message: 'Please upload a photo or fetch an image URL before starting AI redesign.',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const currentSlug = toolSlug || selectedToolId || (activeSpace === 'floor-plans' ? 'floor-plan-generator' : activeSpace === 'exteriors' ? 'exterior-design' : activeSpace === 'gardens' ? 'landscape-design' : 'interior-design');

    const bodyPayload = {
      originalImage: uploadedImage,
      toolSlug: currentSlug,
      userId: currentUser?._id || currentUser?.id || undefined,
      creditsCost: 1,
      roomType: activeSpace === 'floor-plans' ? 'Floor Plan Layout' : activeSpace === 'exteriors' ? 'Exterior Facade' : activeSpace === 'gardens' ? gardenType : selectedRoomType,
      theme: activeSpace === 'exteriors' ? exteriorStyle : activeSpace === 'gardens' ? gardenStyle : selectedStyle,
      designStyle: activeSpace === 'exteriors' ? exteriorStyle : activeSpace === 'gardens' ? gardenStyle : selectedStyle,
      roomSize: selectedSize,
      colorPalette: selectedPalette,
      mood: selectedMood,
      lighting: selectedLighting,
      budgetLevel: selectedBudget,
      furnitureHandling,
      selectedProducts,
      buildingType,
      roofType,
      environment,
      timeOfDay,
      houseAngle,
      bedroomsCount,
      bathroomsCount,
      floorPlanStyle,
      plotDimensions,
      aiIntervention: INTERVENTION_LEVELS[aiInterventionIndex],
      customRequirements: showCustomRequirements ? customRequirements : (showCustomInstructions ? customAiInstructions : ''),
      projectId: selectedProjectId || undefined,
    };

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/rooms/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = resData.message || resData.error || `Generation API failed with HTTP status ${response.status}`;
        setGenerationError(errorMsg);
        showToast({
          type: 'error',
          title: 'Generation Failed',
          message: errorMsg,
        });
        setIsGenerating(false);
        return;
      }

      const output = resData.generatedImage || resData.data?.generatedImage || resData.image || resData.url;
      if (output) {
        const allImgs = resData.generatedImages || resData.images || resData.data?.generatedImages || [output];
        setGeneratedResult(output);
        setGeneratedImagesList(Array.isArray(allImgs) ? allImgs : [output]);
        setCompiledPrompt(resData.prompt || resData.data?.prompt || '');
        showToast({
          type: 'success',
          title: 'AI Transformation Complete',
          message: 'Your new space design has been generated successfully!',
        });

        // Update local storage user credits & dispatch event
        if (currentUser) {
          const remaining = resData.remainingCredits ?? resData.data?.remainingCredits ?? (currentUser.credits !== undefined ? Math.max(0, currentUser.credits - 1) : 0);
          const updatedUser = { ...currentUser, credits: remaining };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('user-updated'));
        }
      } else {
        const errorMsg = resData.message || 'No generated image returned from AI backend service.';
        setGenerationError(errorMsg);
        showToast({
          type: 'error',
          title: 'Generation Error',
          message: errorMsg,
        });
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Unable to connect to AI generation server. Please verify your internet connection and API status.';
      setGenerationError(errorMsg);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: errorMsg,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // SINGLE COMMON BACKGROUND CARD BOX WRAPPING ENTIRE STUDIO
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xs">
      {/* TOP SPACE & TOOL SELECTOR BAR */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* SPACE CATEGORY TAB BUTTONS (FLOATING DESIGN WITHOUT GREY BOX) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-1">
          {(
            [
              { id: 'floor-plans', label: 'Floor Plans', icon: Ruler },
              { id: 'interiors', label: 'Interiors', icon: Layout },
              { id: 'exteriors', label: 'Exteriors', icon: Home },
              { id: 'gardens', label: 'Gardens', icon: Flower2 },
            ] as const
          ).map((space) => {
            const SpaceIcon = space.icon;
            const isSpaceActive = activeSpace === space.id;
            const spaceToolCount = ALL_STUDIO_TOOLS.filter((t) => t.category === space.id).length;
            return (
              <button
                key={space.id}
                type="button"
                onClick={() => handleSelectSpace(space.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${isSpaceActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 border-purple-600 font-black scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 border-slate-200/90 dark:border-slate-700 shadow-2xs'
                  }`}
              >
                <SpaceIcon className={`w-3.5 h-3.5 ${isSpaceActive ? 'text-white' : 'text-purple-600'}`} />
                <span>{space.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-2xl text-[10px] font-extrabold ${isSpaceActive ? 'bg-white/20 text-white backdrop-blur-xs' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {spaceToolCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* 18 AI TOOLS SINGLE-ROW HORIZONTAL SCROLLBAR */}
        <div
          ref={scrollContainerRef}
          onMouseDown={onDragMouseDown}
          onMouseUp={onDragMouseUp}
          onMouseLeave={onDragMouseLeave}
          onMouseMove={onDragMouseMove}
          className="flex flex-nowrap items-center justify-start gap-2.5 w-full max-w-full h-[68px] overflow-x-auto overflow-y-hidden px-2 py-2 custom-scrollbar-horizontal select-none cursor-grab active:cursor-grabbing"
        >
          {ALL_STUDIO_TOOLS.filter((t) => t.category === activeSpace).map((t) => {
            const ToolIcon = t.icon;
            const isSelected = selectedToolId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectToolWithDrag(t.id)}
                data-selected={isSelected}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs whitespace-nowrap transition-all cursor-pointer border ${isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-md shadow-purple-500/20 font-extrabold scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/40 hover:-translate-y-0.5 shadow-2xs font-semibold'
                  }`}
              >
                <ToolIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                <span>{t.name}</span>
                {t.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-2xl text-[9px] font-black uppercase tracking-wider ${isSelected
                        ? 'bg-white/20 text-purple-100 backdrop-blur-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700'
                      }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN STUDIO TWO-COLUMN LAYOUT (INSIDE SINGLE COMMON BACKGROUND) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">

        {/* LEFT COLUMN: Latest from Our Community & AI Render Interactive Viewer */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">
                Latest from Our Community
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real AI architectural transformations with structural preservation.
              </p>
            </div>
            {generatedResult && (
              <a
                href={generatedResult}
                download="redesign_render.jpg"
                target="_blank"
                rel="noreferrer"
                title="Download HD Image"
                className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* GENERATION ERROR ALERT BANNER */}
          {generationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 shadow-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider font-heading text-rose-900">
                    Generation Service Notice
                  </h4>
                  <p className="text-xs font-medium text-rose-700 mt-0.5">
                    {generationError}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGenerationError(null)}
                className="text-rose-500 hover:text-rose-800 text-xs font-bold p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ATTACHED SOURCE PHOTO VERIFICATION BAR */}
          {uploadedImage && (
            <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-slate-800">
                  <img
                    src={uploadedImage}
                    alt="Source Room Upload"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-heading">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Source Room Photo Attached</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate font-mono mt-0.5">
                    {uploadedImage.startsWith('data:')
                      ? 'Base64 image buffer saved & attached to AI prompt'
                      : uploadedImage}
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                URL Verified
              </div>
            </div>
          )}

          {/* Interactive Before / After Split Render Viewer */}
          {(() => {
            const sampleBeforeImg = activeDbTool?.demoBeforeImage || activeToolConfig.demoBeforeImage ||
              (activeSpace === 'exteriors' 
                ? 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop'
                : activeSpace === 'gardens'
                ? 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=1200&auto=format&fit=crop'
                : activeSpace === 'floor-plans'
                ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop');

            const sampleAfterImg = activeDbTool?.demoAfterImage || activeToolConfig.demoAfterImage ||
              (activeSpace === 'exteriors'
                ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop'
                : activeSpace === 'gardens'
                ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200&auto=format&fit=crop'
                : activeSpace === 'floor-plans'
                ? 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop');

            const isDemoSample = !generatedResult && !uploadedImage;
            const displayBefore = uploadedImage || sampleBeforeImg;
            const displayAfter = generatedResult || (uploadedImage ? null : sampleAfterImg);

            return (
              <div
                ref={sliderContainerRef}
                className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-white border border-slate-200 select-none shadow-xs group"
              >
                {/* RIGHT SIDE: AI REDESIGN IMAGE OR CLEAN WHITE CANVAS BEFORE GENERATION */}
                {displayAfter ? (
                  <img
                    src={displayAfter}
                    alt="AI Redesign"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-50/90 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100/80 flex items-center justify-center mb-2.5 shadow-2xs border border-purple-200/60">
                      <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                    </div>
                    <span className="text-xs font-black text-slate-900 font-heading tracking-wide uppercase">AI Transformation Area</span>
                    <span className="text-[11px] text-slate-500 mt-1 font-medium max-w-xs">Configure options on the right & click Generate to transform your space</span>
                  </div>
                )}

                {/* LEFT SIDE: ORIGINAL USER UPLOAD OR DEMO BEFORE */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden z-10 border-r border-white/90 shadow-lg"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={displayBefore}
                    alt="Original Space"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="absolute top-0 left-0 h-full max-w-none object-cover"
                    style={{
                      width: containerWidth ? `${containerWidth}px` : '100%',
                      height: '100%',
                    }}
                  />
                </div>

                {/* SLIDER INTERACTIVE HANDLE */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-white/90 cursor-ew-resize flex items-center justify-center shadow-md z-20"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-purple-700 shadow-lg border border-slate-200 flex items-center justify-center text-[10px] font-extrabold -ml-3.25">
                    ↔
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />

                {/* STATUS BADGES */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold rounded-lg pointer-events-none z-20">
                  {uploadedImage ? 'Before (Your Upload)' : 'Before (Sample)'}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white font-extrabold text-[11px] rounded-lg shadow-md pointer-events-none flex items-center gap-1 z-20">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>
                    {generatedResult
                      ? `After (${selectedStyle} AI)`
                      : uploadedImage
                      ? 'Ready to Redesign'
                      : `Sample ${activeToolConfig.name}`}
                  </span>
                </div>

                {isDemoSample && (
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md text-white/90 rounded-xl text-[11px] font-bold z-20 border border-white/10">
                    <Info className="w-3.5 h-3.5 text-purple-400" />
                    <span>Sample Preview for {activeToolConfig.name}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* LIVE AI ARCHITECTURAL WORKFLOW & DESIGN ANALYSIS CARD */}
          {(isGenerating || generatedResult || compiledPrompt || generationError) && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 animate-in fade-in duration-200">
              <div
                onClick={() => setIsWorkflowExpanded(!isWorkflowExpanded)}
                className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 cursor-pointer select-none group/hdr"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 group-hover/hdr:bg-purple-100 transition-all">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>AI Architectural Workflow & Design Analysis</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isWorkflowExpanded ? 'rotate-180' : ''}`} />
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isGenerating ? 'Live execution breakdown...' : 'Transformation workflow & design specification'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isGenerating && (
                    <div className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold flex items-center gap-1.5 animate-pulse border border-purple-200 dark:border-purple-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                      <span>Processing Stage {
                        generatedResult ? '5 / 5' :
                        generationElapsedSeconds > 40 ? '5 / 5' :
                        generationElapsedSeconds > 30 ? '4 / 5' :
                        generationElapsedSeconds > 18 ? '3 / 5' :
                        generationElapsedSeconds > 8 ? '2 / 5' : '1 / 5'
                      }</span>
                    </div>
                  )}
                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider hidden sm:inline-block">
                    {isWorkflowExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </div>
              </div>

              {/* 5-STEP SANITIZED WORKFLOW STATE MACHINE WITH INTERNAL SCROLLBAR */}
              <div className={`space-y-2 transition-all duration-300 overflow-hidden ${isWorkflowExpanded ? 'max-h-[340px] overflow-y-auto custom-scrollbar pr-1' : 'max-h-0 opacity-0'}`}>
                {(() => {
                  const staticSteps = [
                    {
                      id: 'direction',
                      num: 1,
                      title: 'Prepare Visual Redesign Direction',
                      description: 'Defining the visual redesign direction based on your selected style, palette and lighting.',
                    },
                    {
                      id: 'source',
                      num: 2,
                      title: 'Locate Source Interior Image & Preserve Composition',
                      description: 'Analyzing the source room to preserve its camera angle, structure and architectural geometry.',
                    },
                    {
                      id: 'generate',
                      num: 3,
                      title: 'Generate High-Precision Architectural Render',
                      description: 'Creating the high-resolution interior render with the selected materials, furniture and lighting.',
                    },
                    {
                      id: 'review',
                      num: 4,
                      title: 'Verify Image Quality & Style',
                      description: 'Reviewing the generated image for visual quality, composition and style consistency.',
                    },
                    {
                      id: 'deliver',
                      num: 5,
                      title: 'Deliver Finished Visual Result',
                      description: 'Preparing your final high-resolution design result.',
                    },
                  ];

                  let activeIndex = 0;
                  if (generatedResult) {
                    activeIndex = 5; // All completed
                  } else if (generationError) {
                    activeIndex = generationElapsedSeconds > 30 ? 3 : generationElapsedSeconds > 18 ? 2 : 1;
                  } else if (isGenerating) {
                    activeIndex = generationElapsedSeconds > 40 ? 4 : generationElapsedSeconds > 30 ? 3 : generationElapsedSeconds > 18 ? 2 : generationElapsedSeconds > 8 ? 1 : 0;
                  }

                  return staticSteps.map((step, idx) => {
                    let stepStatus: 'completed' | 'running' | 'pending' | 'error' = 'pending';
                    if (generatedResult || idx < activeIndex) {
                      stepStatus = 'completed';
                    } else if (idx === activeIndex && !generatedResult && isGenerating) {
                      stepStatus = 'running';
                    } else if (idx === activeIndex && generationError) {
                      stepStatus = 'error';
                    }

                    const isCompleted = stepStatus === 'completed';
                    const isRunning = stepStatus === 'running';
                    const isError = stepStatus === 'error';

                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-xs ${
                          isRunning
                            ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 shadow-xs'
                            : isCompleted
                              ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60'
                              : isError
                                ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                                : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-100/60 dark:border-slate-800/30 opacity-60'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isRunning ? (
                            <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                          ) : isError ? (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">
                              {step.num}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-bold font-heading ${
                              isRunning
                                ? 'text-purple-700 dark:text-purple-300'
                                : isCompleted
                                  ? 'text-slate-800 dark:text-slate-200'
                                  : isError
                                    ? 'text-rose-700 dark:text-rose-300'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {step.num}. {step.title}
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 leading-relaxed font-medium ${
                              isRunning
                                ? 'text-purple-600/90 dark:text-purple-300/90'
                                : isCompleted
                                  ? 'text-slate-500 dark:text-slate-400'
                                  : isError
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {isError
                              ? generationError
                              : isRunning
                                ? `${step.description} (Processing...)`
                                : isCompleted
                                  ? idx === 4
                                    ? `Transformation complete! High-resolution ${selectedStyle} ${selectedRoomType} delivered.`
                                    : `${step.description} Complete.`
                                  : step.description}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* AI ARCHITECTURAL ANALYSIS SUMMARY NOTE */}
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 space-y-1">
                <div className="text-[11px] font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>AI Design Analysis Summary</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  The {selectedRoomType} redesign uses the requested {selectedStyle} direction with {selectedPalette || 'tailored'} color palette, {selectedLighting || 'natural'} lighting, and structural preservation. Final delivery is in 8K UHD resolution with matching architectural perspective.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Start Redesigning Your Space Form (WHITE THEME AS REQUESTED) */}
        <div className="lg:col-span-6 space-y-5">



          {/* Form Title */}
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Start Redesigning Your Space:
            </h2>
          </div>



          {/* STEP 1: UPLOAD YOUR PHOTO */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 font-heading">
              Step 1: Upload Your Photo
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* SQUARE DROPZONE / PREVIEW WITH CORNER (X) CLOSE BUTTON */}
              {uploadedImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group w-32 h-32 shrink-0 shadow-2xs">
                  <img
                    src={uploadedImage}
                    alt="Uploaded Space Preview"
                    onError={(e) => {
                      const fallback = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop';
                      (e.target as HTMLImageElement).src = fallback;
                      if (uploadedImage !== fallback) {
                        setUploadedImage(fallback);
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* TOP-RIGHT CORNER CLOSE (X) BUTTON */}
                  <button
                    type="button"
                    title="Remove Image"
                    onClick={() => {
                      setUploadedImage(null);
                      setImageUrlInput('');
                      setGeneratedResult(null);
                      setDemoAfterResult(null);
                      setIsUserUploaded(false);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* HOVER CHANGE OPTION */}
                  <label className="absolute inset-x-0 bottom-0 py-1 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                    Change File
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 shrink-0 border-2 border-dashed border-purple-300/90 hover:border-purple-600 bg-purple-50/20 hover:bg-purple-50/60 rounded-2xl cursor-pointer transition-all group p-2 text-center">
                  <Upload className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    Drop photo or browse
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}

              {/* ALWAYS VISIBLE URL PASTE & FETCH INPUT */}
              <div className="flex-1 space-y-1.5 w-full max-w-xs">
                <span className="text-xs font-bold text-slate-700 block font-heading">Or paste Image URL:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="https://unsplash.com/photos/... or direct link"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFetchUrlImage();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrlImage}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    Fetch
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Paste image URL and click Fetch or press Enter</p>
              </div>
            </div>
          </div>

          {/* STEP 2: CUSTOMIZE FORM (DYNAMIC PER AI TOOL FROM DB & ADMIN PANEL) */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 font-heading">
                Step 2: Customize
              </h3>
            </div>

            {/* SIMPLE PROJECT SELECTOR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between font-heading">
                  <span>Select Project</span>
                </label>
                {selectedProjectId && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>

              <CustomSelect
                value={selectedProjectId}
                onChange={(val) => handleSelectProject(val)}
                options={[
                  { value: '', label: '-- Standalone Generation (No Project) --' },
                  ...projectsList.map((p) => ({
                    value: p._id || p.id || '',
                    label: `📁 ${p.name} (${p.theme} Theme ${p.manusChatId ? '• AI Session Active' : ''})`,
                  })),
                ]}
              />
            </div>

            {/* DYNAMIC DB CUSTOMIZED WIDGETS FOR ACTIVE TOOL */}
            {activeDbTool && activeDbTool.widgets && activeDbTool.widgets.length > 0 && (() => {
              const renderWidgetSingle = (widget: any, idx: number) => {
                const widgetId = widget.id || `w-${idx}`;
                const label = widget.label || widget.id;
                const isRequired = widget.required;
                const isRoomType = widget.id === 'room-type' || widget.dataSource === 'room-types' || (widget.label && widget.label.toLowerCase().includes('room type'));
                const isDesignStyle = widget.id === 'design-style' || widget.dataSource === 'design-styles' || (widget.label && widget.label.toLowerCase().includes('design style'));
                const isColorPalette = widget.id === 'color-palette' || widget.dataSource === 'color-palettes' || (widget.label && widget.label.toLowerCase().includes('color palette'));
                const isLighting = widget.id === 'lighting' || widget.id === 'lighting-atmosphere' || widget.id === 'lighting-mood' || widget.dataSource === 'lighting' || (widget.label && widget.label.toLowerCase().includes('lighting'));

                const options: string[] = isRoomType
                  ? ROOM_TYPES
                  : isDesignStyle
                    ? DESIGN_STYLES.map((s: any) => (typeof s === 'string' ? s : s.name))
                    : isColorPalette
                      ? COLOR_PALETTES.map((p: any) => (typeof p === 'string' ? p : p.name))
                      : isLighting
                        ? LIGHTING_OPTIONS
                        : (widget.options && widget.options.length > 0 ? widget.options : []);

                if (widget.type === 'Select Dropdown' || widget.type === 'Select') {
                  const curVal = dynamicWidgetValues[widgetId] || (
                    widget.id === 'room-type' ? selectedRoomType :
                      widget.id === 'design-style' ? selectedStyle :
                        widget.id === 'color-palette' ? selectedPalette :
                          widget.id === 'lighting-atmosphere' || widget.id === 'lighting-mood' ? selectedLighting :
                            options[0] || ''
                  );

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>{label}</span>
                        {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                      </label>
                      <CustomSelect
                        value={curVal}
                        onChange={(val) => {
                          setDynamicWidgetValues((prev) => ({ ...prev, [widgetId]: val }));
                          if (widget.id === 'room-type') setSelectedRoomType(val);
                          else if (widget.id === 'design-style') setSelectedStyle(val);
                          else if (widget.id === 'color-palette') setSelectedPalette(val);
                          else if (widget.id === 'lighting-atmosphere' || widget.id === 'lighting-mood') setSelectedLighting(val);
                        }}
                        options={options.map((opt: string) => ({ value: opt, label: opt }))}
                      />
                    </div>
                  );
                }

                if (widget.type === 'Option Grid' || widget.type === 'Button Group') {
                  const curVal = dynamicWidgetValues[widgetId] || (
                    widget.id === 'budget-level' ? selectedBudget :
                      widget.id === 'furniture-layout' ? furnitureHandling :
                        widget.id === 'room-size' ? selectedSize :
                          options[0] || ''
                  );

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>{label}</span>
                        {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {options.map((opt: string) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setDynamicWidgetValues((prev) => ({ ...prev, [widgetId]: opt }));
                              if (widget.id === 'budget-level') setSelectedBudget(opt);
                              else if (widget.id === 'furniture-layout') setFurnitureHandling(opt);
                              else if (widget.id === 'room-size') setSelectedSize(opt);
                            }}
                            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all border cursor-pointer ${
                              curVal === opt
                                ? 'bg-purple-50/70 border-purple-600 text-purple-800 font-bold shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:bg-slate-50 font-semibold'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                const isProductsWidget = widget.id === 'selected-products' || widget.dataSource === 'products' || (label && label.toLowerCase().includes('product'));

                if (isProductsWidget) {
                  const curArray: string[] = dynamicWidgetValues[widgetId] || selectedProducts;

                  return (
                    <div key={widgetId} className="space-y-2 pt-1 border-t border-slate-100 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 font-heading flex items-center gap-1.5">
                          <span>{label}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            curArray.length >= 10
                              ? 'bg-rose-100 text-rose-700'
                              : curArray.length > 0
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {curArray.length} / 10 selected
                          </span>
                        </label>

                        {curArray.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProducts([]);
                              setDynamicWidgetValues((prev) => ({ ...prev, [widgetId]: [] }));
                            }}
                            className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {['all', 'furniture', 'electronics', 'decoration', 'lighting', 'flooring', 'appliances', 'fixtures', 'plant'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setProductCategoryFilter(cat)}
                            className={`py-1 px-2.5 text-[10px] font-bold rounded-lg capitalize whitespace-nowrap border transition-all cursor-pointer ${
                              productCategoryFilter === cat
                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Products Grid Chips */}
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50/80 rounded-xl border border-slate-200/90">
                        {SELECTABLE_PRODUCT_ITEMS.filter((item) => productCategoryFilter === 'all' || item.type === productCategoryFilter).map((item) => {
                          const isSelected = curArray.includes(item.name);
                          const isDisabled = !isSelected && curArray.length >= 10;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                const updated = isSelected
                                  ? curArray.filter((p) => p !== item.name)
                                  : [...curArray, item.name];
                                setSelectedProducts(updated);
                                setDynamicWidgetValues((prev) => ({ ...prev, [widgetId]: updated }));
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-50/70 border-purple-600 text-purple-800 font-bold shadow-2xs'
                                  : isDisabled
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50'
                              }`}
                            >
                              <span>{item.name}</span>
                              {isSelected && <span className="text-[10px] text-purple-700 font-black">✓</span>}
                            </button>
                          );
                        })}
                      </div>

                      {curArray.length >= 10 && (
                        <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          ⚠️ Maximum limit of 10 products reached. Unselect an item to choose another.
                        </p>
                      )}
                    </div>
                  );
                }

                if (widget.type === 'Check Grid' || widget.type === 'Multi Select') {
                  const curArray: string[] = dynamicWidgetValues[widgetId] || [];

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                          <span>{label}</span>
                          {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                        </label>
                        {curArray.length > 0 && (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            {curArray.length} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/40 rounded-xl border border-slate-200/80">
                        {options.map((opt: string) => {
                          const isSelected = curArray.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicWidgetValues((prev) => {
                                  const existing = prev[widgetId] || [];
                                  const updated = existing.includes(opt)
                                    ? existing.filter((item: string) => item !== opt)
                                    : [...existing, opt];
                                  return { ...prev, [widgetId]: updated };
                                });
                              }}
                              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all border cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-50/70 border-purple-600 text-purple-800 font-bold shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:bg-slate-50 font-semibold'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (widget.type === 'Text Input' || widget.type === 'Text Block' || widget.type === 'Input' || widget.type === 'Text Area') {
                  const maxLen = widget.maxLength || 40;
                  const curVal = dynamicWidgetValues[widgetId] || '';
                  const remaining = Math.max(0, maxLen - curVal.length);

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                          <span>{label}</span>
                          {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {remaining} chars left
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={maxLen}
                          value={curVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDynamicWidgetValues((prev) => ({ ...prev, [widgetId]: val }));
                          }}
                          placeholder={widget.placeholder || `Type ${label.toLowerCase()}...`}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  );
                }

                return null;
              };

              const isHalfWidth = (w: any) => {
                if (!w) return false;
                const widthVal = String(w.width || '').toLowerCase();
                return widthVal === '50' || widthVal === 'half' || w.id === 'room-type' || w.id === 'design-style';
              };

              const widgetRows: React.ReactNode[] = [];
              const widgetsList = activeDbTool.widgets;
              let i = 0;

              while (i < widgetsList.length) {
                const current = widgetsList[i];
                const next = widgetsList[i + 1];

                if (isHalfWidth(current) && next && isHalfWidth(next)) {
                  widgetRows.push(
                    <div key={`row-${i}`} className="grid grid-cols-2 gap-3">
                      {renderWidgetSingle(current, i)}
                      {renderWidgetSingle(next, i + 1)}
                    </div>
                  );
                  i += 2;
                } else if (isHalfWidth(current)) {
                  widgetRows.push(
                    <div key={`row-${i}`} className="grid grid-cols-2 gap-3">
                      {renderWidgetSingle(current, i)}
                      <div />
                    </div>
                  );
                  i += 1;
                } else {
                  widgetRows.push(
                    <div key={`row-${i}`} className="w-full">
                      {renderWidgetSingle(current, i)}
                    </div>
                  );
                  i += 1;
                }
              }

              return <div className="space-y-4">{widgetRows}</div>;
            })()}

            {/* MODEL 01: FLOOR PLAN GENERATOR DEDICATED INPUT CARD */}
            {(activeSpace === 'floor-plans' || ['floor-plan-generator', '3d-floor-plan', 'floor-plan-maker'].includes(selectedToolId) || ['floor-plan-generator', '3d-floor-plan', 'floor-plan-maker'].includes(toolSlug || '')) && (
              <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200/90 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                      Model 01: 2D/3D Floor Plan Generator Parameters
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black uppercase">
                    {toolSlug === '3d-floor-plan' ? '3D Isometric' : '2D Blueprint'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bedrooms Stepper */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">Bedrooms Count</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBedroomsCount(num)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${bedroomsCount === num
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms Stepper */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">Bathrooms Count</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBathroomsCount(num)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${bathroomsCount === num
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Layout Style & Plot Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">Layout Style</label>
                    <CustomSelect
                      value={floorPlanStyle}
                      onChange={(val) => setFloorPlanStyle(val)}
                      options={[
                        { value: 'Modern Open-Concept', label: 'Modern Open-Concept' },
                        { value: 'Minimalist Split-Level', label: 'Minimalist Split-Level' },
                        { value: 'Luxury Villa Layout', label: 'Luxury Villa Layout' },
                        { value: 'Traditional Family Home', label: 'Traditional Family Home' },
                        { value: 'Executive Suite', label: 'Executive Suite' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">Plot Dimensions</label>
                    <input
                      type="text"
                      placeholder="e.g. 40ft x 60ft"
                      value={plotDimensions}
                      onChange={(e) => setPlotDimensions(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EXTERIOR FORM IN WHITE THEME (FALLBACK WHEN NO DB WIDGETS) */}
            {(!activeDbTool || !activeDbTool.widgets || activeDbTool.widgets.length === 0) && activeSpace === 'exteriors' && (
              <div className="space-y-4">
                {/* Building Type Dropdown (Required) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Building Type</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={buildingType}
                    onChange={(val) => setBuildingType(val)}
                    options={BUILDING_TYPES.map((bt) => ({ value: bt, label: bt }))}
                  />
                </div>

                {/* Roof Type Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Roof Type</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={roofType}
                    onChange={(val) => setRoofType(val)}
                    options={ROOF_TYPES.map((rt) => ({ value: rt, label: rt }))}
                  />
                </div>

                {/* Environment Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Environment</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={environment}
                    onChange={(val) => setEnvironment(val)}
                    options={ENVIRONMENTS.map((env) => ({ value: env, label: env }))}
                  />
                </div>

                {/* Time of Day Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Time of Day</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={timeOfDay}
                    onChange={(val) => setTimeOfDay(val)}
                    options={TIMES_OF_DAY.map((tod) => ({ value: tod, label: tod }))}
                  />
                </div>

                {/* House Angle Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>House Angle</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={houseAngle}
                    onChange={(val) => setHouseAngle(val)}
                    options={HOUSE_ANGLES.map((angle) => ({ value: angle, label: angle }))}
                  />
                </div>

                {/* Tool Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Tool</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={exteriorTool}
                    onChange={(val) => setExteriorTool(val)}
                    options={EXTERIOR_TOOLS.map((tool) => ({ value: tool, label: tool }))}
                  />
                </div>

                {/* Design Style Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Design Style</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={exteriorStyle}
                    onChange={(val) => setExteriorStyle(val)}
                    options={EXTERIOR_STYLES.map((style) => ({ value: style, label: style }))}
                  />
                </div>

                {/* AI Intervention Slider */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>AI Intervention</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>

                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={aiInterventionIndex}
                      onChange={(e) => setAiInterventionIndex(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      {INTERVENTION_LEVELS.map((lvl, idx) => (
                        <span
                          key={lvl}
                          className={aiInterventionIndex === idx ? 'text-purple-700 font-extrabold scale-105 transition-all' : ''}
                        >
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom AI Instructions Checkbox & Expandable Field */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCustomInstructions}
                      onChange={(e) => setShowCustomInstructions(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 font-heading">Custom AI Instructions</span>
                  </label>

                  <AnimatePresence>
                    {showCustomInstructions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <textarea
                          rows={3}
                          value={customAiInstructions}
                          onChange={(e) => setCustomAiInstructions(e.target.value)}
                          placeholder="e.g. A modern farmhouse facade with black window frames, timber accents and a metal roof."
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all resize-none shadow-2xs mt-1"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* GARDEN FORM IN WHITE THEME (FALLBACK WHEN NO DB WIDGETS) */}
            {(!activeDbTool || !activeDbTool.widgets || activeDbTool.widgets.length === 0) && activeSpace === 'gardens' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Landscape Category</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={gardenType}
                    onChange={(val) => setGardenType(val)}
                    options={GARDEN_TYPES.map((gt) => ({ value: gt, label: gt }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>Garden Style</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <CustomSelect
                    value={gardenStyle}
                    onChange={(val) => setGardenStyle(val)}
                    options={GARDEN_STYLES.map((gs) => ({ value: gs, label: gs }))}
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                    <span>AI Intervention</span>
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                  </label>
                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={aiInterventionIndex}
                      onChange={(e) => setAiInterventionIndex(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      {INTERVENTION_LEVELS.map((lvl, idx) => (
                        <span key={lvl} className={aiInterventionIndex === idx ? 'text-purple-700 font-extrabold' : ''}>
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTERIOR FORM IN WHITE THEME (FALLBACK WHEN NO DB WIDGETS) */}
            {(!activeDbTool || !activeDbTool.widgets || activeDbTool.widgets.length === 0) && activeSpace !== 'exteriors' && activeSpace !== 'gardens' && (
              <div className="space-y-4">
                {/* Room Type & Design Style */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Room Type
                    </label>
                    <CustomSelect
                      value={selectedRoomType}
                      onChange={(val) => setSelectedRoomType(val)}
                      options={ROOM_TYPES.map((type) => ({ value: type, label: type }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Design Style
                    </label>
                    <CustomSelect
                      value={selectedStyle}
                      onChange={(val) => setSelectedStyle(val)}
                      options={DESIGN_STYLES.map((style) => ({ value: style.name, label: style.name }))}
                    />
                  </div>
                </div>

                {/* COLOR PALETTE & LIGHTING ATMOSPHERE */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Color Palette
                    </label>
                    <CustomSelect
                      value={selectedPalette}
                      onChange={(val) => setSelectedPalette(val)}
                      options={COLOR_PALETTES.map((pal) => ({ value: pal.slug, label: pal.name }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Lighting Atmosphere
                    </label>
                    <CustomSelect
                      value={selectedLighting}
                      onChange={(val) => setSelectedLighting(val)}
                      options={LIGHTING_OPTIONS.map((light) => ({ value: light, label: light }))}
                    />
                  </div>
                </div>

                {/* FURNITURE & LAYOUT HANDLING */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading flex items-center justify-between">
                    <span>Furniture & Layout Handling</span>
                    <span className="text-[10px] text-slate-400 font-normal">Works for furnished & empty rooms</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {FURNITURE_HANDLING_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFurnitureHandling(opt.id)}
                        className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${furnitureHandling === opt.id
                            ? 'bg-purple-50 border-purple-600 text-purple-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BUDGET LEVEL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    Budget Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BUDGET_LEVELS.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => setSelectedBudget(b.slug)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${selectedBudget === b.slug
                            ? 'bg-purple-50 border-purple-600 text-purple-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SELECT SPECIFIC PRODUCTS (MULTI-SELECT UP TO 10 ITEMS) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-heading flex items-center gap-1.5">
                      <span>Select Specific Products / Furniture</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${selectedProducts.length >= 10
                          ? 'bg-rose-100 text-rose-700'
                          : selectedProducts.length > 0
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                        {selectedProducts.length} / 10 selected
                      </span>
                    </label>

                    {selectedProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProducts([])}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {['all', 'furniture', 'electronics', 'decoration', 'lighting', 'flooring', 'appliances', 'fixtures', 'plant'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProductCategoryFilter(cat)}
                        className={`py-1 px-2 text-[10px] font-bold rounded-lg capitalize whitespace-nowrap border transition-all ${productCategoryFilter === cat
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Products Grid Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50/80 rounded-xl border border-slate-200/90">
                    {SELECTABLE_PRODUCT_ITEMS.filter((item) => productCategoryFilter === 'all' || item.type === productCategoryFilter).map((item) => {
                      const isSelected = selectedProducts.includes(item.name);
                      const isDisabled = !isSelected && selectedProducts.length >= 10;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggleProductSelection(item.name)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all ${isSelected
                              ? 'bg-purple-600 border-purple-600 text-white shadow-2xs'
                              : isDisabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                        >
                          <span>{item.name}</span>
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {selectedProducts.length >= 10 && (
                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      ⚠️ Maximum limit of 10 products reached. Unselect an item to choose another.
                    </p>
                  )}
                </div>

                {/* ROOM SIZE */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    Room Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${selectedSize === size.id
                            ? 'bg-purple-50 border-purple-600 text-purple-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMMON CUSTOM REQUIREMENTS CHECKBOX & EXPANDABLE TEXTAREA AT THE END OF ALL FORMS */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCustomRequirements}
                  onChange={(e) => setShowCustomRequirements(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 font-heading">
                  Custom Requirements
                </span>
              </label>

              <AnimatePresence>
                {showCustomRequirements && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 pt-1"
                  >
                    <textarea
                      rows={3}
                      value={customRequirements}
                      onChange={(e) => setCustomRequirements(e.target.value)}
                      placeholder="Describe your specific needs, preferences, or constraints (e.g. Add warm wooden slat walls & cream sofa)..."
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all resize-none shadow-2xs"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* GENERATE ACTION BUTTON */}
          <button
            type="button"
            disabled={isGenerating || !uploadedImage}
            onClick={handleGenerate}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all cursor-pointer font-heading"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing AI Redesign (${Math.floor(generationElapsedSeconds / 60).toString().padStart(2, '0')}:${(generationElapsedSeconds % 60).toString().padStart(2, '0')})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="flex items-center gap-1.5">
                  <span>Generate AI Redesign (4</span>
                  <CreditTokenIcon size="xs" />
                  <span>)</span>
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FULL-WIDTH BOTTOM GALLERY FOR GENERATED AI RENDERS & RESOLUTION SPECS */}
      {generatedResult && (
        <div className="mt-10 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                  Full Width Delivery Gallery
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  High Resolution Output
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading">
                Generated Architectural Render Gallery & Output Specs
              </h3>
            </div>
            
            {/* RESOLUTION & PIXEL SPEC BADGE MATCHING MANUS SPEC */}
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-mono flex items-center gap-2.5 shadow-sm border border-slate-800 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>
                <strong className="text-purple-300 font-bold">8K UHD</strong> resolution <span className="text-slate-300 font-bold">(7680 × 4320)</span>, 16:9 ratio
              </span>
            </div>
          </div>

          {/* RENDER GALLERY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(generatedImagesList.length > 0 ? generatedImagesList : [generatedResult]).map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={imgUrl}
                  alt={`AI Render Variation ${idx + 1}`}
                  className="w-full h-[320px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end justify-between">
                  <div className="text-white text-xs space-y-0.5">
                    <div className="font-extrabold font-heading">AI Render Output #{idx + 1}</div>
                    <div className="text-[10px] text-slate-300 font-mono">8K UHD • 7680 × 4320 • 16:9</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGeneratedResult(imgUrl)}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      View Split
                    </button>
                    <a
                      href={imgUrl}
                      download={`redesign_render_${idx + 1}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GenerateStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3 text-slate-500">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading AI Studio...</span>
      </div>
    }>
      <GenerateStudioContent />
    </Suspense>
  );
}
