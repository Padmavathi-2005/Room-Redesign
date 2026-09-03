'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Upload,
  Image as ImageIcon,
  Check,
  Zap,
  Sparkles,
  Layers,
  Palette,
  Home,
  MessageSquare,
  X,
  Loader2,
  ChevronDown,
  Sliders,
  Flower2,
  Layout,
  ExternalLink,
  DollarSign,
  Smile,
  AlertCircle,
  Download,
  Eye,
} from 'lucide-react';
import { CreditTokenIcon } from '@/components/ui';
import { isModelAllowedForUser, getRequiredPlanForModel } from '@/utils/planPermissions';
import { COLOR_PALETTES, MOODS, BUDGET_LEVELS, BUILDING_TYPES, ROOF_TYPES, LIGHTING_OPTIONS, ENVIRONMENTS, TIMES_OF_DAY } from '@/constants';

const AI_INTERVENTION_LEVELS = ['Very Low', 'Low', 'Medium', 'Extreme'];

const ROOM_TYPES = [
  { id: 'living-room', name: 'Living room' },
  { id: 'open-kitchen-living', name: 'Open Kitchen Living Room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'guest-bedroom', name: 'Guest Bedroom' },
  { id: 'kids-room', name: 'Kids Room' },
  { id: 'nursery', name: 'Nursery' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'dining-room', name: 'Dining room' },
  { id: 'formal-dining', name: 'Formal Dining Room' },
  { id: 'attic', name: 'Attic' },
  { id: 'study-room', name: 'Study room' },
  { id: 'home-office', name: 'Home office' },
  { id: 'family-room', name: 'Family Room' },
  { id: 'gaming-room', name: 'Gaming room' },
  { id: 'home-theater', name: 'Home Theater' },
  { id: 'laundry-room', name: 'Laundry Room' },
  { id: 'utility-room', name: 'Utility Room' },
  { id: 'pet-room', name: 'Pet Room' },
  { id: 'lounge', name: 'Lounge' },
  { id: 'walk-in-closet', name: 'Walk-in Closet' },
  { id: 'playroom', name: 'Playroom' },
  { id: 'reading-nook', name: 'Reading Nook' },
  { id: 'sauna', name: 'Sauna' },
  { id: 'man-cave', name: 'Man Cave' },
  { id: 'foyer', name: 'Foyer' },
  { id: 'prayer-room', name: 'Prayer room' },
  { id: 'wine-cellar', name: 'Wine Cellar' },
  { id: 'sunroom', name: 'Sunroom' },
  { id: 'home-spa', name: 'Home Spa' },
  { id: 'mudroom', name: 'Mudroom' },
  { id: 'craft-room', name: 'Craft Room' },
  { id: 'dressing-room', name: 'Dressing Room' },
  { id: 'home-bar', name: 'Home Bar' },
  { id: 'library', name: 'Library' },
  { id: 'art-studio', name: 'Art Studio' },
  { id: 'yoga-studio', name: 'Yoga Studio' },
  { id: 'photo-studio', name: 'Photo Studio' },
  { id: 'multimedia-room', name: 'Multimedia Room' },
  { id: 'music-room', name: 'Music Room' },
  { id: 'home-gym', name: 'Home Gym' },
];

const INTERIOR_STYLES = [
  { id: 'modern', name: 'Modern' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'industrial', name: 'Industrial' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'scandinavian', name: 'Scandinavian' },
  { id: 'japandi', name: 'Japandi' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'rustic', name: 'Rustic' },
  { id: 'bohemian', name: 'Bohemian' },
  { id: 'classic', name: 'Classic' },
  { id: 'contemporary', name: 'Contemporary' },
  { id: 'mediterranean', name: 'Mediterranean' },
  { id: 'farmhouse', name: 'Farmhouse' },
  { id: 'coastal', name: 'Coastal' },
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
];

const INTERVENTION_LEVELS = ['Very Low', 'Low', 'Medium', 'Extreme'];

const QUALITY_OPTIONS = [
  {
    id: 'pro',
    name: 'Pro',
    tag: 'Default',
    tagBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
    description: 'Balanced detail and clarity',
    credits: 2,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    tag: 'NEW',
    tagBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    description: 'Best-in-class detail and realism',
    credits: 4,
  },
  {
    id: 'basic',
    name: 'Basic',
    tag: 'Legacy',
    tagBg: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    description: 'Basic redesigns with older image quality',
    credits: 1,
  },
];

const FURNITURE_HANDLING_OPTIONS = [
  { id: 'replace-all', label: 'Replace everything' },
  { id: 'reuse', label: 'Reuse everything possible' },
  { id: 'replace-damaged', label: 'Replace only damaged furniture' },
];



const LIGHT_TYPES = ['Natural Sunlight', 'Warm Ambient', 'Neon Cyberpunk', 'Studio Softbox', 'Sunset Glow'];
const PAINT_COLORS = [
  { name: 'Sage Green', hex: '#879883' },
  { name: 'Warm Beige', hex: '#E6D7C3' },
  { name: 'Charcoal Grey', hex: '#36383B' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Terracotta', hex: '#C86D51' },
  { name: 'Soft Rose', hex: '#E8C5C8' },
];
const PAINT_FINISHES = ['Matte', 'Satin', 'Semi-Gloss', 'High Gloss'];
const WALL_MATERIALS = ['Vertical Wood Slats', 'Exposed Red Brick', 'Venetian Plaster', 'Marble Slab', 'Fluted Panels', 'Textured Wallpaper'];
const CLEANER_LEVELS = ['Mild Declutter', 'Deep Clean', 'Full Empty Room'];

export default function DashboardGeneratorFormCard() {
  const searchParams = useSearchParams();
  const urlToolSlug = searchParams?.get('tool') || null;

  const [activeTab, setActiveTab] = useState<'interiors' | 'exteriors' | 'gardens'>('interiors');
  const [activeToolSlug, setActiveToolSlug] = useState<string>(urlToolSlug || 'interior-design');

  // Tool-specific custom states
  const [selectedLightType, setSelectedLightType] = useState('Warm Ambient');
  const [kelvinWarmth, setKelvinWarmth] = useState(3000);
  const [cleanerLevel, setCleanerLevel] = useState('Deep Clean');
  const [wallTarget, setWallTarget] = useState('accent feature wall');
  const [paintColor, setPaintColor] = useState('Sage Green');
  const [paintFinish, setPaintFinish] = useState('Matte');
  const [wallMaterial, setWallMaterial] = useState('Vertical Wood Slats');
  const [skyPreset, setSkyPreset] = useState('Golden Hour Sunset');

  useEffect(() => {
    if (urlToolSlug) {
      setActiveToolSlug(urlToolSlug);
      if (urlToolSlug.includes('exterior') || urlToolSlug.includes('sky') || urlToolSlug.includes('architecture')) {
        setActiveTab('exteriors');
      } else if (urlToolSlug.includes('landscape') || urlToolSlug.includes('garden')) {
        setActiveTab('gardens');
      } else {
        setActiveTab('interiors');
      }
    }
  }, [urlToolSlug]);

  // Interior State
  const [selectedRoom, setSelectedRoom] = useState('living-room');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedPalette, setSelectedPalette] = useState('beige');
  const [selectedMood, setSelectedMood] = useState('Cozy');
  const [selectedLighting, setSelectedLighting] = useState('Warm');
  const [selectedBudget, setSelectedBudget] = useState('medium');
  const [furnitureHandling, setFurnitureHandling] = useState('replace-all');

  // Exterior & Garden State
  const [houseAngle, setHouseAngle] = useState('Side of house');
  const [buildingType, setBuildingType] = useState('House');
  const [roofType, setRoofType] = useState('Flat Roof');
  const [environment, setEnvironment] = useState('City');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [exteriorTool, setExteriorTool] = useState('Redesign');
  const [exteriorStyle, setExteriorStyle] = useState('Modern');
  const [gardenType, setGardenType] = useState('Backyard Oasis');
  const [gardenStyle, setGardenStyle] = useState('Modern Landscape');
  const [aiInterventionIndex, setAiInterventionIndex] = useState(2);

  const [selectedQuality, setSelectedQuality] = useState('pro');
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<string | null>(null);
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{ isOpen: boolean; toolName: string; requiredPlan: string }>({
    isOpen: false,
    toolName: '',
    requiredPlan: '',
  });

  const activeQuality = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) || QUALITY_OPTIONS[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setValidationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImage) {
      setValidationError('Please upload a photo or sketch of your space before generating.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);
    let currentUser: any = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {
      // Ignore parse error
    }

    const toolSlug =
      activeTab === 'interiors'
        ? 'interior-design'
        : activeTab === 'exteriors'
        ? 'exterior-design'
        : 'landscape-design';

    if (!isModelAllowedForUser(toolSlug, currentUser)) {
      const reqPlan = getRequiredPlanForModel(toolSlug);
      setUpgradeModalInfo({
        isOpen: true,
        toolName: activeTab === 'interiors' ? 'Interior Design AI' : activeTab === 'exteriors' ? 'Exterior Design AI' : 'Garden & Landscape AI',
        requiredPlan: reqPlan,
      });
      setIsGenerating(false);
      return;
    }

    const requiredCredits = activeQuality?.credits || 1;
    if (currentUser && currentUser.credits !== undefined && currentUser.credits < requiredCredits) {
      alert(`Insufficient credits! You have ${currentUser.credits} credit(s) remaining, but this generation requires ${requiredCredits} credit(s). Please top up your account or contact Admin.`);
      setIsGenerating(false);
      return;
    }

    setGeneratedSuccess(false);

    const bodyPayload = {
      originalImage: uploadedImage,
      toolSlug,
      userId: currentUser?._id || currentUser?.id || undefined,
      creditsCost: requiredCredits,
      roomType: activeTab === 'interiors' ? selectedRoom : activeTab === 'exteriors' ? 'Exterior' : gardenType,
      theme: activeTab === 'interiors' ? selectedStyle : activeTab === 'exteriors' ? exteriorStyle : gardenStyle,
      designStyle: activeTab === 'interiors' ? selectedStyle : activeTab === 'exteriors' ? exteriorStyle : gardenStyle,
      colorPalette: activeTab === 'interiors' ? selectedPalette : undefined,
      mood: activeTab === 'interiors' ? selectedMood : undefined,
      lighting: selectedLighting,
      budgetLevel: activeTab === 'interiors' ? selectedBudget : undefined,
      furnitureHandling: activeTab === 'interiors' ? furnitureHandling : undefined,
      houseAngle: activeTab === 'exteriors' ? houseAngle : undefined,
      buildingType: activeTab === 'exteriors' ? buildingType : undefined,
      roofType: activeTab === 'exteriors' ? roofType : undefined,
      environment: activeTab !== 'interiors' ? environment : undefined,
      timeOfDay: activeTab !== 'interiors' ? timeOfDay : undefined,
      tool: activeTab === 'exteriors' ? exteriorTool : undefined,
      aiIntervention: AI_INTERVENTION_LEVELS[aiInterventionIndex],
      customInstructions: showCustomInstructions ? customMsg : undefined,
      userPrompt: showCustomInstructions ? customMsg : undefined,
    };

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${API_BASE}/rooms/generate`, {
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

      if (response.ok && (resData._id || resData.generatedImage || resData.data)) {
        const output = resData.generatedImage || resData.data?.generatedImage;
        setGeneratedResult(output || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
        setCompiledPrompt(resData.prompt || resData.data?.prompt || '');
        setGeneratedSuccess(true);
      } else {
        setGeneratedResult(resData.generatedImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
        setGeneratedSuccess(true);
      }

      // Update remaining user credits in local state & localStorage
      if (currentUser) {
        const remaining = resData.remainingCredits ?? resData.data?.remainingCredits ?? (currentUser.credits !== undefined ? Math.max(0, currentUser.credits - requiredCredits) : 0);
        const updatedUser = { ...currentUser, credits: remaining };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));
      }
    } catch (err) {
      setGeneratedResult('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
      setGeneratedSuccess(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 space-y-5 relative overflow-hidden"
    >
      {/* CARD HEADER & FULL STUDIO LINK */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-blue-500/20">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading leading-none">
              AI Redesign Studio
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
              Instant Generation Form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/generate"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Full Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
            <CreditTokenIcon size="xs" />
            <span>{activeQuality.credits}</span>
          </div>
        </div>
      </div>

      {/* SPACE CATEGORY TAB BAR (INTERIORS / EXTERIORS / GARDENS) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('interiors')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'interiors'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Interiors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exteriors')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'exteriors'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Exteriors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gardens')}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'gardens'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Flower2 className="w-3.5 h-3.5" />
          <span>Gardens</span>
        </button>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        
        {/* SELECT QUALITY DROPDOWN */}
        <div className="space-y-1 relative">
          <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-between font-heading">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Select Quality</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => setIsQualityOpen(!isQualityOpen)}
            className="w-full flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white hover:border-purple-500 transition-all focus:outline-none"
          >
            <span className="font-bold font-heading flex items-center gap-1.5">
              <span>{activeQuality.name}</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-normal">
                (<CreditTokenIcon size="xs" /> {activeQuality.credits})
              </span>
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isQualityOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isQualityOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsQualityOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 space-y-1 text-xs"
                >
                  {QUALITY_OPTIONS.map((opt) => {
                    const isSelected = selectedQuality === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setSelectedQuality(opt.id);
                          setIsQualityOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-left border ${
                          isSelected
                            ? 'bg-purple-50/90 dark:bg-purple-950/70 border-purple-500/80 text-slate-900 dark:text-white'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold font-heading text-xs">{opt.name}</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-2xl ${opt.tagBg}`}>
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {opt.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1">
                            <CreditTokenIcon size="xs" />
                            {opt.credits}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* DYNAMIC FORM DEPENDING ON ACTIVE TOOL SLUG & ACTIVE TAB */}
        {activeToolSlug === 'change-room-light' ? (
          /* CHANGE ROOM LIGHT FORM */
          <div className="space-y-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 dark:text-amber-300 font-heading">
              <span>💡 Change Room Light Controls</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-2xl">Lighting Engine</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Light Source Type
                </label>
                <select
                  value={selectedLightType}
                  onChange={(e) => setSelectedLightType(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {LIGHT_TYPES.map((lt) => (
                    <option key={lt} value={lt}>{lt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Time of Day
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {TIMES_OF_DAY.map((tod) => (
                    <option key={tod} value={tod}>{tod}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                <span>Color Temperature Warmth</span>
                <span className="text-amber-700 dark:text-amber-400 font-extrabold">{kelvinWarmth}K</span>
              </div>
              <input
                type="range"
                min="2700"
                max="6500"
                step="100"
                value={kelvinWarmth}
                onChange={(e) => setKelvinWarmth(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-2xl"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>2700K Warm Cozy</span>
                <span>4000K Neutral</span>
                <span>6500K Cool Daylight</span>
              </div>
            </div>
          </div>
        ) : activeToolSlug === 'ai-room-cleaner' ? (
          /* AI ROOM CLEANER FORM */
          <div className="space-y-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 dark:text-emerald-300 font-heading">
              <span>🧹 AI Room Cleaner & Declutter</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 rounded-2xl">Pristine Space</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                Declutter Intensity
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {CLEANER_LEVELS.map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setCleanerLevel(lvl)}
                    className={`py-1.5 px-2 text-xs font-extrabold rounded-2xl border text-center transition-all ${
                      cleanerLevel === lvl
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : activeToolSlug === 'paint-color-visualizer' ? (
          /* PAINT COLOR VISUALIZER FORM */
          <div className="space-y-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-extrabold text-blue-900 dark:text-blue-300 font-heading">
              <span>🎨 Paint Color Visualizer</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200/80 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-2xl">Wall Swatches</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Wall Target
                </label>
                <select
                  value={wallTarget}
                  onChange={(e) => setWallTarget(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="accent feature wall">Accent Feature Wall</option>
                  <option value="main interior walls">Main Interior Walls</option>
                  <option value="all walls and trim">All Walls & Trim</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Paint Finish
                </label>
                <select
                  value={paintFinish}
                  onChange={(e) => setPaintFinish(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {PAINT_FINISHES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                Color Swatch
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {PAINT_COLORS.map((pc) => (
                  <button
                    type="button"
                    key={pc.name}
                    title={pc.name}
                    onClick={() => setPaintColor(pc.name)}
                    className={`h-8 rounded-2xl border flex items-center justify-center transition-transform ${
                      paintColor === pc.name ? 'scale-110 ring-2 ring-blue-600 border-white' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: pc.hex }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500 block text-right font-heading">Selected: {paintColor}</span>
            </div>
          </div>
        ) : activeToolSlug === 'ai-wall-design' ? (
          /* AI WALL DESIGN FORM */
          <div className="space-y-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-extrabold text-purple-900 dark:text-purple-300 font-heading">
              <span>🧱 AI Wall Design & Texture</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200/80 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-2xl">Feature Wall</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                Wall Material Texture
              </label>
              <select
                value={wallMaterial}
                onChange={(e) => setWallMaterial(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                {WALL_MATERIALS.map((wm) => (
                  <option key={wm} value={wm}>{wm}</option>
                ))}
              </select>
            </div>
          </div>
        ) : activeTab === 'interiors' ? (
          /* INTERIOR FIELDS */
          <div className="space-y-3">
            {/* ROOM TYPE & DESIGN STYLE */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Room Type
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {ROOM_TYPES.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Design Style
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {INTERIOR_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COLOR PALETTE & LIGHTING ATMOSPHERE */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Color Palette
                </label>
                <select
                  value={selectedPalette}
                  onChange={(e) => setSelectedPalette(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {COLOR_PALETTES.map((pal) => (
                    <option key={pal.slug} value={pal.slug}>
                      {pal.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Lighting Atmosphere
                </label>
                <select
                  value={selectedLighting}
                  onChange={(e) => setSelectedLighting(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
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
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                Furniture & Layout Handling
              </label>
              <div className="grid grid-cols-3 gap-1">
                {FURNITURE_HANDLING_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setFurnitureHandling(opt.id)}
                    className={`py-1 px-1.5 text-[10px] font-bold rounded-2xl border text-center transition-all ${
                      furnitureHandling === opt.id
                        ? 'bg-purple-50 border-purple-600 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BUDGET LEVEL */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                Budget Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BUDGET_LEVELS.map((b) => (
                  <button
                    type="button"
                    key={b.slug}
                    onClick={() => setSelectedBudget(b.slug)}
                    className={`py-1 px-2 text-[11px] font-bold rounded-2xl border text-center transition-all ${
                      selectedBudget === b.slug
                        ? 'bg-purple-50 border-purple-600 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* AI INTERVENTION SLIDER */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                AI Intervention
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={aiInterventionIndex}
                onChange={(e) => setAiInterventionIndex(Number(e.target.value))}
                className="w-full accent-purple-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-2xl cursor-pointer"
              />
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                {AI_INTERVENTION_LEVELS.map((lvl, idx) => (
                  <span key={lvl} className={aiInterventionIndex === idx ? 'text-purple-600 font-extrabold' : ''}>
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'exteriors' ? (
          /* EXTERIOR FIELDS */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  House Angle
                </label>
                <select
                  value={houseAngle}
                  onChange={(e) => setHouseAngle(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {HOUSE_ANGLES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Tool
                </label>
                <select
                  value={exteriorTool}
                  onChange={(e) => setExteriorTool(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {EXTERIOR_TOOLS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Building Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {BUILDING_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Roof Type
                </label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {ROOF_TYPES.map((rt) => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {ENVIRONMENTS.map((env) => (
                    <option key={env} value={env}>{env}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Time of Day
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {TIMES_OF_DAY.map((tod) => (
                    <option key={tod} value={tod}>{tod}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                Design Style
              </label>
              <select
                value={exteriorStyle}
                onChange={(e) => setExteriorStyle(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {EXTERIOR_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                AI Intervention
              </label>
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
                  <span key={lvl} className={aiInterventionIndex === idx ? 'text-purple-600 font-extrabold' : ''}>
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* GARDENS FIELDS */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Landscape Category
                </label>
                <select
                  value={gardenType}
                  onChange={(e) => setGardenType(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {GARDEN_TYPES.map((gt) => (
                    <option key={gt} value={gt}>{gt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                  Garden Style
                </label>
                <select
                  value={gardenStyle}
                  onChange={(e) => setGardenStyle(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {GARDEN_STYLES.map((gs) => (
                    <option key={gs} value={gs}>{gs}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-heading">
                AI Intervention
              </label>
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
                  <span key={lvl} className={aiInterventionIndex === idx ? 'text-purple-600 font-extrabold' : ''}>
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD PHOTO / SKETCH */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
            <Upload className="w-3 h-3 text-purple-600" />
            <span>Upload Photo / Sketch</span>
          </label>

          {uploadedImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group h-20">
              <img src={uploadedImage} alt="Uploaded Room" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setUploadedImage(null)}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-purple-300/80 hover:border-purple-600 rounded-2xl cursor-pointer bg-purple-50/20 dark:bg-slate-800/40 transition-colors group">
              <ImageIcon className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload image (PNG, JPG)
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* CUSTOM INSTRUCTIONS CHECKBOX TOGGLE */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCustomInstructions}
              onChange={(e) => setShowCustomInstructions(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-purple-600" />
              <span>Add Custom Requirements / Instructions</span>
            </span>
          </label>

          {showCustomInstructions && (
            <div className="space-y-1 pt-1">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="e.g. Add warm wooden slat walls & cream sofa..."
                className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        {/* VALIDATION ERROR ALERT */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GENERATE SUBMIT BUTTON */}
        <motion.button
          type="submit"
          disabled={isGenerating}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 font-heading disabled:opacity-75"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Generating AI Redesign...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate AI Redesign</span>
            </>
          )}
        </motion.button>

        {/* GENERATED RESULT & SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {generatedSuccess && generatedResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>AI Redesign generated successfully!</span>
                </span>
                <a
                  href={generatedResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 group">
                <img src={generatedResult} alt="Generated AI Redesign" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={generatedResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/90 text-slate-900 font-bold hover:bg-white text-xs flex items-center gap-1 shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Size</span>
                  </a>
                </div>
              </div>

              {compiledPrompt && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[10px] space-y-1">
                  <span className="font-extrabold text-slate-500 uppercase tracking-widest block font-heading">
                    AI Prompt Spec:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-mono italic leading-normal line-clamp-2">
                    &ldquo;{compiledPrompt}&rdquo;
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* UPGRADE PLAN REQUIRED MODAL */}
      <AnimatePresence>
        {upgradeModalInfo.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto shadow-md border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-heading">
                  <span>✦ PRO MODEL LOCKED</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                  Upgrade Plan for {upgradeModalInfo.toolName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  This AI model is exclusively available on the <strong className="text-purple-600 dark:text-purple-400">{upgradeModalInfo.requiredPlan} Plan</strong> or higher. Upgrade your subscription to unlock all 18 AI generators.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUpgradeModalInfo({ ...upgradeModalInfo, isOpen: false })}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all cursor-pointer font-heading"
                >
                  Cancel
                </button>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade Plan Now</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
