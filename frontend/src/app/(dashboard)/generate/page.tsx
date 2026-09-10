'use client';

import React, { useState, useEffect, Suspense } from 'react';
import WorkflowProgressStepper from '@/components/layout/WorkflowProgressStepper';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Plus,
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
  Star,
  Coins,
  Wallet,
  CreditCard,
  Maximize2,
  Eye,
  XCircle,
  Loader2,
} from 'lucide-react';
import { ROOM_TYPES, DESIGN_STYLES, COLOR_PALETTES, MOODS, BUDGET_LEVELS, BUILDING_TYPES, ROOF_TYPES, LIGHTING_OPTIONS, ENVIRONMENTS, TIMES_OF_DAY } from '@/constants';
import { projectService, ProjectData } from '@/services/project.service';
import { useToast } from '@/context/ToastContext';
import { CreditTokenIcon } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { triggerImageDownload } from '@/utils/download';
import { useTranslation } from '@/context/LanguageContext';

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

const SAMPLE_PREVIEW_PRESETS: Record<string, Array<{ title: string; style: string; roomType: string; image: string }>> = {
  interiors: [
    {
      title: 'Modern Minimalist Living',
      style: 'Modern',
      roomType: 'Living Room',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Scandinavian Airy Bedroom',
      style: 'Scandinavian',
      roomType: 'Bedroom',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Japandi Warm Wood Kitchen',
      style: 'Japandi',
      roomType: 'Kitchen',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Luxury Marble Bathroom',
      style: 'Luxury',
      roomType: 'Bathroom',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
    },
  ],
  exteriors: [
    {
      title: 'Modern Facade Villa',
      style: 'Modern',
      roomType: 'Villa',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Scandinavian Timber House',
      style: 'Scandinavian',
      roomType: 'House',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Contemporary Glass Facade',
      style: 'Contemporary',
      roomType: 'Office',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Luxury Modern Mansion',
      style: 'Luxury',
      roomType: 'Villa',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    },
  ],
  'floor-plans': [
    {
      title: '3D Isometric Apartment',
      style: 'Modern',
      roomType: 'Apartment',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: '2D Architectural Schematic',
      style: 'Minimalist',
      roomType: 'House',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Open-Concept Villa Plan',
      style: 'Luxury',
      roomType: 'Villa',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Duplex Layout CAD',
      style: 'Contemporary',
      roomType: 'House',
      image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=600&auto=format&fit=crop',
    },
  ],
  gardens: [
    {
      title: 'Zen Japanese Rock Garden',
      style: 'Japanese',
      roomType: 'Garden',
      image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Modern Patio & Deck',
      style: 'Modern',
      roomType: 'Patio',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Lush Tropical Backyard Oasis',
      style: 'Tropical',
      roomType: 'Backyard',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Mediterranean Stone Terrace',
      style: 'Mediterranean',
      roomType: 'Terrace',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c5163?q=80&w=600&auto=format&fit=crop',
    },
  ],
};

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

const CustomSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className = '' }) => {
  const { t } = useTranslation();
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

  const defaultPlaceholder = placeholder || 'Select option';
  const selectedItem = options.find((opt) => opt.value === value);
  const displayLabel = selectedItem ? selectedItem.label : value || defaultPlaceholder;

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
        className="w-full px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-500 focus:border-blue-600 rounded-[10px] text-xs font-bold text-slate-900 flex items-center justify-between transition-all cursor-pointer shadow-2xs group hover:bg-blue-50/20"
      >
        <span className="truncate text-left font-heading">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 backdrop-blur-md rounded-[10px] border border-blue-100 shadow-xl p-1.5 max-h-64 overflow-y-auto space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {showSearch && (
              <div className="sticky top-0 z-10 bg-white pb-1.5 pt-0.5 px-0.5 border-b border-slate-100 mb-1">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.common?.search || 'Search options...'}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-[10px] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-medium"
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
                {t.common?.search ? 'No matching options found' : 'No matching options found'}
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
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-[10px] flex items-center justify-between transition-all cursor-pointer font-heading ${
                      isSelected
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-primary font-semibold'
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

function GenerateStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const toolSlug = searchParams?.get('tool');

  const getLocalizedToolName = (toolId: string, defaultName: string) => {
    const map: Record<string, string | undefined> = {
      'floor-plan-generator': t.generate?.tools?.floorPlanGenerator,
      '3d-floor-plan': t.generate?.tools?.threeDFloorPlan,
      'floor-plan-maker': t.generate?.tools?.floorPlanMaker,
      'interior-design': t.generate?.tools?.interiorDesign,
      'ai-room-decorator': t.generate?.tools?.roomDecorator,
      'ai-room-cleaner': t.generate?.tools?.roomCleaner,
      'paint-color-visualizer': t.generate?.tools?.paintVisualizer,
      'style-transfer': t.generate?.tools?.styleTransfer,
      'change-room-light': t.generate?.tools?.changeRoomLight,
      'ai-wall-design': t.generate?.tools?.wallDesign,
      'exterior-design': t.generate?.tools?.exteriorDesign,
      'house-facade': t.generate?.tools?.houseFacade,
      'backyard-patio': t.generate?.tools?.backyardPatio,
      'landscape-design': t.generate?.tools?.landscapeDesign,
      'pool-design': t.generate?.tools?.poolDesign,
      'rooftop-terrace': t.generate?.tools?.rooftopTerrace,
    };
    return map[toolId] || defaultName;
  };

  const getLocalizedBadge = (badge: string) => {
    const bLower = badge.toLowerCase().trim();
    if (bLower.includes('top rated')) return t.generate?.topRated || badge;
    if (bLower.includes('popular')) return t.generate?.popular || badge;
    return badge;
  };

  const getLocalizedStyleName = (styleName: string) => {
    const cleanKey = styleName.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof t.styles;
    if (t.styles && t.styles[cleanKey] && (t.styles[cleanKey] as any).name) {
      return (t.styles[cleanKey] as any).name;
    }
    return styleName;
  };

  const getLocalizedFurnitureHandling = (optId: string, defaultLabel: string) => {
    if (optId === 'replace-all' && t.generate?.furnitureOptions?.replace) return t.generate.furnitureOptions.replace;
    if (optId === 'reuse' && t.generate?.furnitureOptions?.keep) return t.generate.furnitureOptions.keep;
    if (optId === 'empty' && t.generate?.furnitureOptions?.empty) return t.generate.furnitureOptions.empty;
    return defaultLabel;
  };

  const getLocalizedBudget = (slug: string, defaultName: string) => {
    if ((slug === 'budget' || slug === 'economy') && t.generate?.budgets?.budget) return t.generate.budgets.budget;
    if (slug === 'standard' && t.generate?.budgets?.standard) return t.generate.budgets.standard;
    if (slug === 'premium' && t.generate?.budgets?.premium) return t.generate.budgets.premium;
    if (slug === 'luxury' && t.generate?.budgets?.luxury) return t.generate.budgets.luxury;
    return defaultName;
  };

  const getLocalizedRoomSize = (id: string, defaultLabel: string) => {
    if (id === 'small' && t.generate?.sizes?.small) return t.generate.sizes.small;
    if (id === 'medium' && t.generate?.sizes?.medium) return t.generate.sizes.medium;
    if (id === 'large' && t.generate?.sizes?.large) return t.generate.sizes.large;
    if (id === 'xlarge' && t.generate?.sizes?.xlarge) return t.generate.sizes.xlarge;
    return defaultLabel;
  };

  const getLocalizedWidgetLabel = (rawLabel: string, widgetId: string): string => {
    const fl = t.generate?.formLabels;
    if (!fl) return rawLabel;

    const id = (widgetId || '').toLowerCase();
    const lower = (rawLabel || '').toLowerCase();

    if (id === 'bedrooms-count' || id === 'bedrooms' || lower.includes('bedroom count') || lower.includes('bedrooms count')) {
      return fl.bedroomsCount || rawLabel;
    }
    if (id === 'bathrooms-count' || id === 'bathrooms' || lower.includes('bathroom count') || lower.includes('bathrooms count')) {
      return fl.bathroomsCount || rawLabel;
    }
    if (id === 'layout-style' || id === 'floor-plan-style' || lower.includes('layout style')) {
      return fl.layoutStyle || rawLabel;
    }
    if (id === 'plot-dimensions' || lower.includes('plot dimension')) {
      return fl.plotDimensions || rawLabel;
    }
    if (id === 'flooring-materials' || lower.includes('flooring material')) {
      return fl.flooringMaterials || rawLabel;
    }
    if (id === 'perspective-view' || lower.includes('perspective view')) {
      return fl.perspectiveView || rawLabel;
    }
    if (id === 'kitchen-style' || lower.includes('kitchen style')) {
      return fl.kitchenStyle || rawLabel;
    }
    if (id === 'cabinet-color' || lower.includes('cabinet color')) {
      return fl.cabinetColor || rawLabel;
    }
    if (id === 'countertop-material' || lower.includes('countertop material')) {
      return fl.countertopMaterial || rawLabel;
    }
    if (id === 'appliance-finish' || lower.includes('appliance finish')) {
      return fl.applianceFinish || rawLabel;
    }
    if (id === 'bathroom-style' || lower.includes('bathroom theme')) {
      return fl.bathroomTheme || rawLabel;
    }
    if (id === 'tub-type' || lower.includes('bathtub selection') || lower.includes('bathtub')) {
      return fl.bathtubSelection || rawLabel;
    }
    if (id === 'fixtures-finish' || lower.includes('fixtures finish')) {
      return fl.fixturesFinish || rawLabel;
    }
    if (id === 'bedroom-style' || lower.includes('bedroom style')) {
      return fl.bedroomStyle || rawLabel;
    }
    if (id === 'bed-size' || lower.includes('bed size')) {
      return fl.bedSize || rawLabel;
    }
    if (id === 'color-theme' || lower.includes('bedding color')) {
      return fl.beddingColorTheme || rawLabel;
    }
    if (id === 'decor-mode' || lower.includes('decoration mode')) {
      return fl.decorationMode || rawLabel;
    }
    if (id === 'decor-accents' || lower.includes('decorative texture')) {
      return fl.decorativeTextures || rawLabel;
    }
    if (id === 'decor-items' || lower.includes('decor items to add')) {
      return fl.decorItemsToAdd || rawLabel;
    }
    if (id === 'clean-level' || lower.includes('declutter level')) {
      return fl.declutterLevel || rawLabel;
    }
    if (id === 'items-to-remove' || lower.includes('items to remove')) {
      return fl.itemsToRemove || rawLabel;
    }
    if (id === 'paint-color' || lower.includes('wall paint color')) {
      return fl.wallPaintColor || rawLabel;
    }
    if (id === 'paint-finish' || lower.includes('paint finish')) {
      return fl.paintFinish || rawLabel;
    }
    if (id === 'target-area' || lower.includes('target area')) {
      return fl.targetArea || rawLabel;
    }
    if (id === 'floor-material' || lower.includes('floor material')) {
      return fl.floorMaterial || rawLabel;
    }
    if (id === 'pattern' || lower.includes('layout pattern')) {
      return fl.layoutPattern || rawLabel;
    }
    if (id === 'style-reference' || lower.includes('style reference')) {
      return fl.uploadStyleReference || rawLabel;
    }
    if (id === 'blend-strength' || lower.includes('blend strength')) {
      return fl.styleBlendStrength || rawLabel;
    }
    if (id === 'sunlight' || lower.includes('sunlight') || lower.includes('time of day')) {
      return fl.timeOfDaySunlight || rawLabel;
    }
    if (id === 'temp' || lower.includes('color temperature')) {
      return fl.colorTemperature || rawLabel;
    }
    if (id === 'lamps' || lower.includes('artificial lamp') || lower.includes('lamp light')) {
      return fl.artificialLamps || rawLabel;
    }
    if (id === 'wall-treatment' || lower.includes('wall accent material')) {
      return fl.wallAccentMaterial || rawLabel;
    }
    if (id === 'accent-color' || lower.includes('accent trim color')) {
      return fl.accentTrimColor || rawLabel;
    }
    if (id === 'flooring' || lower.includes('flooring accent')) {
      return fl.flooring || rawLabel;
    }
    if (id === 'control-strength' || lower.includes('structure preservation')) {
      return fl.structurePreservation || rawLabel;
    }
    if (id === 'furniture-layout' || lower.includes('furniture')) {
      return t.generate?.furnitureLayoutHandling || rawLabel;
    }
    if (id === 'budget-level' || lower.includes('budget')) {
      return t.generate?.budgetLevel || rawLabel;
    }
    if (id === 'selected-products' || lower.includes('products')) {
      return t.generate?.selectProducts || rawLabel;
    }
    if (id === 'room-size' || lower.includes('room size')) {
      return t.generate?.roomSize || rawLabel;
    }

    return rawLabel;
  };

  const getLocalizedLayoutStyle = (style: string): string => {
    const ls = t.generate?.formLabels?.layoutStyles;
    if (!ls) return style;
    if (style === 'Modern Open-Concept') return ls.modernOpen || style;
    if (style === 'Minimalist Split-Level') return ls.splitLevel || style;
    if (style === 'Luxury Villa Layout') return ls.luxuryVilla || style;
    if (style === 'Traditional Family Home') return ls.traditionalFamily || style;
    if (style === 'Executive Suite') return ls.executiveSuite || style;
    return style;
  };

  const getLocalizedInterventionLevel = (lvl: string): string => {
    const il = t.generate?.formLabels?.interventionLevels;
    if (!il) return lvl;
    if (lvl === 'Very Low') return il.veryLow || lvl;
    if (lvl === 'Low') return il.low || lvl;
    if (lvl === 'Medium') return il.medium || lvl;
    if (lvl === 'Extreme') return il.extreme || lvl;
    return lvl;
  };

  // React State Hooks
  const [activeSpace, setActiveSpace] = useState<'floor-plans' | 'interiors' | 'exteriors' | 'gardens'>('interiors');
  const [selectedToolId, setSelectedToolId] = useState<string>(toolSlug || 'interior-design');
  const [isToolPickerOpen, setIsToolPickerOpen] = useState<boolean>(false);

  // Credit Highlight state when redirected from bonus offer modal
  const [isCreditHighlighted, setIsCreditHighlighted] = useState<boolean>(false);

  useEffect(() => {
    const highlightParam = searchParams?.get('highlightCredits');
    if (highlightParam === 'true') {
      setIsCreditHighlighted(true);
      const timer = setTimeout(() => {
        setIsCreditHighlighted(false);
      }, 6000);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('highlightCredits');
        window.history.replaceState({}, '', url.pathname + url.search);
      }

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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

  // Private Rating & Review Feedback State
  const [userStarRating, setUserStarRating] = useState<number>(5);
  const [hasSubmittedRating, setHasSubmittedRating] = useState<boolean>(false);

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
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('contain');
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Execution panel states
  const [isCreditChecking, setIsCreditChecking] = useState<boolean>(false);
  const [creditBlocked, setCreditBlocked] = useState<boolean>(false);
  const [creditRequired, setCreditRequired] = useState<number>(4);
  const [userCurrentCredits, setUserCurrentCredits] = useState<number>(0);
  const [highlightCredits, setHighlightCredits] = useState<boolean>(false);
  const [generationDurationSeconds, setGenerationDurationSeconds] = useState<number>(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    direction: false,
    source: false,
    generate: true,
    review: false,
  });

  // Projects state
  const [projectsList, setProjectsList] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectTheme, setNewProjectTheme] = useState<string>('Modern');
  const [newProjectDescription, setNewProjectDescription] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);

  // Upload & Generation state
  const [isUserUploaded, setIsUserUploaded] = useState<boolean>(false);
  const [dbTools, setDbTools] = useState<any[]>(DEFAULT_TOOLS_CONFIG);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [demoAfterResult, setDemoAfterResult] = useState<string | null>(null);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dynamicWidgetValues, setDynamicWidgetValues] = useState<Record<string, any>>({});
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [studioFitMode, setStudioFitMode] = useState<'contain' | 'cover'>('contain');
  const [studioAspectRatio, setStudioAspectRatio] = useState<number | null>(null);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // React Refs
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isMouseDownRef = React.useRef<boolean>(false);
  const startXRef = React.useRef<number>(0);
  const scrollLeftRef = React.useRef<number>(0);
  const sliderContainerRef = React.useRef<HTMLDivElement | null>(null);
  const toolPickerRef = React.useRef<HTMLDivElement>(null);

  // Close tool picker popover when clicking outside
  useEffect(() => {
    if (!isToolPickerOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (toolPickerRef.current && !toolPickerRef.current.contains(e.target as Node)) {
        setIsToolPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isToolPickerOpen]);

  // Preload image aspect ratio safely inside useEffect instead of render body side-effect
  useEffect(() => {
    const currToolConfig = ALL_STUDIO_TOOLS.find((t) => t.id === selectedToolId) || ALL_STUDIO_TOOLS[3];
    const currDbTool = dbTools.find((t: any) => {
      if (!t) return false;
      const tSlug = (t.slug || t.id || '').toLowerCase();
      const targetSlug = (selectedToolId || toolSlug || 'interior-design').toLowerCase();
      return (
        tSlug === targetSlug ||
        t._id === targetSlug ||
        tSlug.replace(/-/g, '') === targetSlug.replace(/-/g, '')
      );
    });

    const sampleBeforeImg = currDbTool?.demoBeforeImage || currToolConfig?.demoBeforeImage ||
      (activeSpace === 'exteriors'
        ? 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop'
        : activeSpace === 'gardens'
        ? 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=1200&auto=format&fit=crop'
        : activeSpace === 'floor-plans'
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop');

    const sampleAfterImg = currDbTool?.demoAfterImage || currToolConfig?.demoAfterImage ||
      (activeSpace === 'exteriors'
        ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop'
        : activeSpace === 'gardens'
        ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200&auto=format&fit=crop'
        : activeSpace === 'floor-plans'
        ? 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop');

    const displayBefore = uploadedImage || sampleBeforeImg;
    const displayAfter = generatedResult || (uploadedImage ? null : sampleAfterImg);
    const activeSrc = displayAfter || displayBefore;

    if (!activeSrc) return;

    let isMounted = true;
    const img = new Image();
    img.src = activeSrc;
    img.onload = () => {
      if (isMounted && img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
        const ratio = img.naturalWidth / img.naturalHeight;
        setStudioAspectRatio(ratio);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [uploadedImage, generatedResult, activeSpace, selectedToolId, dbTools, toolSlug]);



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

  // Pre-fill studio form fields & pre-load photo when coming from "Try This Style in Studio" or "View Generation Details"
  useEffect(() => {
    const qpRoomType = searchParams?.get('roomType');
    const qpStyle = searchParams?.get('style');
    const qpPresetImage = searchParams?.get('presetImage');
    const qpGeneratedImage = searchParams?.get('generatedImage');
    const qpDesc = searchParams?.get('desc');

    if (qpRoomType) {
      setSelectedRoomType(qpRoomType);
    }
    if (qpStyle) {
      setSelectedStyle(qpStyle);
      setExteriorStyle(qpStyle);
      setGardenStyle(qpStyle);
    }
    if (qpPresetImage) {
      setUploadedImage(qpPresetImage);
      setIsUserUploaded(true);
    }
    if (qpGeneratedImage) {
      setGeneratedResult(qpGeneratedImage);
      setGeneratedImagesList([qpGeneratedImage]);
      setShowTechnicalDetails(true);
      if (!qpPresetImage) {
        setUploadedImage(qpGeneratedImage);
      }
    }
    if (qpDesc) {
      setCustomRequirements(qpDesc);
      setShowCustomRequirements(true);
      setCompiledPrompt(qpDesc);
    }
  }, [searchParams]);



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

  const handleSendRatingFeedback = async () => {
    setHasSubmittedRating(true);
    toast.success(
      'Thank you! Your feedback helps us continuously improve AI model quality. Your data remains 100% private.',
      'Rating Submitted!',
    );
  };

  const toggleProductSelection = (productName: string) => {
    if (selectedProducts.includes(productName)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== productName));
    } else {
      if (selectedProducts.length >= 10) return; // Limit to 10 products
      setSelectedProducts([...selectedProducts, productName]);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name.', 'Required Field');
      return;
    }
    try {
      setIsCreatingProject(true);
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
        : '';

      const newProject = await projectService.createProject({
        name: newProjectName.trim(),
        theme: newProjectTheme,
        description: newProjectDescription.trim(),
      }, token);

      if (newProject) {
        const pId = newProject._id || newProject.id || '';
        setProjectsList((prev) => [newProject, ...prev]);
        setSelectedProjectId(pId);
        toast.success(`🎉 Project "${newProject.name}" created and selected!`, 'Project Created');
        setIsCreateProjectModalOpen(false);
        setNewProjectName('');
        setNewProjectDescription('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project', 'Project Creation Failed');
    } finally {
      setIsCreatingProject(false);
    }
  };

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

    // 1. Convert Unsplash photo webpage URLs (e.g. https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-large-window-OtXADkUh3-I)
    const unsplashMatch = cleanUrl.match(/unsplash\.com\/photos\/([^?#]+)/i);
    if (unsplashMatch && unsplashMatch[1]) {
      const rawPath = unsplashMatch[1].replace(/\/$/, '');
      if (rawPath.startsWith('photo-')) {
        return `https://images.unsplash.com/${rawPath}?q=80&w=1200&auto=format&fit=crop`;
      }

      let photoId = rawPath;
      const lastPart = rawPath.split('/').pop() || rawPath;
      if (lastPart.includes('-')) {
        const subParts = lastPart.split('-');
        // If the last subpart is a short code (like 'I' in 'OtXADkUh3-I'), combine the last 2 subparts
        if (subParts.length >= 2 && subParts[subParts.length - 1].length <= 3) {
          photoId = `${subParts[subParts.length - 2]}-${subParts[subParts.length - 1]}`;
        } else {
          photoId = subParts[subParts.length - 1];
        }
      } else {
        photoId = lastPart;
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

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('data:image/')) {
      toast.error('Please enter a valid URL starting with http:// or https://', 'Invalid URL Format');
      return;
    }

    // Instant client-side resolution for Unsplash / Pexels / direct image links
    const resolvedUrl = resolveDirectImageUrl(rawUrl);
    setUploadedImage(resolvedUrl);
    setGeneratedResult(null);
    setDemoAfterResult(null);
    setIsUserUploaded(true);
  };




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
    if (seconds < 15) return 'Initializing Redesign...';
    if (seconds < 60) return 'Rendering Architectural Space...';
    if (seconds < 180) return 'Refining Details & Lighting...';
    return 'Finalizing High-Res Render...';
  };



  useEffect(() => {
    const fetchProjects = async () => {
      const projs = await projectService.getProjects();
      setProjectsList(projs);

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const pid = params.get('projectId');
          if (pid) {
            setSelectedProjectId(pid);
            const found = projs.find((p) => String(p._id) === String(pid) || String(p.id) === String(pid));
            if (found && found.theme) {
              setSelectedStyle(found.theme);
              setExteriorStyle(found.theme);
              setGardenStyle(found.theme);
              if (found.colorPalette) setSelectedPalette(found.colorPalette);
              if (found.lighting) setSelectedLighting(found.lighting);
            }
          }
        }
    };
    const fetchDbTools = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await fetch(`${baseUrl}/uploads/tools`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setDbTools(json.data);
            return;
          }
        }
        const fallbackRes = await fetch(`${baseUrl}/ai-tools`);
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.data && Array.isArray(fallbackJson.data)) {
            setDbTools(fallbackJson.data);
          }
        }
      } catch (e) {
        console.warn('Could not fetch DB tools:', e);
      }
    };
    fetchProjects();
    fetchDbTools();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('highlightCredits') === 'true' || params.get('rewardUnlocked') === 'true') {
        setIsCreditHighlighted(true);
        setTimeout(() => setIsCreditHighlighted(false), 8000);
        // Clean URL state without reloading page
        try {
          const cleanUrl = window.location.pathname + (params.get('tool') ? `?tool=${params.get('tool')}` : '');
          window.history.replaceState({}, '', cleanUrl);
        } catch (e) {}
      }
    }

  // Fetch and sync user credits balance on mount so real credit count (e.g. 60) is loaded immediately
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed?.credits === 'number') {
            setUserCurrentCredits(parsed.credits);
          }
        }
      } catch (e) {}

      const syncUserCredits = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
          const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || '';
          if (token) {
            const res = await fetch(`${baseUrl}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              const freshCredits = data?.data?.user?.credits ?? data?.credits ?? data?.user?.credits;
              if (typeof freshCredits === 'number') {
                setUserCurrentCredits(freshCredits);
              }
            }
          }
        } catch (e) {}
      };
      syncUserCredits();
    }
  }, []);

  const handleSelectProject = (projId: string) => {
    if (projId === 'CREATE_NEW_PROJECT') {
      setIsCreateProjectModalOpen(true);
      return;
    }
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

  // Handle image upload input with resolution & clarity inspection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        
        // Inspect image resolution and dimensions
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          if (w < 450 || h < 450) {
            toast.info(
              `Uploaded image is ${w}×${h}px. Recommended resolution is 512×512px or higher for crisp 8K UHD architectural details. AI will automatically upscale and enhance pixel clarity while preserving original shape.`,
              'Low Resolution Photo Detected',
            );
          }
        };
        img.src = dataUrl;

        setUploadedImage(dataUrl);
        setGeneratedResult(null);
        setDemoAfterResult(null);
        setIsUserUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger AI Redesign Generation
  const handleGenerate = async () => {
    if (!uploadedImage || isGenerating || isCreditChecking) return;

    let currentUser: any = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {
      // Ignore parse error
    }

    if (!uploadedImage) {
      toast.error('Please upload a photo or fetch an image URL before starting AI redesign.', 'Photo Required');
      return;
    }

    // Step 0: Enforce strict validation for required widgets marked with red asterisk (*)
    if (activeDbTool && Array.isArray(activeDbTool.widgets) && activeDbTool.widgets.length > 0) {
      for (const widget of activeDbTool.widgets) {
        if (widget && widget.required) {
          const widgetId = widget.id || '';
          const label = widget.label || widget.id || 'Field';
          let val = dynamicWidgetValues[widgetId];

          // Fallbacks for well-known mapped standard keys
          if (val === undefined || val === null || val === '') {
            if (widgetId === 'room-type') val = selectedRoomType;
            else if (widgetId === 'design-style') val = selectedStyle;
            else if (widgetId === 'color-palette') val = selectedPalette;
            else if (widgetId === 'lighting-atmosphere' || widgetId === 'lighting-mood') val = selectedLighting;
            else if (widgetId === 'budget-level') val = selectedBudget;
            else if (widgetId === 'furniture-layout') val = furnitureHandling;
            else if (widgetId === 'room-size') val = selectedSize;
            else if (widgetId === 'selected-products') val = selectedProducts;
          }

          let isMissing = false;
          if (val === undefined || val === null) {
            isMissing = true;
          } else if (Array.isArray(val)) {
            isMissing = val.length === 0;
          } else if (typeof val === 'string') {
            isMissing = val.trim().length === 0;
          }

          if (isMissing) {
            toast.error(
              `"${label}" is a required field (*). Please select or enter a value before proceeding.`,
              'Required Field Missing',
            );
            return; // STOP! Block submission when required field is empty
          }
        }
      }
    }

    const reqCredits = 4;
    setCreditRequired(reqCredits);

    // Initialize states
    setIsGenerating(true);
    setIsCreditChecking(true);
    setCreditBlocked(false);
    setGenerationError(null);
    setGeneratedResult(null);

    // Step 1: Perform explicit Site Credit Validation BEFORE dispatching provider request
    let currentBalance = currentUser?.credits ?? 0;
    try {
      const baseUrl = getApiBaseUrl();
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
        : '';

      if (token && (currentUser?._id || currentUser?.id)) {
        const userRes = await fetch(`${baseUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const freshCredits = userData?.data?.user?.credits ?? userData?.credits ?? userData?.user?.credits;
          if (typeof freshCredits === 'number') {
            currentBalance = freshCredits;
            if (currentUser) {
              currentUser.credits = currentBalance;
              localStorage.setItem('user', JSON.stringify(currentUser));
            }
          }
        }
      }
    } catch (e) {
      // Fallback to local storage balance
    }

    setUserCurrentCredits(currentBalance);
    setIsCreditChecking(false);

    // CRITICAL REQUIREMENT: Stop immediately if user does not have enough site credits
    if (currentBalance < reqCredits) {
      setCreditBlocked(true);
      setIsGenerating(false);
      toast.error(
        `You need ${reqCredits} credits to generate this render. You currently have ${currentBalance} credits. Generation request was blocked.`,
        'Insufficient Site Credits',
      );
      return; // STOP EXECUTION! DO NOT SEND GENERATION REQUEST!
    }

    // Step 2: User has sufficient site credits! Proceed to backend room redesign call
    const currentSlug = toolSlug || selectedToolId || (activeSpace === 'floor-plans' ? 'floor-plan-generator' : activeSpace === 'exteriors' ? 'exterior-design' : activeSpace === 'gardens' ? 'landscape-design' : 'interior-design');

    // Resolve Custom Requirements / Custom AI Instructions
    const currentCustomInput = (
      (showCustomRequirements && customRequirements.trim()) ||
      (showCustomInstructions && customAiInstructions.trim()) ||
      ''
    );

    const bodyPayload = {
      originalImage: uploadedImage,
      toolSlug: currentSlug,
      userId: currentUser?._id || currentUser?.id || undefined,
      creditsCost: reqCredits,
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
      projectId: selectedProjectId || undefined,
      projectName: projectsList.find((p) => (p._id || p.id) === selectedProjectId)?.name || undefined,
      customInstructions: currentCustomInput,
      customRequirements: currentCustomInput,
      userPrompt: currentCustomInput,
      dynamicWidgetValues,
    };

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes (600,000 ms) timeout limit

    try {
      const baseUrl = getApiBaseUrl();
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
        : '';

      const response = await fetch(`${baseUrl}/rooms/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = resData.message || resData.error || `Generation API failed with HTTP status ${response.status}`;

        if (response.status === 401 || errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('unauthorized')) {
          errorMsg = 'Your login session is invalid or expired. Please log out and log in again to generate redesigns.';
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('user-updated'));
          }
        }

        if (token) {
          try {
            const userRes = await fetch(`${baseUrl}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              const freshCredits = userData?.data?.user?.credits ?? userData?.credits ?? userData?.user?.credits;
              if (typeof freshCredits === 'number') {
                setUserCurrentCredits(freshCredits);
                if (currentUser) {
                  currentUser.credits = freshCredits;
                  localStorage.setItem('user', JSON.stringify(currentUser));
                  window.dispatchEvent(new Event('user-updated'));
                }
              }
            }
          } catch (e) {}
        }

        if (response.status === 400 && errorMsg.toLowerCase().includes('credit')) {
          setCreditBlocked(true);
        } else {
          setGenerationError(errorMsg);
        }

        toast.error(errorMsg, 'Generation Notice');
        setIsGenerating(false);
        return;
      }

      const elapsed = Math.round(((Date.now() - startTime) / 1000) * 10) / 10;
      setGenerationDurationSeconds(elapsed);

      const rawOutput = resData.generatedImage || resData.data?.generatedImage || resData.image || resData.url;

      const formatRenderUrl = (urlStr: any): string => {
        if (!urlStr || typeof urlStr !== 'string') return '';
        const clean = urlStr.trim();
        if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
          return clean;
        }
        if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
          const apiOrigin = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
          const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
          return `${apiOrigin}${cleanPath}`;
        }
        return clean;
      };

      const output = formatRenderUrl(rawOutput);

      const isValidImageOutput = output &&
        typeof output === 'string' &&
        (output.startsWith('http://') || output.startsWith('https://') || output.startsWith('data:image/')) &&
        !output.includes('manus.ai/share/') &&
        !output.includes('manus.ai/task/') &&
        !output.includes('/tasks/');

      if (isValidImageOutput) {
        const rawImgs = resData.generatedImages || resData.images || resData.data?.generatedImages || [rawOutput];
        const allImgs = (Array.isArray(rawImgs) ? rawImgs : [rawOutput]).map((u) => formatRenderUrl(u)).filter(Boolean);

        setGeneratedResult(output);
        setGeneratedImagesList(allImgs.length > 0 ? allImgs : [output]);
        setCompiledPrompt(resData.prompt || resData.data?.prompt || '');
        if (typeof resData.remainingCredits === 'number') {
          setUserCurrentCredits(resData.remainingCredits);
          if (currentUser) {
            currentUser.credits = resData.remainingCredits;
            localStorage.setItem('user', JSON.stringify(currentUser));
            window.dispatchEvent(new Event('user-updated'));
          }
        }

        toast.success(
          `Your redesign render has been generated successfully (${elapsed}s)!`,
          'AI Transformation Complete',
        );

        // Save generated image to local storage user_generated_designs for My Designs showcase
        try {
          const newDesignItem = {
            _id: resData.roomId || resData._id || `gen-${Date.now()}`,
            title: `${selectedRoomType || 'Room'} ${selectedStyle || 'AI'} Redesign`,
            description: `${selectedStyle || 'Modern'} architectural transformation for ${selectedRoomType || 'space'}`,
            price: 0,
            toolSlug: currentSlug,
            totalImageCount: 1,
            roomType: selectedRoomType || 'Living Room',
            style: selectedStyle || 'Modern',
            sampleImageUrl: output,
            beforeImageUrl: uploadedImage,
            createdAt: new Date().toISOString(),
          };
          const existing = JSON.parse(localStorage.getItem('user_generated_designs') || '[]');
          localStorage.setItem('user_generated_designs', JSON.stringify([newDesignItem, ...existing]));
        } catch (e) {
          console.warn('Failed to save design locally:', e);
        }

        // Update local storage user credits & dispatch event
        if (currentUser) {
          const remaining = resData.remainingCredits ?? resData.data?.remainingCredits ?? (currentUser.credits !== undefined ? Math.max(0, currentUser.credits - reqCredits) : 0);
          const updatedUser = { ...currentUser, credits: remaining };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('user-updated'));
        }
      } else {
        const failureMsg = resData.error || resData.message || 'AI generation task finished but no valid output image was generated.';
        setGenerationError(failureMsg);
        toast.error(failureMsg, 'Generation Result Missing');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' || controller.signal.aborted) {
        setGenerationError('Generation request timed out after waiting 10 minutes for Manus AI to complete.');
        toast.error('The 10-minute generation window expired. Please try again.', 'Generation Timeout');
      } else {
        setGenerationError(err.message || 'We couldn\'t complete the room render because the network request failed.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // SINGLE COMMON BACKGROUND CARD BOX WRAPPING ENTIRE STUDIO
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 shadow-2xs">
      {/* SLEEK COMPACT TOOL HEADER BAR (TOOL INFO ON LEFT, SWITCH TOOL + SPACE TABS ON RIGHT) */}
      <div className="relative z-30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 shadow-2xs">
        {/* LEFT SIDE: Active Tool Icon, Title & Description */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ActiveToolIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-heading truncate">
                {getLocalizedToolName(activeToolConfig.id, activeDbTool?.name || activeToolConfig.name)}
              </h2>
              {(() => {
                const badgeToDisplay = activeDbTool && typeof activeDbTool.badge === 'string'
                  ? activeDbTool.badge.trim()
                  : (activeToolConfig.badge || '').trim();

                if (!badgeToDisplay) return null;

                return (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 shrink-0">
                    {getLocalizedBadge(badgeToDisplay)}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Unified Studio Controls (Space Category Tabs + Switch Tool Button Side-by-Side) */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs shrink-0 relative overflow-visible">
          {/* Space Category Filter Pills */}
          <div className="flex items-center gap-1 min-w-max overflow-x-auto [scrollbar-width:none]">
            {(
              [
                { id: 'interiors', label: t.generate?.interiors || 'Interiors' },
                { id: 'exteriors', label: t.generate?.exteriors || 'Exteriors' },
                { id: 'floor-plans', label: t.generate?.floorPlans || 'Floor Plans' },
                { id: 'gardens', label: t.generate?.gardens || 'Gardens' },
              ] as const
            ).map((space) => {
              const isSpaceActive = activeSpace === space.id;
              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => {
                    handleSelectSpace(space.id);
                    setIsToolPickerOpen(false);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap shrink-0 ${
                    isSpaceActive
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {space.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700/80 mx-0.5 shrink-0" />

          {/* Switch Tool Button */}
          <div className="relative shrink-0 z-50" ref={toolPickerRef}>
            <button
              type="button"
              onClick={() => setIsToolPickerOpen(!isToolPickerOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary text-[11px] sm:text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap shrink-0"
            >
              <Wand2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="whitespace-nowrap">{t.generate?.switchTool || 'Switch Tool'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isToolPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Tool Switcher Popover Menu */}
            <AnimatePresence>
              {isToolPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 max-h-96 overflow-y-auto"
                >
                  <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-heading">
                      {activeSpace === 'interiors' ? (t.generate?.interiors || 'Interiors') :
                       activeSpace === 'exteriors' ? (t.generate?.exteriors || 'Exteriors') :
                       activeSpace === 'floor-plans' ? (t.generate?.floorPlans || 'Floor Plans') :
                       (t.generate?.gardens || 'Gardens')} ({ALL_STUDIO_TOOLS.filter((t) => t.category === activeSpace).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsToolPickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    {ALL_STUDIO_TOOLS.filter((t) => t.category === activeSpace).map((tItem) => {
                      const ToolIcon = tItem.icon;
                      const isSelected = selectedToolId === tItem.id;
                      const matchingDbTool = dbTools.find((d: any) => {
                        const dSlug = (d?.slug || d?.id || '').toLowerCase();
                        const tSlug = (tItem.id || '').toLowerCase();
                        return dSlug === tSlug || dSlug.replace(/-/g, '') === tSlug.replace(/-/g, '');
                      });
                      const displayBadge = matchingDbTool && typeof matchingDbTool.badge === 'string'
                        ? matchingDbTool.badge.trim()
                        : (tItem.badge || '').trim();
                      const displayName = getLocalizedToolName(tItem.id, matchingDbTool?.name || tItem.name);

                      return (
                        <button
                          key={tItem.id}
                          type="button"
                          onClick={() => {
                            handleSelectTool(tItem.id);
                            setIsToolPickerOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-heading ${
                            isSelected
                              ? 'bg-primary text-white shadow-2xs font-extrabold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                          }`}
                        >
                          <ToolIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`} />
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <span className="text-xs truncate font-bold">{displayName}</span>
                            {displayBadge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider shrink-0 ml-auto ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {getLocalizedBadge(displayBadge)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MAIN STUDIO TWO-COLUMN LAYOUT (INSIDE SINGLE COMMON BACKGROUND) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">

        {/* LEFT COLUMN: AI Render Interactive Viewer */}
        <div className="lg:col-span-7 space-y-5">

          {/* BONUS CREDITS HIGHLIGHT ANNOUNCEMENT BANNER */}
          {highlightCredits && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-indigo-600/20 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse flex items-center justify-between gap-3 text-slate-900 dark:text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <Coins className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider font-heading text-amber-600 dark:text-amber-300">
                    🎁 Bonus Offer Credits Active!
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Your newly added credits ({userCurrentCredits} total) are available to generate high-resolution AI renders now!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHighlightCredits(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* GENERATION ERROR ALERT BANNER */}
          {generationError && (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2 shadow-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider font-heading text-amber-900 dark:text-amber-100">
                    Generation Status Notice
                  </h4>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    {generationError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (generationError?.toLowerCase().includes('log in') || generationError?.toLowerCase().includes('token')) {
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.dispatchEvent(new Event('user-updated'));
                          window.location.href = '/';
                        }
                      } else {
                        setGenerationError(null);
                        handleGenerate();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-extrabold shadow-xs hover:bg-amber-700 transition-colors mt-1 cursor-pointer font-heading"
                  >
                    <Sparkles className="w-3 h-3" />
                    {generationError?.toLowerCase().includes('log in') || generationError?.toLowerCase().includes('token')
                      ? 'Log Out & Reset Session'
                      : 'Retry Generation'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGenerationError(null)}
                className="text-amber-500 hover:text-amber-800 dark:hover:text-amber-100 text-xs font-bold p-1 cursor-pointer"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400 font-heading">
                    {t.generate?.studioComparisonView || 'Studio Comparison View'}
                  </span>
                  {generatedResult && (
                    <button
                      type="button"
                      onClick={() => triggerImageDownload(generatedResult, 'redesign_render.png')}
                      title="Download HD Image"
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-heading"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.generate?.downloadRender || 'Download Render'}</span>
                    </button>
                  )}
                </div>

                <div
                  ref={sliderContainerRef}
                  className={`relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 select-none shadow-md group flex items-center justify-center transition-all duration-300 ${
                    studioFitMode === 'cover'
                      ? 'h-[460px] sm:h-[560px] md:h-[600px]'
                      : 'min-h-[460px] sm:min-h-[520px] md:min-h-[560px] max-h-[75vh]'
                  }`}
                  style={
                    studioFitMode === 'contain'
                      ? {
                          aspectRatio: studioAspectRatio ? `${studioAspectRatio}` : '4/3',
                        }
                      : undefined
                  }
                >
                  {/* RIGHT SIDE: AI REDESIGN IMAGE OR ACTIVE LOADER OR CLEAN CANVAS */}
                  {displayAfter ? (
                    <img
                      src={displayAfter}
                      alt="AI Redesign"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-200"
                    />
                  ) : isGenerating ? (
                    <div className="absolute inset-0 bg-slate-950/90 text-white flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                        <Sparkles className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <span className="text-xs font-black font-heading text-purple-300 tracking-wide uppercase">Manus AI Active Redesign</span>
                      <span className="text-xs text-slate-300 mt-1.5 font-medium max-w-sm">
                        {getGenerationProgressStatus(generationElapsedSeconds)}
                      </span>
                      <span className="text-[11px] font-mono text-purple-400 mt-2.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/80 shadow-md">
                        ⏱️ {Math.floor(generationElapsedSeconds / 60)}m {generationElapsedSeconds % 60}s / 10m max window
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100/80 dark:bg-purple-950/80 flex items-center justify-center mb-2.5 shadow-2xs border border-purple-200/60 dark:border-purple-800/60">
                        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white font-heading tracking-wide uppercase">
                        {t.generate?.aiTransformationArea || 'AI Transformation Area'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xs">
                        {t.generate?.configureOptionsHint || 'Configure options on the right & click Generate to transform your space'}
                      </span>
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
                      className="absolute top-0 left-0 h-full max-w-none transition-all duration-200 object-cover"
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
                  {uploadedImage
                    ? (t.generate?.beforeUpload || 'Before (Your Upload)')
                    : (t.generate?.beforeSample || 'Before (Sample)')}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white font-extrabold text-[11px] rounded-lg shadow-md pointer-events-none flex items-center gap-1 z-10 max-w-[220px]">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
                  <span className="truncate">
                    {generatedResult
                      ? (t.generate?.afterStyle
                          ? t.generate.afterStyle.replace('{style}', getLocalizedStyleName(selectedStyle))
                          : `After (${getLocalizedStyleName(selectedStyle)} AI)`)
                      : uploadedImage
                      ? (t.generate?.readyToRedesign || 'Ready to Redesign')
                      : (t.generate?.samplePrefix
                          ? t.generate.samplePrefix.replace('{tool}', getLocalizedToolName(activeToolConfig.id, activeToolConfig.name))
                          : `Sample ${getLocalizedToolName(activeToolConfig.id, activeToolConfig.name)}`)}
                  </span>
                </div>

                {isDemoSample && (
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md text-white/90 rounded-xl text-[11px] font-bold z-20 border border-white/10">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {t.generate?.samplePreviewFor
                        ? t.generate.samplePreviewFor.replace('{tool}', getLocalizedToolName(activeToolConfig.id, activeToolConfig.name))
                        : `Sample Preview for ${getLocalizedToolName(activeToolConfig.id, activeToolConfig.name)}`}
                    </span>
                  </div>
                )}
                </div>
              </div>
            );
          })()}

          {/* 4 PRESET SAMPLE PREVIEW CARDS GALLERY (POPULATES EMPTY LEFT COLUMN SPACE BEFORE GENERATION) */}
          {!generatedResult && !isGenerating && (
            <div className="p-4 rounded-[10px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-heading">
                    {t.generate?.sampleInspirationPresets
                      ? t.generate.sampleInspirationPresets.replace('{tool}', getLocalizedToolName(activeToolConfig.id, activeToolConfig.name))
                      : `${getLocalizedToolName(activeToolConfig.id, activeToolConfig.name)} Sample Inspiration Presets`}
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {t.generate?.clickSampleToTest || 'Click any sample to test instantly'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SAMPLE_PREVIEW_PRESETS[activeSpace]?.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setUploadedImage(preset.image);
                      setIsUserUploaded(true);
                      setSelectedStyle(preset.style);
                      setSelectedRoomType(preset.roomType);
                      setGeneratedResult(null);
                      toast.success(`Loaded "${preset.title}" sample photo! Customize parameters on the right & click Generate.`, 'Sample Preset Loaded');
                    }}
                    className="group relative rounded-[10px] overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 aspect-[4/3] cursor-pointer hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20 shadow-2xs hover:shadow-md transition-all duration-200"
                  >
                    <img
                      src={preset.image}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-end">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/20 text-white backdrop-blur-xs">
                          {getLocalizedStyleName(preset.style)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white leading-tight font-heading truncate">
                          {preset.title}
                        </h4>
                        <p className="text-[9px] text-purple-300 font-bold mt-0.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>{t.generate?.useSample || 'Use Sample'}</span> →
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BRIGHT MODERN SAAS EXECUTION & ACTIVITY PANEL */}
          {(isGenerating || generatedResult || compiledPrompt || generationError || creditBlocked || isCreditChecking) && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-300">
              
              {/* HEADER WITH STATUS BADGE */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-100 dark:border-purple-900/50">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>AI Architectural Workflow</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Transformation workflow &amp; design specification
                    </p>
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="flex items-center gap-2 shrink-0">
                  {isCreditChecking ? (
                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Checking Credits...</span>
                    </div>
                  ) : creditBlocked ? (
                    <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Generation Blocked</span>
                    </div>
                  ) : isGenerating ? (
                    <div className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-extrabold flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 animate-pulse">
                      <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Processing Redesign...</span>
                    </div>
                  ) : generatedResult ? (
                    <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Completed · {generationDurationSeconds || '14.2'}s</span>
                    </div>
                  ) : generationError ? (
                    <div className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Generation Interrupted</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-extrabold border border-slate-200 dark:border-slate-700">
                      <span>Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WORKFLOW STEPS LIST */}
              <div className="space-y-3">
                {(() => {
                  const steps = [
                    {
                      id: 'direction',
                      num: 1,
                      title: 'Style & Direction',
                      subtitle: 'Setting redesign parameters',
                    },
                    {
                      id: 'source',
                      num: 2,
                      title: 'Structure & Composition',
                      subtitle: 'Preserving room geometry',
                    },
                    {
                      id: 'generate',
                      num: 3,
                      title: 'AI Architectural Render',
                      subtitle: 'Synthesizing high-res redesign',
                    },
                    {
                      id: 'review',
                      num: 4,
                      title: 'Quality Check',
                      subtitle: 'Verifying render consistency',
                    },
                  ];

                  return steps.map((step, idx) => {
                    let status: 'pending' | 'running' | 'completed' | 'failed' | 'credit_blocked' = 'pending';

                    if (generatedResult) {
                      status = 'completed';
                    } else if (isGenerating) {
                      if (generationElapsedSeconds < 5) {
                        if (idx === 0) status = 'running';
                        else status = 'pending';
                      } else if (generationElapsedSeconds < 15) {
                        if (idx === 0) status = 'completed';
                        else if (idx === 1) status = 'running';
                        else status = 'pending';
                      } else if (generationElapsedSeconds < 90) {
                        if (idx < 2) status = 'completed';
                        else if (idx === 2) status = 'running';
                        else status = 'pending';
                      } else {
                        if (idx < 3) status = 'completed';
                        else if (idx === 3) status = 'running';
                        else status = 'pending';
                      }
                    } else if (creditBlocked && idx === 2) {
                      status = 'credit_blocked';
                    } else if (creditBlocked && idx < 2) {
                      status = 'completed';
                    } else if (generationError) {
                      if (idx === 2) status = 'failed';
                      else if (idx < 2) status = 'completed';
                      else status = 'pending';
                    }

                    const isExpanded = expandedSteps[step.id] ?? (status === 'running' || status === 'credit_blocked' || status === 'failed');

                    const toggleExpand = () => {
                      setExpandedSteps((prev) => ({ ...prev, [step.id]: !isExpanded }));
                    };

                    return (
                      <div
                        key={step.id}
                        className={`rounded-xl border transition-all duration-200 ${
                          status === 'running'
                            ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/80 shadow-2xs'
                            : status === 'credit_blocked'
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                              : status === 'failed'
                                ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                                : status === 'completed'
                                  ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800'
                                  : 'bg-slate-50/30 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/40 opacity-75'
                        }`}
                      >
                        {/* STEP ROW HEADER */}
                        <div
                          onClick={toggleExpand}
                          className="flex items-center justify-between p-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* STEP ICON */}
                            <div className="shrink-0">
                              {status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                              ) : status === 'running' ? (
                                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                              ) : status === 'credit_blocked' ? (
                                <Coins className="w-5 h-5 text-amber-500" />
                              ) : status === 'failed' ? (
                                <XCircle className="w-5 h-5 text-rose-500 fill-rose-50" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                  {step.num}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className={`text-xs font-bold font-heading truncate ${
                                status === 'running'
                                  ? 'text-purple-900 dark:text-purple-200'
                                  : status === 'credit_blocked'
                                    ? 'text-amber-900 dark:text-amber-200'
                                    : status === 'failed'
                                      ? 'text-rose-900 dark:text-rose-200'
                                      : status === 'completed'
                                        ? 'text-slate-800 dark:text-slate-200'
                                        : 'text-slate-600 dark:text-slate-400'
                              }`}>
                                {step.num}. {step.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate font-medium">
                                {status === 'completed'
                                  ? 'Completed'
                                  : status === 'running'
                                    ? 'Generating your redesigned room...'
                                    : status === 'credit_blocked'
                                      ? 'Not enough site credits'
                                      : status === 'failed'
                                        ? 'Generation interrupted'
                                        : 'Waiting'}
                              </p>
                            </div>
                          </div>

                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        {/* STEP EXPANDED BODY */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-3 pb-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2 text-xs"
                            >
                              {/* STEP 1 DETAILS */}
                              {idx === 0 && (
                                <div className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Selected {selectedStyle} theme direction locked</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{selectedPalette || 'Warm beige'} palette &amp; {selectedLighting || 'Natural'} lighting configured</span>
                                  </div>
                                </div>
                              )}

                              {/* STEP 2 DETAILS */}
                              {idx === 1 && (
                                <div className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Source image prepared</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Original camera angle &amp; architectural composition locked</span>
                                  </div>
                                </div>
                              )}

                              {/* STEP 3 DETAILS: RUNNING / CREDIT BLOCKED / ERROR / COMPLETED */}
                              {idx === 2 && (
                                <>
                                  {status === 'credit_blocked' ? (
                                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-2.5">
                                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-extrabold text-xs font-heading">
                                        <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                                        <span>Not Enough Site Credits</span>
                                      </div>
                                      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                                        You need <strong>{creditRequired} credits</strong> to generate this render. You currently have <strong>{userCurrentCredits} credits</strong>.
                                      </p>
                                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                                        Generation was not started and no external generation request was sent.
                                      </p>
                                      <a
                                        href="/billing"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer font-heading"
                                      >
                                        <CreditCard className="w-4 h-4" />
                                        <span>Buy Credits</span>
                                      </a>
                                    </div>
                                  ) : status === 'failed' ? (
                                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 space-y-2.5">
                                      <div className="flex items-center gap-2 text-rose-900 dark:text-rose-100 font-extrabold text-xs font-heading">
                                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                        <span>Generation Interrupted</span>
                                      </div>
                                      <p className="text-xs text-rose-800 dark:text-rose-200 font-medium leading-relaxed">
                                        {generationError || "We couldn't complete the room render because the image generation service did not return a result. Your credits were not consumed."}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={handleGenerate}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-2xs hover:bg-rose-700 transition-colors cursor-pointer font-heading"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Try Again</span>
                                      </button>
                                    </div>
                                  ) : status === 'running' ? (
                                    <div className="space-y-1.5 text-slate-700 dark:text-slate-200 font-medium">
                                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Source composition preserved</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Camera angle &amp; geometry locked</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                                        <span className="text-purple-600">→</span>
                                        <span>Preparing high-resolution render</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                                        <span className="text-purple-600">→</span>
                                        <span>Applying selected furniture &amp; materials ({selectedProducts.slice(0, 2).join(', ') || selectedStyle})</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold animate-pulse">
                                        <span className="text-purple-600">→</span>
                                        <span>Generating architectural 8K image...</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>High-resolution render created</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Selected materials &amp; furniture integrated</span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* STEP 4 DETAILS */}
                              {idx === 3 && (
                                <div className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                                  {status === 'completed' ? (
                                    <>
                                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Resolution &amp; clarity verified</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Composition &amp; style consistency verified</span>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-slate-400 font-medium">
                                      Quality &amp; style inspection will run after render generation finishes.
                                    </p>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* DISCLOSURE: OPTIONAL TECHNICAL DETAILS FOR DEVELOPERS/DEBUGGING */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Technical details</span>
                  <span className="text-[9px]">{showTechnicalDetails ? '▲' : '▼'}</span>
                </button>

                <AnimatePresence>
                  {showTechnicalDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-[10px] text-slate-500 dark:text-slate-400 space-y-1 border border-slate-200/60 dark:border-slate-800 overflow-x-auto"
                    >
                      <div>Tool: {toolSlug || selectedToolId || 'interior-design'}</div>
                      <div>Status: {generatedResult ? 'completed' : creditBlocked ? 'credit_blocked' : generationError ? 'failed' : isGenerating ? 'running' : 'idle'}</div>
                      <div>Site Credits Required: {creditRequired} | Current User Credits: {userCurrentCredits}</div>
                      {generationDurationSeconds > 0 && <div>Execution Duration: {generationDurationSeconds}s</div>}
                      {generationError && <div className="text-rose-500">ErrorMessage: {generationError}</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Start Redesigning Your Space Form (WHITE THEME AS REQUESTED) */}
        <div className="lg:col-span-5 space-y-5">



          {/* Form Title */}
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              {t.generate?.startRedesigning || 'Start Redesigning Your Space:'}
            </h2>
          </div>

          {/* STEP 1: UPLOAD YOUR PHOTO */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary font-heading">
              {t.generate?.step1 || 'Step 1: Upload Your Photo'}
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
              {/* SQUARE DROPZONE / PREVIEW WITH CORNER (X) CLOSE BUTTON */}
              {uploadedImage ? (
                <div className="relative rounded-[10px] overflow-hidden border border-slate-200 group w-32 h-32 sm:w-28 sm:h-28 shrink-0 shadow-2xs bg-slate-100 mx-auto sm:mx-0">
                  <img
                    src={uploadedImage}
                    alt="Uploaded Space Preview"
                    onError={() => {
                      toast.error(
                        'Could not load image from the provided URL. Please make sure it is a direct image link (.jpg, .png, .webp) or upload a photo from your device.',
                        'Image Load Failed'
                      );
                      setUploadedImage(null);
                      setIsUserUploaded(false);
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
                    {t.generate?.changeFile || 'Change File'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 sm:w-28 sm:h-28 shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 text-slate-600 hover:text-primary rounded-[10px] cursor-pointer transition-all group p-2 text-center mx-auto sm:mx-0">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all mb-1" />
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                    {t.generate?.dropPhoto || 'Drop photo'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{t.generate?.orBrowse || 'or browse'}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}

              {/* ALWAYS VISIBLE URL PASTE & FETCH INPUT */}
              <div className="flex-1 space-y-1.5 w-full min-w-0">
                <span className="text-xs font-bold text-slate-700 block font-heading">
                  {t.generate?.pasteImageUrl || 'Or paste Image URL:'}
                </span>
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
                    className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrlImage}
                    className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-[10px] transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {t.generate?.fetch || 'Fetch'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {t.generate?.pasteImageUrlHint || 'Paste image URL and click Fetch or press Enter'}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: CUSTOMIZE FORM (DYNAMIC PER AI TOOL FROM DB & ADMIN PANEL) */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary font-heading">
                {t.generate?.step2 || 'Step 2: Customize'}
              </h3>
            </div>

            {/* SIMPLE PROJECT SELECTOR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between font-heading">
                  <span>{t.generate?.selectProject || 'Select Project'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="text-xs font-extrabold text-primary hover:text-primary/80 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t.generate?.createNewProject || 'Create New Project'}
                  </button>
                </div>
              </div>

              <CustomSelect
                value={selectedProjectId}
                onChange={(val) => handleSelectProject(val)}
                options={[
                  { value: '', label: t.generate?.standaloneNoProject || '-- Standalone Generation (No Project) --' },
                  { value: 'CREATE_NEW_PROJECT', label: t.generate?.createNewProjectOption || '➕ Create New Project...' },
                  ...projectsList.map((p) => ({
                    value: p._id || p.id || '',
                    label: `📁 ${p.name} (${p.theme} ${t.projects?.lockedTheme || 'Theme'} ${p.manusChatId ? '• AI Session Active' : ''})`,
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

                const localizedLabel =
                  isRoomType ? (t.generate?.roomType || label) :
                  isDesignStyle ? (t.generate?.designStyle || label) :
                  isColorPalette ? (t.generate?.colorPalette || label) :
                  isLighting ? (t.generate?.lightingAtmosphere || label) :
                  getLocalizedWidgetLabel(label, widgetId);

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
                  const isLayoutStyleWidget = widget.id === 'floor-plan-style' || widget.id === 'layout-style' || (label && label.toLowerCase().includes('layout style'));
                  const curVal = dynamicWidgetValues[widgetId] || (
                    widget.id === 'room-type' ? selectedRoomType :
                      widget.id === 'design-style' ? selectedStyle :
                        widget.id === 'color-palette' ? selectedPalette :
                          widget.id === 'lighting-atmosphere' || widget.id === 'lighting-mood' ? selectedLighting :
                            isLayoutStyleWidget ? floorPlanStyle :
                              options[0] || ''
                  );

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>{localizedLabel}</span>
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
                          else if (isLayoutStyleWidget) setFloorPlanStyle(val);
                        }}
                        options={options.map((opt: string) => ({
                          value: opt,
                          label: isDesignStyle ? getLocalizedStyleName(opt) : isLayoutStyleWidget ? getLocalizedLayoutStyle(opt) : opt,
                        }))}
                      />
                    </div>
                  );
                }

                if (widget.type === 'Option Grid' || widget.type === 'Button Group') {
                  const isBedrooms = widget.id === 'bedrooms-count' || widget.id === 'bedrooms' || (label && label.toLowerCase().includes('bedroom'));
                  const isBathrooms = widget.id === 'bathrooms-count' || widget.id === 'bathrooms' || (label && label.toLowerCase().includes('bathroom'));
                  const curVal = dynamicWidgetValues[widgetId] || (
                    widget.id === 'budget-level' ? selectedBudget :
                      widget.id === 'furniture-layout' ? furnitureHandling :
                        widget.id === 'room-size' ? selectedSize :
                          isBedrooms ? String(bedroomsCount) :
                            isBathrooms ? String(bathroomsCount) :
                              options[0] || ''
                  );

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>{localizedLabel}</span>
                        {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {options.map((opt: string) => {
                          const displayOpt =
                            widget.id === 'budget-level' ? getLocalizedBudget(opt.toLowerCase(), opt) :
                            widget.id === 'room-size' ? getLocalizedRoomSize(opt.toLowerCase(), opt) :
                            widget.id === 'furniture-layout' ? getLocalizedFurnitureHandling(opt.toLowerCase(), opt) :
                            opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicWidgetValues((prev) => ({ ...prev, [widgetId]: opt }));
                                if (widget.id === 'budget-level') setSelectedBudget(opt);
                                else if (widget.id === 'furniture-layout') setFurnitureHandling(opt);
                                else if (widget.id === 'room-size') setSelectedSize(opt);
                                else if (isBedrooms) setBedroomsCount(Number(opt));
                                else if (isBathrooms) setBathroomsCount(Number(opt));
                              }}
                              className={`px-3.5 py-1.5 rounded-[10px] text-xs transition-all border cursor-pointer ${
                                curVal === opt
                                  ? 'bg-primary/15 border-primary text-primary font-bold shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40 hover:bg-primary/5 font-semibold'
                              }`}
                            >
                              {displayOpt}
                            </button>
                          );
                        })}
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
                          <span>{t.generate?.selectProducts || localizedLabel}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            curArray.length >= 10
                              ? 'bg-rose-100 text-rose-700'
                              : curArray.length > 0
                                ? 'bg-primary/10 text-primary'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {(t.generate?.selectedCount || '{count} / 10 selected').replace('{count}', String(curArray.length))}
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
                            {t.generate?.clearAll || 'Clear all'}
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
                            className={`py-1 px-2.5 text-[10px] font-bold rounded-[10px] capitalize whitespace-nowrap border transition-all cursor-pointer ${
                              productCategoryFilter === cat
                                ? 'bg-primary text-white border-primary shadow-2xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Products Grid Chips */}
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50/80 rounded-[10px] border border-slate-200/90">
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
                              className={`px-2.5 py-1 text-xs font-semibold rounded-[10px] border flex items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                                  : isDisabled
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary/5'
                              }`}
                            >
                              <span>{item.name}</span>
                              {isSelected && <span className="text-[10px] text-primary font-black">✓</span>}
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
                          <span>{localizedLabel}</span>
                          {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                        </label>
                        {curArray.length > 0 && (
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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
                                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40 hover:bg-primary/5 font-semibold'
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
                  const curVal = dynamicWidgetValues[widgetId] || (widget.id === 'plot-dimensions' ? plotDimensions : '');
                  const remaining = Math.max(0, maxLen - curVal.length);

                  return (
                    <div key={widgetId} className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                          <span>{localizedLabel}</span>
                          {isRequired && <span className="text-rose-500 font-extrabold">*</span>}
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {(t.generate?.formLabels?.charsLeft || '{count} chars left').replace('{count}', String(remaining))}
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
                            if (widget.id === 'plot-dimensions') setPlotDimensions(val);
                          }}
                          placeholder={
                            widgetId === 'plot-dimensions'
                              ? (t.generate?.formLabels?.plotDimensionsPlaceholder || 'e.g. 40ft x 60ft or 12m x 15m')
                              : widget.placeholder || (t.generate?.formLabels?.typePlaceholder || 'Type {field}...').replace('{field}', localizedLabel)
                          }
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
                    <div key={`row-${i}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderWidgetSingle(current, i)}
                      {renderWidgetSingle(next, i + 1)}
                    </div>
                  );
                  i += 2;
                } else if (isHalfWidth(current)) {
                  widgetRows.push(
                    <div key={`row-${i}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* MODEL 01: FLOOR PLAN GENERATOR DEDICATED INPUT CARD (FALLBACK ONLY WHEN NO DB WIDGETS CONFIGURED) */}
            {(!activeDbTool || !activeDbTool.widgets || activeDbTool.widgets.length === 0) && (activeSpace === 'floor-plans' || ['floor-plan-generator', '3d-floor-plan', 'floor-plan-maker'].includes(selectedToolId) || ['floor-plan-generator', '3d-floor-plan', 'floor-plan-maker'].includes(toolSlug || '')) && (
              <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                      {t.generate?.formLabels?.floorPlanParamsTitle || 'Model 01: 2D/3D Floor Plan Generator Parameters'}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase">
                    {toolSlug === '3d-floor-plan' ? (t.generate?.formLabels?.isometric3D || '3D Isometric') : (t.generate?.formLabels?.blueprint2D || '2D Blueprint')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bedrooms Stepper */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">
                      {t.generate?.formLabels?.bedroomsCount || 'Bedrooms Count'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBedroomsCount(num)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            bedroomsCount === num
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms Stepper */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">
                      {t.generate?.formLabels?.bathroomsCount || 'Bathrooms Count'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBathroomsCount(num)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            bathroomsCount === num
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
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
                    <label className="text-xs font-extrabold text-slate-800 font-heading">
                      {t.generate?.formLabels?.layoutStyle || 'Layout Style'}
                    </label>
                    <CustomSelect
                      value={floorPlanStyle}
                      onChange={(val) => setFloorPlanStyle(val)}
                      options={[
                        { value: 'Modern Open-Concept', label: getLocalizedLayoutStyle('Modern Open-Concept') },
                        { value: 'Minimalist Split-Level', label: getLocalizedLayoutStyle('Minimalist Split-Level') },
                        { value: 'Luxury Villa Layout', label: getLocalizedLayoutStyle('Luxury Villa Layout') },
                        { value: 'Traditional Family Home', label: getLocalizedLayoutStyle('Traditional Family Home') },
                        { value: 'Executive Suite', label: getLocalizedLayoutStyle('Executive Suite') },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 font-heading">
                      {t.generate?.formLabels?.plotDimensions || 'Plot Dimensions'}
                    </label>
                    <input
                      type="text"
                      placeholder={t.generate?.formLabels?.plotDimensionsPlaceholder || 'e.g. 40ft x 60ft or 12m x 15m'}
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
                    <span>{t.generate?.formLabels?.buildingType || 'Building Type'}</span>
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
                    <span>{t.generate?.formLabels?.roofType || 'Roof Type'}</span>
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
                    <span>{t.generate?.formLabels?.environment || 'Environment'}</span>
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
                    <span>{t.generate?.formLabels?.timeOfDay || 'Time of Day'}</span>
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
                    <span>{t.generate?.formLabels?.houseAngle || 'House Angle'}</span>
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
                    <span>{t.generate?.formLabels?.tool || 'Tool'}</span>
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
                    <span>{t.generate?.designStyle || 'Design Style'}</span>
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
                    <span>{t.generate?.formLabels?.aiIntervention || 'AI Intervention'}</span>
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
                          {getLocalizedInterventionLevel(lvl)}
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
                    <span className="text-xs font-bold text-slate-800 font-heading">
                      {t.generate?.formLabels?.customAiInstructions || 'Custom AI Instructions'}
                    </span>
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
                          placeholder={t.generate?.formLabels?.customAiInstructionsPlaceholder || 'e.g. A modern farmhouse facade with black window frames, timber accents and a metal roof.'}
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
                    <span>{t.generate?.formLabels?.landscapeCategory || 'Landscape Category'}</span>
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
                    <span>{t.generate?.formLabels?.gardenStyle || 'Garden Style'}</span>
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
                    <span>{t.generate?.formLabels?.aiIntervention || 'AI Intervention'}</span>
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
                          {getLocalizedInterventionLevel(lvl)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {t.generate?.roomType || 'Room Type'}
                    </label>
                    <CustomSelect
                      value={selectedRoomType}
                      onChange={(val) => setSelectedRoomType(val)}
                      options={ROOM_TYPES.map((type) => ({ value: type, label: type }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {t.generate?.designStyle || 'Design Style'}
                    </label>
                    <CustomSelect
                      value={selectedStyle}
                      onChange={(val) => setSelectedStyle(val)}
                      options={DESIGN_STYLES.map((style) => ({ value: style.name, label: getLocalizedStyleName(style.name) }))}
                    />
                  </div>
                </div>

                {/* COLOR PALETTE & LIGHTING ATMOSPHERE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {t.generate?.colorPalette || 'Color Palette'}
                    </label>
                    <CustomSelect
                      value={selectedPalette}
                      onChange={(val) => setSelectedPalette(val)}
                      options={COLOR_PALETTES.map((pal) => ({ value: pal.slug, label: pal.name }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {t.generate?.lightingAtmosphere || 'Lighting Atmosphere'}
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
                    <span>{t.generate?.furnitureLayoutHandling || 'Furniture & Layout Handling'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {t.generate?.furnitureLayoutHint || 'Works for furnished & empty rooms'}
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {FURNITURE_HANDLING_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFurnitureHandling(opt.id)}
                        className={`py-2 px-2.5 text-xs font-semibold rounded-[10px] border text-center transition-all ${
                          furnitureHandling === opt.id
                            ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {getLocalizedFurnitureHandling(opt.id, opt.label)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BUDGET LEVEL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    {t.generate?.budgetLevel || 'Budget Level'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BUDGET_LEVELS.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => setSelectedBudget(b.slug)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                          selectedBudget === b.slug
                            ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {getLocalizedBudget(b.slug, b.name)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SELECT SPECIFIC PRODUCTS (MULTI-SELECT UP TO 10 ITEMS) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-heading flex items-center gap-1.5">
                      <span>{t.generate?.selectProducts || 'Select Specific Products / Furniture'}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        selectedProducts.length >= 10
                          ? 'bg-rose-100 text-rose-700'
                          : selectedProducts.length > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {(t.generate?.selectedCount || '{count} / 10 selected').replace('{count}', String(selectedProducts.length))}
                      </span>
                    </label>

                    {selectedProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProducts([])}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        {t.generate?.clearAll || 'Clear all'}
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
                        className={`py-1 px-2 text-[10px] font-bold rounded-lg capitalize whitespace-nowrap border transition-all ${
                          productCategoryFilter === cat
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
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                              : isDisabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
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
                    {t.generate?.roomSize || 'Room Size'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-[10px] border text-center transition-all ${
                          selectedSize === size.id
                            ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {getLocalizedRoomSize(size.id, size.label)}
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
                  {t.generate?.customRequirements || 'Custom Requirements'}
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
                      placeholder={t.generate?.customRequirementsPlaceholder || "Describe your specific needs, preferences, or constraints (e.g. Add warm wooden slat walls & cream sofa)..."}
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-[10px] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all resize-none shadow-2xs"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* GENERATE ACTION BUTTON & CREDIT CHECK WARNING */}
          <div className="space-y-3 font-sans">
            {/* CREDITS BALANCE BADGE WITH GLOWING LIGHT HIGHLIGHT */}
            <div
              className={`p-3.5 rounded-2xl transition-all duration-500 border ${
                highlightCredits
                  ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-400 ring-4 ring-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
              } flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl flex items-center justify-center ${
                    highlightCredits ? 'bg-amber-500 text-slate-950 animate-bounce shadow-md' : 'bg-purple-600/10 text-purple-600'
                  }`}
                >
                  <CreditTokenIcon size="sm" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-heading">
                    {highlightCredits ? '🎉 Offer Credits Active' : (t.generate?.availableCredits || 'Available Studio Credits')}
                  </span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white flex items-center gap-1">
                    {(t.generate?.creditsCount || '{amount} Credits').replace('{amount}', String(userCurrentCredits))}
                  </span>
                </div>
              </div>
              {highlightCredits && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider animate-pulse shadow-sm">
                  Newly Added ⚡
                </span>
              )}
            </div>

            {userCurrentCredits < 4 && (
              <div className="p-3.5 rounded-[10px] bg-primary/10 border border-primary/20 text-slate-900 dark:text-slate-100 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-extrabold block text-slate-900 dark:text-white">
                      {t.generate?.insufficientCreditsTitle || 'Insufficient Credits Available'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {(t.generate?.insufficientCreditsDesc || 'You have {current} Credits available. Generation requires {required} Credits.')
                        .replace('{current}', String(userCurrentCredits))
                        .replace('{required}', '4')}
                    </span>
                  </div>
                </div>
                <Link
                  href="/billing"
                  className="px-3.5 py-1.5 rounded-[10px] bg-primary hover:bg-primary/90 text-white font-extrabold text-[11px] shrink-0 transition-colors shadow-xs"
                >
                  {t.generate?.getCredits || 'Get Credits'}
                </Link>
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating || !uploadedImage}
              onClick={() => {
                if (userCurrentCredits < 4) {
                  toast.error(`You have ${userCurrentCredits} Credits. Generation requires 4 Credits. Please top up your balance.`, 'Insufficient Credits');
                  router.push('/billing');
                  return;
                }
                handleGenerate();
              }}
              className={`w-full py-3.5 px-6 rounded-[10px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-sans ${
                userCurrentCredits < 4
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              } disabled:opacity-50`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {(t.generate?.processingRedesign || 'Processing AI Redesign ({time})...')
                      .replace('{time}', `${Math.floor(generationElapsedSeconds / 60).toString().padStart(2, '0')}:${(generationElapsedSeconds % 60).toString().padStart(2, '0')}`)}
                  </span>
                </>
              ) : userCurrentCredits < 4 ? (
                <>
                  <CreditTokenIcon size="xs" />
                  <span>{t.generate?.getCredits || 'Get Credits to Generate (Requires 4 Credits)'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-accent fill-accent" />
                  <span className="flex items-center gap-1.5">
                    <span>{(t.generate?.generateWithCredits || 'Generate AI Redesign ({credits} Credits)').replace('{credits}', '4')}</span>
                  </span>
                </>
              )}
            </button>

            {isGenerating && (
              <button
                type="button"
                onClick={() => {
                  setIsGenerating(false);
                  toast.info('Generation loading state cancelled.', 'Generation Stopped');
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 font-extrabold text-xs transition-all cursor-pointer font-heading border border-slate-200 dark:border-slate-700"
              >
                {t.generate?.cancelStopWaiting || 'Cancel / Stop Waiting'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FULL-WIDTH BOTTOM GALLERY FOR GENERATED AI RENDERS & RESOLUTION SPECS */}
      {generatedResult && (
        <div className="mt-10 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-300">
          {/* CLEAN & SIMPLE GALLERY HEADER */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                {t.generate?.generatedRenders || 'Generated Renders'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {(t.generate?.variationsReady || '{count} High-Resolution Variation(s) Ready')
                  .replace('{count}', String((generatedImagesList.length > 0 ? generatedImagesList : [generatedResult]).length))}
              </p>
            </div>
          </div>

          {/* RENDER GALLERY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(generatedImagesList.length > 0 ? generatedImagesList : [generatedResult]).map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 aspect-[4/3] sm:aspect-[16/10]"
              >
                <img
                  src={imgUrl}
                  alt={`AI Render Variation ${idx + 1}`}
                  onClick={() => setLightboxImageUrl(imgUrl)}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                />

                {/* OVER THE IMAGE: SMALL VIEW & DOWNLOAD ICONS */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImageUrl(imgUrl);
                    }}
                    className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="View Full Resolution"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerImageDownload(imgUrl, `redesign_render_${idx + 1}.png`);
                    }}
                    className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="Download Render"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PRIVATE PLATFORM RATING & REVIEW BOX */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-slate-50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-purple-100 dark:border-purple-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white font-heading">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{t.generate?.rateQualityTitle || 'Rate Your AI Redesign Quality & Experience'}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t.generate?.rateQualityDesc || 'Your rating helps us improve AI model fidelity. No personal user data or private room images are ever shared publicly.'}
              </p>
            </div>

            {hasSubmittedRating ? (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {(t.generate?.thankYouRating || 'Thank you for rating! ★ {rating}/5 Rating Recorded')
                    .replace('{rating}', String(userStarRating))}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* 5-STAR SELECTOR */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserStarRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      title={`${star} Star`}
                    >
                      <Star className={`w-5 h-5 ${star <= userStarRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSendRatingFeedback}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer font-heading"
                >
                  {t.generate?.submitRating || 'Submit Rating'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        title={t.generate?.createNewProject || "Create New Project"}
        subtitle={t.generate?.modalGroupDesc || "Group your AI room designs into a project workspace"}
        icon={<FolderPlus className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t.generate?.projectNameLabel || 'Project Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={t.generate?.projectNamePlaceholder || "e.g. Living Room Renovation 2026"}
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t.projects?.lockedTheme || 'Primary Design Theme'}
            </label>
            <select
              value={newProjectTheme}
              onChange={(e) => setNewProjectTheme(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {DESIGN_STYLES.map((s: any) => {
                const name = typeof s === 'string' ? s : s.name;
                return (
                  <option key={name} value={name}>
                    {getLocalizedStyleName(name)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t.projects?.customInstructions || 'Description (Optional)'}
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the room or project goals..."
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer font-heading"
            >
              {t.common?.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isCreatingProject}
              className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 font-heading"
            >
              {isCreatingProject ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.common?.loading || 'Creating...'}</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  <span>{t.projects?.createAndGenerateRoom || 'Create & Select'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* FULLSCREEN UNCROPPED LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImageUrl(null)}
          >
            <div className="relative max-w-6xl max-h-[92vh] w-full flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxImageUrl}
                alt="Uncropped Full Resolution Render"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-slate-300 font-mono">100% Uncropped View • 8K UHD Resolution</span>
                <button
                  type="button"
                  onClick={() => triggerImageDownload(lightboxImageUrl, 'uncropped_ai_render.png')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer font-heading"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.generate?.downloadRender || 'Download High-Res Render'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
