'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

const ROOM_TYPES = [
  { id: 'living-room', name: 'Living room' },
  { id: 'open-kitchen-living', name: 'Open Kitchen Living Room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'dining-room', name: 'Dining room' },
  { id: 'attic', name: 'Attic' },
  { id: 'study-room', name: 'Study room' },
  { id: 'home-office', name: 'Home office' },
  { id: 'family-room', name: 'Family Room' },
  { id: 'formal-dining', name: 'Formal Dining Room' },
  { id: 'kids-room', name: 'Kids Room' },
  { id: 'balcony', name: 'Balcony' },
  { id: 'gaming-room', name: 'Gaming room' },
  { id: 'meeting-room', name: 'Meeting room' },
  { id: 'workshop', name: 'Workshop' },
  { id: 'fitness-gym', name: 'Fitness gym' },
  { id: 'coffee-shop', name: 'Coffee shop' },
  { id: 'clothing-store', name: 'Clothing store' },
  { id: 'restaurant', name: 'Restaurant' },
];

const PRODUCT_TYPES = [
  { id: 'complete', name: 'Complete Redesign' },
  { id: 'furniture', name: 'Furniture & Decor' },
  { id: 'paint', name: 'Wall Paint & Textures' },
  { id: 'lighting', name: 'Lighting & Fixtures' },
  { id: 'flooring', name: 'Flooring & Tiles' },
];

const DESIGN_STYLES = [
  { id: 'japandi', name: 'Modern Japandi' },
  { id: 'scandinavian', name: 'Scandinavian Warmth' },
  { id: 'minimalist', name: 'Minimalist Luxury' },
  { id: 'industrial', name: 'Industrial Loft' },
  { id: 'bohemian', name: 'Bohemian Chic' },
  { id: 'classic', name: 'Contemporary Classic' },
];

const COLOR_PALETTES = [
  { id: 'warm-earth', name: 'Warm Earth', colors: ['#E6D7C3', '#C2A68C', '#8C6D58'] },
  { id: 'sage-wood', name: 'Sage Wood', colors: ['#8A9A86', '#B5C1B4', '#5F6F5E'] },
  { id: 'midnight-brass', name: 'Navy Gold', colors: ['#1B263B', '#415A77', '#D4AF37'] },
  { id: 'charcoal-minimal', name: 'Charcoal', colors: ['#2B2D42', '#8D99AE', '#E2E8F0'] },
];

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

export default function DashboardGeneratorFormCard() {
  const [selectedRoom, setSelectedRoom] = useState('living-room');
  const [selectedProduct, setSelectedProduct] = useState('complete');
  const [selectedStyle, setSelectedStyle] = useState('japandi');
  const [selectedPalette, setSelectedPalette] = useState('warm-earth');
  const [selectedQuality, setSelectedQuality] = useState('pro');
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const activeQuality = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) || QUALITY_OPTIONS[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedSuccess(false);

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
    }, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/5 space-y-3.5 relative overflow-hidden"
    >
      {/* CARD HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading leading-none">
              AI Redesign Studio
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
              Instant AI Generation Form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300">
          <Zap className="w-3 h-3 text-amber-500 fill-current" />
          <span>{activeQuality.credits} {activeQuality.credits === 1 ? 'Credit' : 'Credits'}</span>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        
        {/* SELECT QUALITY FIELD (CUSTOM DROPDOWN MATCHING REFERENCE DESIGN) */}
        <div className="space-y-1 relative">
          <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-between font-heading">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Quality</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => setIsQualityOpen(!isQualityOpen)}
            className="w-full flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white hover:border-blue-500 transition-all focus:outline-none"
          >
            <span className="font-bold font-heading">
              {activeQuality.name} — {activeQuality.credits} {activeQuality.credits === 1 ? 'credit' : 'credits'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isQualityOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* SELECT QUALITY POPUP MENU */}
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
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left border ${
                          isSelected
                            ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-500/80 text-slate-900 dark:text-white'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold font-heading text-xs">{opt.name}</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${opt.tagBg}`}>
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {opt.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {opt.credits} {opt.credits === 1 ? 'credit' : 'credits'}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* ROW 1: ROOM TYPE & PRODUCT TYPE (SIDE BY SIDE) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
              <Home className="w-3 h-3 text-blue-600" />
              <span>Room Type</span>
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ROOM_TYPES.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Product Type</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PRODUCT_TYPES.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 2: DESIGN STYLE & COLOR PALETTE (SIDE BY SIDE) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Design Style</span>
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {DESIGN_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
              <Palette className="w-3 h-3 text-emerald-600" />
              <span>Color Palette</span>
            </label>
            <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
              {COLOR_PALETTES.map((pal) => {
                const isSelected = selectedPalette === pal.id;
                return (
                  <button
                    type="button"
                    key={pal.id}
                    onClick={() => setSelectedPalette(pal.id)}
                    title={pal.name}
                    className={`p-1 rounded-lg border flex items-center gap-0.5 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center -space-x-1">
                      {pal.colors.map((c, i) => (
                        <span key={i} className="w-2.5 h-2.5 rounded-full border border-white/40" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 3: UPLOAD ROOM PHOTO */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
            <Upload className="w-3 h-3 text-amber-500" />
            <span>Upload Photo / Sketch</span>
          </label>

          {uploadedImage ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group h-20">
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
            <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50/60 dark:bg-slate-800/40 transition-colors group">
              <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Upload image (PNG, JPG)
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* ROW 4: CUSTOM INSTRUCTIONS */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-heading">
            <MessageSquare className="w-3 h-3 text-cyan-500" />
            <span>Custom Instructions</span>
          </label>
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="e.g. Add warm wooden slat walls & cream sofa..."
            className="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* GENERATE SUBMIT BUTTON */}
        <motion.button
          type="submit"
          disabled={isGenerating}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 font-heading disabled:opacity-75"
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

        {/* SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {generatedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>AI Redesign generated! Saved to Your Designs.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
