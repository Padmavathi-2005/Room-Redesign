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
} from 'lucide-react';

const ROOM_TYPES = [
  { id: 'living-room', name: 'Living Room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'kitchen', name: 'Kitchen & Dining' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'office', name: 'Office Workspace' },
  { id: 'exterior', name: 'Exterior Facade' },
  { id: 'garden', name: 'Patio & Garden' },
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
  { id: 'sage-wood', name: 'Sage & Wood', colors: ['#8A9A86', '#B5C1B4', '#5F6F5E'] },
  { id: 'midnight-brass', name: 'Navy & Gold', colors: ['#1B263B', '#415A77', '#D4AF37'] },
  { id: 'charcoal-minimal', name: 'Charcoal Minimal', colors: ['#2B2D42', '#8D99AE', '#E2E8F0'] },
  { id: 'terracotta-cream', name: 'Terracotta', colors: ['#E07A5F', '#F4F1DE', '#3D405B'] },
];

export default function DashboardGeneratorFormCard() {
  const [selectedRoom, setSelectedRoom] = useState('living-room');
  const [selectedProduct, setSelectedProduct] = useState('complete');
  const [selectedStyle, setSelectedStyle] = useState('japandi');
  const [selectedPalette, setSelectedPalette] = useState('warm-earth');
  const [customMsg, setCustomMsg] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

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
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden"
    >
      {/* CARD HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-blue-500/20">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
              AI Room Redesign Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure room parameters & generate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-300">
          <Zap className="w-3 h-3 text-amber-500 fill-current" />
          <span>1 Credit</span>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* 1. ROOM TYPE SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
            <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Room Type</span>
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {ROOM_TYPES.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. PRODUCT TYPE SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Product Type</span>
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {PRODUCT_TYPES.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. DESIGN STYLE SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Design Style</span>
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {DESIGN_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. COLOR PALETTE SELECTION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Color Palette</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = selectedPalette === pal.id;
              return (
                <button
                  type="button"
                  key={pal.id}
                  onClick={() => setSelectedPalette(pal.id)}
                  title={pal.name}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center -space-x-1">
                    {pal.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. UPLOAD IMAGE AREA */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Upload Room Photo / Sketch</span>
          </label>

          {uploadedImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
              <img src={uploadedImage} alt="Uploaded Room" className="w-full h-32 object-cover" />
              <button
                type="button"
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50/60 dark:bg-slate-800/40 transition-colors group">
              <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-1" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Click or drag image here
              </span>
              <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* 6. CUSTOM MESSAGE / PROMPT */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
            <MessageSquare className="w-4 h-4 text-cyan-500" />
            <span>Custom Instructions</span>
          </label>
          <textarea
            rows={2}
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="e.g. Add warm wooden slat walls, plush cream sofa, and recessed warm LED ceiling lights..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        {/* 7. GENERATE SUBMIT BUTTON */}
        <motion.button
          type="submit"
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-6 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 font-heading disabled:opacity-75"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>Generating AI Redesign...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate AI Redesign</span>
            </>
          )}
        </motion.button>

        {/* SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {generatedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>AI Redesign generated successfully! Check your recent designs gallery.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
