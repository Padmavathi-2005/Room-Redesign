'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Sparkles,
  Search,
  Wand2,
  CheckCircle2,
  ArrowRight,
  Filter,
  Eye,
  Sliders,
  Star,
} from 'lucide-react';
import CommonPagination from '@/components/ui/CommonPagination';
import { useSettings } from '@/context/SettingsContext';

interface RoomTemplate {
  id: string;
  title: string;
  category: string;
  style: string;
  description: string;
  image: string;
  popular?: boolean;
  toolSlug: string;
  colorPalette: string[];
  recommendedLighting: string;
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Biophilic Sunlit Oasis',
    category: 'Living Room',
    style: 'Biophilic',
    description: 'Abundant natural lighting, lush floor plants, warm organic timber furniture, and soft linen upholstery.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    popular: true,
    toolSlug: 'interior-design',
    colorPalette: ['#EAE5D9', '#7C9070', '#3F4E4F', '#D8C4B6'],
    recommendedLighting: 'Warm Sunlit Natural Glow (4500K)',
  },
  {
    id: 'tmpl-2',
    title: 'Warm Japandi Master Bedroom',
    category: 'Bedroom',
    style: 'Japandi',
    description: 'Low minimalist wooden platform bed, acoustic wood slat feature wall, wabi-sabi ceramic decor, and ambient soft lighting.',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    popular: true,
    toolSlug: '3d-floor-plan',
    colorPalette: ['#F5F5F7', '#D4C3B3', '#8B7E74', '#4A403A'],
    recommendedLighting: 'Soft Ambient Diffused Evening',
  },
  {
    id: 'tmpl-3',
    title: 'Calacatta Marble Chef Kitchen',
    category: 'Kitchen',
    style: 'Luxury Modern',
    description: 'Bookmatched Calacatta marble waterfall island, brushed brass hardware, concealed cabinetry, and architectural pendant lighting.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    popular: true,
    toolSlug: 'interior-design',
    colorPalette: ['#FFFFFF', '#1A1A1A', '#C5A880', '#808080'],
    recommendedLighting: 'Architectural Warm Downlights (3000K)',
  },
  {
    id: 'tmpl-4',
    title: 'Executive Industrial Loft Office',
    category: 'Office',
    style: 'Industrial',
    description: 'Exposed brick accent wall, matte black steel framework, solid walnut executive desk, and warm Edison bulb pendants.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
    popular: false,
    toolSlug: '3d-floor-plan',
    colorPalette: ['#2B2B2B', '#8C6239', '#5A5A5A', '#D9C5B2'],
    recommendedLighting: 'Warm Edison Focal Glow',
  },
  {
    id: 'tmpl-5',
    title: 'Scandinavian Minimalist Lounge',
    category: 'Living Room',
    style: 'Scandinavian',
    description: 'Clean light oak wood flooring, neutral bouclé curved sofa, monochrome art prints, and cozy knitted textures.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    popular: false,
    toolSlug: 'interior-design',
    colorPalette: ['#FAF9F6', '#E5E4E2', '#C0C0C0', '#41424C'],
    recommendedLighting: 'Bright Daylight Balanced',
  },
  {
    id: 'tmpl-6',
    title: 'Modern Coastal Villa Suite',
    category: 'Villa',
    style: 'Coastal Modern',
    description: 'Panoramic glass sliders, whitewashed oak beams, rattan woven accents, and soft oceanic blue throw cushions.',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    popular: false,
    toolSlug: 'interior-design',
    colorPalette: ['#FFFFFF', '#E0F2FE', '#CBD5E1', '#78716C'],
    recommendedLighting: 'Ocean Breeze Daylight',
  },
];

const CATEGORIES = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Office', 'Villa'];

export default function TemplatesPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTemplates = ROOM_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pageSize = settings.tablePaginationLimit || 10;
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApplyTemplate = (tmpl: RoomTemplate) => {
    router.push(`/generate?presetStyle=${encodeURIComponent(tmpl.style)}&roomType=${encodeURIComponent(tmpl.category)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Design Templates ({filteredTemplates.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose from professionally curated architectural style presets to instantly launch your room redesign.
          </p>
        </div>

        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-xs transition-all self-start sm:self-auto"
        >
          <Wand2 className="w-4 h-4" />
          <span>Open AI Studio</span>
        </Link>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates, styles, materials..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sleek Admin-Style Data Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Template Render</th>
                <th className="py-3.5 px-4">Category & Style</th>
                <th className="py-3.5 px-4">Color Palette</th>
                <th className="py-3.5 px-4">Lighting</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedTemplates.map((tmpl) => (
                <tr key={tmpl.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  {/* Template Thumbnail & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tmpl.image}
                        alt={tmpl.title}
                        className="w-14 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white font-heading line-clamp-1 max-w-[200px] sm:max-w-[280px]">
                            {tmpl.title}
                          </h4>
                          {tmpl.popular && (
                            <span className="px-2 py-0.2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] border border-amber-200 dark:border-amber-800 shrink-0">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-[280px]">
                          {tmpl.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category & Style */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800 inline-block">
                        {tmpl.category}
                      </span>
                      <p className="text-slate-400 font-medium text-[11px]">{tmpl.style}</p>
                    </div>
                  </td>

                  {/* Color Palette Swatches */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {tmpl.colorPalette.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Lighting */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium text-[11px] whitespace-nowrap">
                    {tmpl.recommendedLighting}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Common Pagination Component */}
        <CommonPagination
          currentPage={currentPage}
          totalItems={filteredTemplates.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
