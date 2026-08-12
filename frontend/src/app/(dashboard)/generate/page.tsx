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
} from 'lucide-react';
import { ROOM_TYPES, DESIGN_STYLES, COLOR_PALETTES, MOODS, BUDGET_LEVELS, BUILDING_TYPES, ROOF_TYPES, LIGHTING_OPTIONS, ENVIRONMENTS, TIMES_OF_DAY } from '@/constants';
import { projectService, ProjectData } from '@/services/project.service';

interface StudioToolConfig {
  id: string;
  name: string;
  category: 'floor-plans' | 'interiors' | 'exteriors' | 'gardens';
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
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

  // Projects state
  const [projectsList, setProjectsList] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [uploadedImage, setUploadedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'
  );
  
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const sliderContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const fetchProjects = async () => {
      const projs = await projectService.getProjects();
      setProjectsList(projs);
    };
    fetchProjects();
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
      alert('Insufficient credits! You have 0 credits remaining. Please top up your account or contact Admin.');
      return;
    }

    setIsGenerating(true);

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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/rooms/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const resData = await response.json();
      if (!response.ok && resData.message && resData.message.includes('Insufficient credits')) {
        alert(resData.message);
        setIsGenerating(false);
        return;
      }

      if (resData._id || resData.generatedImage || resData.data) {
        const output = resData.generatedImage || resData.data?.generatedImage;
        setGeneratedResult(output || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
        setCompiledPrompt(resData.prompt || resData.data?.prompt || '');
      } else {
        setGeneratedResult('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
      }

      // Update local storage user credits & dispatch event
      if (currentUser) {
        const remaining = resData.remainingCredits ?? resData.data?.remainingCredits ?? (currentUser.credits !== undefined ? Math.max(0, currentUser.credits - 1) : 0);
        const updatedUser = { ...currentUser, credits: remaining };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));
      }
    } catch (err) {
      setGeneratedResult('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pt-20 pb-16 text-slate-900 selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP SPACE & TOOL SELECTOR BAR */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-2 pb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600 font-heading">
            CHOOSE YOUR SPACE & AI TOOL
          </span>

          {/* SPACE CATEGORY TAB BUTTONS */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-200/90 dark:bg-slate-800/90 rounded-full border border-slate-300/80 dark:border-slate-700 shadow-inner">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    isSpaceActive
                      ? 'bg-white text-slate-900 shadow-md border border-slate-200/90 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <SpaceIcon className={`w-3.5 h-3.5 ${isSpaceActive ? 'text-purple-600' : 'text-slate-500'}`} />
                  <span>{space.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSpaceActive ? 'bg-purple-100 text-purple-700' : 'bg-slate-300/60 text-slate-600'
                    }`}
                  >
                    {spaceToolCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 18 AI TOOLS FLEX-WRAP CARDS (CLEAN RESPONSIVE WRAP WITHOUT SCROLLBARS) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-5xl mx-auto px-2 pt-1">
            {ALL_STUDIO_TOOLS.filter((t) => t.category === activeSpace).map((t) => {
              const ToolIcon = t.icon;
              const isSelected = selectedToolId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTool(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-md shadow-purple-500/20 font-extrabold scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/40 hover:-translate-y-0.5 shadow-2xs font-semibold'
                  }`}
                >
                  <ToolIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                  <span>{t.name}</span>
                  {t.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                        isSelected
                          ? 'bg-white/20 text-purple-100 backdrop-blur-xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200/60'
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

        {/* MAIN STUDIO TWO-COLUMN LAYOUT (LIGHT/WHITE THEME) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Latest from Our Community & AI Render Interactive Viewer */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HD</span>
                  </a>
                )}
              </div>

              {/* Interactive Before / After Split Render Viewer */}
              <div
                ref={sliderContainerRef}
                className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 select-none shadow-inner"
              >
                {generatedResult ? (
                  <>
                    <img
                      src={generatedResult}
                      alt="AI Redesign"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden z-10"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={uploadedImage || ''}
                        alt="Original Upload"
                        className="absolute top-0 left-0 h-full max-w-none object-cover"
                        style={{
                          width: containerWidth ? `${containerWidth}px` : '100%',
                          height: '100%',
                        }}
                      />
                    </div>

                    <div
                      className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl z-20"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-white text-purple-700 shadow-xl border border-slate-200 flex items-center justify-center text-xs font-extrabold">
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

                    <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold rounded-lg pointer-events-none">
                      Before (Sketch / Original)
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white font-extrabold text-[11px] rounded-lg shadow-md pointer-events-none flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>After ({activeSpace === 'exteriors' ? exteriorStyle : selectedStyle} AI)</span>
                    </div>

                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md text-white rounded-xl text-xs font-bold">
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Play Video</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
                    <ImageIcon className="w-12 h-12 text-purple-400/80 stroke-1 animate-pulse" />
                    <div>
                      <div className="text-sm font-extrabold text-white font-heading">
                        Ready to Redesign Your {activeSpace === 'exteriors' ? 'Exterior Facade' : activeSpace === 'gardens' ? 'Garden' : 'Interior Space'}
                      </div>
                      <div className="text-xs text-slate-400 max-w-sm mt-1">
                        Upload your photo on the right and click "Generate AI Redesign" to see your transformation.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compiled Prompt Detail Box */}
              {compiledPrompt && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <div className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Compiled Prompt Engine Output</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-xl border border-purple-200/60">
                    {compiledPrompt}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Start Redesigning Your Space Form (WHITE THEME AS REQUESTED) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Active AI Tool Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                      <ActiveToolIcon className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider font-heading">
                          Active Tool
                        </span>
                        {activeToolConfig.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-extrabold border border-amber-400/30 uppercase">
                            {activeToolConfig.badge}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-extrabold font-heading text-white">{activeToolConfig.name}</h2>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeToolConfig.description}
                </p>
              </div>

              {/* Form Title */}
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                  Start Redesigning Your Space:
                </h2>
              </div>

              {/* Purple Safeguard Shield Notice Banner (Matching User Reference) */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-purple-950 flex items-center gap-3 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <p className="text-xs font-semibold leading-relaxed">
                  Your home's shape, windows and rooflines stay exactly as they are. Only the design changes.
                </p>
              </div>

              {/* STEP 1: UPLOAD YOUR PHOTO */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 font-heading">
                  Step 1: Upload Your Photo
                </h3>

                {uploadedImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group h-44">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Space"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shadow-md">
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-purple-300/90 hover:border-purple-600 bg-purple-50/20 hover:bg-purple-50/60 rounded-2xl cursor-pointer transition-all group p-4">
                    <Upload className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      Drop an image, tap, take a photo, or CTRL + V
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WEBP up to 15MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* STEP 2: CUSTOMIZE FORM (WHITE THEME AS REQUESTED) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 font-heading">
                    Step 2: Customize & Project Workspace
                  </h3>
                </div>

                {/* PROJECT WORKSPACE SELECTOR & THEME LOCKING BANNER */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5 font-heading">
                      <Folder className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                      <span>Project Workspace (Same Theme & Manus Session)</span>
                    </label>
                    {selectedProjectId && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                        <Lock className="w-2.5 h-2.5" /> Same-Theme Locked
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Standalone Generation (No Project) --</option>
                    {projectsList.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        📁 {p.name} ({p.theme} Theme {p.manusChatId ? '• Manus Chat Active' : ''})
                      </option>
                    ))}
                  </select>

                  {selectedProjectId ? (
                    <div className="text-[11px] font-semibold text-indigo-900 flex items-start gap-1.5 pt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        Rooms generated in this project will automatically inherit <strong>{selectedStyle}</strong> style and join the existing Manus AI session thread.
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-indigo-700/80">
                      Select or create a project in the <strong>Projects Workspace</strong> tab to keep all room generations in the same theme and chat session!
                    </p>
                  )}
                </div>

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
                              className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                                bedroomsCount === num
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
                              className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                                bathroomsCount === num
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
                        <select
                          value={floorPlanStyle}
                          onChange={(e) => setFloorPlanStyle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                        >
                          <option value="Modern Open-Concept">Modern Open-Concept</option>
                          <option value="Minimalist Split-Level">Minimalist Split-Level</option>
                          <option value="Luxury Villa Layout">Luxury Villa Layout</option>
                          <option value="Traditional Family Home">Traditional Family Home</option>
                          <option value="Executive Suite">Executive Suite</option>
                        </select>
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

                {activeSpace === 'exteriors' ? (
                  /* EXTERIOR FORM IN WHITE THEME */
                  <div className="space-y-4">
                    
                    {/* Building Type Dropdown (Required) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Building Type</span>
                        <span className="text-rose-500 font-extrabold">*</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={buildingType}
                        onChange={(e) => setBuildingType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {BUILDING_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Roof Type Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Roof Type</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={roofType}
                        onChange={(e) => setRoofType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {ROOF_TYPES.map((rt) => (
                          <option key={rt} value={rt}>
                            {rt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Environment Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Environment</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {ENVIRONMENTS.map((env) => (
                          <option key={env} value={env}>
                            {env}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time of Day Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Time of Day</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={timeOfDay}
                        onChange={(e) => setTimeOfDay(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {TIMES_OF_DAY.map((tod) => (
                          <option key={tod} value={tod}>
                            {tod}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* House Angle Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>House Angle</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={houseAngle}
                        onChange={(e) => setHouseAngle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {HOUSE_ANGLES.map((angle) => (
                          <option key={angle} value={angle}>
                            {angle}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tool Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Tool</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={exteriorTool}
                        onChange={(e) => setExteriorTool(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {EXTERIOR_TOOLS.map((tool) => (
                          <option key={tool} value={tool}>
                            {tool}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Design Style Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Design Style</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={exteriorStyle}
                        onChange={(e) => setExteriorStyle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {EXTERIOR_STYLES.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
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
                ) : activeSpace === 'gardens' ? (
                  /* GARDEN FORM IN WHITE THEME */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Landscape Category</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={gardenType}
                        onChange={(e) => setGardenType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {GARDEN_TYPES.map((gt) => (
                          <option key={gt} value={gt}>{gt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-heading">
                        <span>Garden Style</span>
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-100 cursor-pointer" />
                      </label>
                      <select
                        value={gardenStyle}
                        onChange={(e) => setGardenStyle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {GARDEN_STYLES.map((gs) => (
                          <option key={gs} value={gs}>{gs}</option>
                        ))}
                      </select>
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
                ) : (
                  /* INTERIOR FORM IN WHITE THEME */
                  <div className="space-y-4">
                    {/* Room Type & Design Style */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 font-heading">
                          Room Type
                        </label>
                        <select
                          value={selectedRoomType}
                          onChange={(e) => setSelectedRoomType(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                        >
                          {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 relative">
                        <label className="text-xs font-bold text-slate-800 font-heading">
                          Design Style
                        </label>
                        <select
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                        >
                          {DESIGN_STYLES.map((style) => (
                            <option key={style.id} value={style.name}>
                              {style.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* COLOR PALETTE & LIGHTING ATMOSPHERE */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 font-heading">
                          Color Palette
                        </label>
                        <select
                          value={selectedPalette}
                          onChange={(e) => setSelectedPalette(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                        >
                          {COLOR_PALETTES.map((pal) => (
                            <option key={pal.slug} value={pal.slug}>
                              {pal.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 font-heading">
                          Lighting Atmosphere
                        </label>
                        <select
                          value={selectedLighting}
                          onChange={(e) => setSelectedLighting(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer shadow-2xs"
                        >
                          {LIGHTING_OPTIONS.map((light) => (
                            <option key={light} value={light}>
                              {light}
                            </option>
                          ))}
                        </select>
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
                            className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                              furnitureHandling === opt.id
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
                            className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                              selectedBudget === b.slug
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
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedProducts.length >= 10
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
                            className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                              selectedSize === size.id
                                ? 'bg-purple-50 border-purple-600 text-purple-800 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI INTERVENTION */}
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

                    {/* CUSTOM REQUIREMENTS CHECKBOX & EXPANDABLE TEXTAREA */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
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

                      {showCustomRequirements && (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            rows={3}
                            value={customRequirements}
                            onChange={(e) => setCustomRequirements(e.target.value)}
                            placeholder="Describe your specific needs, preferences, or constraints (e.g. Add warm wooden slat walls & cream sofa)..."
                            className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all resize-none shadow-2xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    <span>Generating AI Redesign...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Generate AI Redesign (4 Credits)</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>
      </div>
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
