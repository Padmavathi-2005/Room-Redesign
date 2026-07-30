'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

const DESIGN_STYLES = [
  { id: 'Modern', label: 'Modern', description: 'Clean lines & neutral elegance' },
  { id: 'Scandinavian', label: 'Scandinavian', description: 'Bright, airy & light oak' },
  { id: 'Industrial', label: 'Industrial', description: 'Exposed brick & dark steel' },
  { id: 'Minimalist', label: 'Minimalist', description: 'Clutter-free & spacious' },
  { id: 'Bohemian', label: 'Bohemian', description: 'Woven rugs & lush plants' },
  { id: 'Traditional', label: 'Traditional', description: 'Classic molding & rich woods' },
  { id: 'Contemporary', label: 'Contemporary', description: 'State-of-the-art artistic' },
  { id: 'Mid-Century', label: 'Mid-Century', description: 'Retro 1950s walnut & teal' },
  { id: 'Japandi', label: 'Japandi', description: 'Wabi-sabi warm minimalism' },
  { id: 'Art Deco', label: 'Art Deco', description: 'Geometric gold & velvet' },
];

const ROOM_TYPES = [
  'Living Room',
  'Master Bedroom',
  'Kitchen',
  'Bathroom',
  'Home Office',
  'Dining Room',
];

const ROOM_SIZES = [
  { id: 'Small', label: 'Small (< 150 sq ft)' },
  { id: 'Medium', label: 'Medium (150 - 300 sq ft)' },
  { id: 'Large', label: 'Large (300 - 600 sq ft)' },
  { id: 'Open Concept', label: 'Open Concept (> 600 sq ft)' },
];

export default function GenerateStudioPage() {
  const [selectedRoomType, setSelectedRoomType] = useState<string>('Living Room');
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [selectedSize, setSelectedSize] = useState<string>('Medium');
  const [customRequirements, setCustomRequirements] = useState<string>('');
  const [preserveStructure, setPreserveStructure] = useState<boolean>(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop'
  );
  
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

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
    setIsGenerating(true);

    try {
      const response = await fetch('/api/v1/rooms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: uploadedImage,
          toolSlug: 'interior-design',
          roomType: selectedRoomType,
          theme: selectedStyle,
          designStyle: selectedStyle,
          roomSize: selectedSize,
          customRequirements,
          preserveStructure,
        }),
      });

      const resData = await response.json();
      if (resData._id || resData.generatedImage || resData.data) {
        const output = resData.generatedImage || resData.data?.generatedImage;
        setGeneratedResult(output || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
        setCompiledPrompt(resData.prompt || resData.data?.prompt || '');
      } else {
        // Fallback demo render
        setGeneratedResult('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
      }
    } catch (err) {
      // Fallback demo render on connection error
      setGeneratedResult('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-20 pb-16 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Studio Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-blue-100 text-blue-800">
                AI Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Interior Design AI
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transform room photos while strictly preserving windows, doors, and structural layout.
            </p>
          </div>

          {/* Credits Balance Badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-800">400 Credits Available</span>
            </div>
          </div>
        </div>

        {/* Studio Main Grid: Left Control Panel (Form) vs Right Result Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Controls (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Step 1: Upload Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>1. Upload Room Photo</span>
                <span className="text-[10px] text-slate-400 font-normal">JPG, PNG up to 10MB</span>
              </label>

              {uploadedImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                  <img
                    src={uploadedImage}
                    alt="Original Room"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 transition-all">
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Click to upload room photo</span>
                  <span className="text-[10px] text-slate-400 mt-1">or drag and drop file here</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Step 2: Room Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Room Type
              </label>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Design Style Dropdown (Matching User Screenshot!) */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-lime-600" />
                <span>Design Style</span>
              </label>

              <button
                type="button"
                onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100/80 border-2 border-lime-500/80 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none hover:bg-slate-100 transition-all"
              >
                <span>{selectedStyle}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isStyleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom Styled Dropdown List */}
              <AnimatePresence>
                {isStyleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto p-1.5 space-y-1"
                  >
                    {DESIGN_STYLES.map((style) => {
                      const isSelected = style.id === selectedStyle;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setSelectedStyle(style.id);
                            setIsStyleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-xl transition-all ${
                            isSelected
                              ? 'bg-lime-500/15 text-lime-800 font-bold'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{style.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{style.description}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-lime-600" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 4: Room Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Room Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      selectedSize === size.id
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Custom Requirements Input Box (Matching User Screenshot!) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-lime-600" />
                <span>Custom Requirements</span>
              </label>
              <textarea
                rows={3}
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="Describe your specific needs, preferences, or constraints (e.g. keep window on left wall, dark gray velvet sofa, warm oak coffee table)..."
                className="w-full p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-none"
              />
            </div>

            {/* Step 6: Architectural Preservation Safeguard */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Preserve Windows & Doors</div>
                  <div className="text-[10px] text-slate-500">Locks structural layout & room dimensions</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preserveStructure}
                onChange={(e) => setPreserveStructure(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating || !uploadedImage}
              onClick={handleGenerate}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-lime-500 to-yellow-400 hover:opacity-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating AI Redesign...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Generate Interior Redesign (4 Credits)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Result Viewer Column (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    AI Redesign Interactive Viewer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Drag the slider to compare original room vs AI redesigned space.
                  </p>
                </div>

                {generatedResult && (
                  <a
                    href={generatedResult}
                    download="redesign_render.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HD</span>
                  </a>
                )}
              </div>

              {/* Interactive Before / After Split View */}
              <div className="relative w-full h-[420px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 select-none">
                {generatedResult ? (
                  <>
                    {/* Rendered Output (Base Layer) */}
                    <img
                      src={generatedResult}
                      alt="AI Redesign"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Original Upload Image (Top Clipped Layer) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={uploadedImage || ''}
                        alt="Original Upload"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ width: '100%', maxWidth: 'none' }}
                      />
                    </div>

                    {/* Split Line & Drag Handle */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border border-slate-300 flex items-center justify-center text-xs font-bold">
                        ↔
                      </div>
                    </div>

                    {/* Drag Input Range Overlay */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    />

                    {/* Corner Labels */}
                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-bold rounded-lg pointer-events-none">
                      Before (Original)
                    </div>
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-lime-500 text-slate-950 font-bold text-[11px] rounded-lg shadow-md pointer-events-none">
                      After ({selectedStyle} AI)
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
                    <ImageIcon className="w-12 h-12 text-slate-600 stroke-1" />
                    <div>
                      <div className="text-sm font-semibold text-slate-300">Ready to Redesign Your Room</div>
                      <div className="text-xs text-slate-500 max-w-sm mt-1">
                        Select your design style and click "Generate Interior Redesign" to render your space.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compiled Prompt Detail Box */}
              {compiledPrompt && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                    <span>Compiled AI Prompt Engine Output</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200/60">
                    {compiledPrompt}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
