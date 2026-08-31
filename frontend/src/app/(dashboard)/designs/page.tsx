'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Heart,
  Star,
  X,
  Send,
  ArrowRight,
  Table,
  LayoutGrid,
  Download,
  MessageSquare,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import {
  marketplaceService,
  PublishedProjectData,
} from '@/services/marketplace.service';
import { ProjectCard } from '@/components/marketplace/ProjectCard';
import CommonPagination from '@/components/ui/CommonPagination';

// Curated initial published designs fallback if backend database is empty
const INITIAL_CURATED_DESIGNS: PublishedProjectData[] = [
  {
    _id: 'sample-design-1',
    title: 'Modern Minimalist Living Room Redesign',
    description: 'Complete transformation of a dim traditional living space into a bright, contemporary sanctuary featuring natural oak accents and ambient LED strip backlighting.',
    price: 29,
    originalPrice: 59,
    discount: 50,
    toolSlug: 'interior-design',
    roomType: 'Living Room',
    style: 'Modern Minimalist',
    sampleImageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80',
    beforeImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&q=80',
    totalImageCount: 4,
    tags: ['Minimalist', 'Oak Wood', 'Ambient Lighting'],
    salesCount: 38,
    wishlistCount: 42,
    rating: 4.9,
    reviewCount: 18,
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'Sophia Martinez',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        rating: 5,
        comment: 'Absolutely stunning living room layout! The color scheme matched my exact aesthetic.',
        createdAt: '2026-08-10T12:00:00Z',
      },
    ],
    author: {
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    _id: 'sample-design-2',
    title: 'Japandi Serenity Master Bedroom',
    description: 'Harmonious blend of Japanese wabi-sabi principles and Scandinavian functionality with low linen bedframe and acoustic wooden slat wall.',
    price: 39,
    originalPrice: 69,
    discount: 43,
    toolSlug: 'interior-design',
    roomType: 'Bedroom',
    style: 'Japandi',
    sampleImageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1000&q=80',
    beforeImageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c5172?w=1000&q=80',
    totalImageCount: 5,
    tags: ['Japandi', 'Master Bedroom', 'Linen Textures'],
    salesCount: 24,
    wishlistCount: 31,
    rating: 4.8,
    reviewCount: 14,
    reviews: [],
    author: {
      name: 'Liam Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    },
    createdAt: '2026-08-03T14:20:00Z',
  },
  {
    _id: 'sample-design-3',
    title: 'Luxury Marble & Brass Chef Kitchen',
    description: 'High-end kitchen overhaul featuring Calacatta marble waterfall island, brushed brass hardware, and custom dark navy cabinetry.',
    price: 0,
    originalPrice: 49,
    discount: 100,
    toolSlug: 'interior-design',
    roomType: 'Kitchen',
    style: 'Luxury',
    sampleImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&q=80',
    beforeImageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&q=80',
    totalImageCount: 6,
    tags: ['Kitchen', 'Marble Island', 'Brass Hardware'],
    salesCount: 89,
    wishlistCount: 95,
    rating: 5.0,
    reviewCount: 27,
    reviews: [],
    author: {
      name: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    createdAt: '2026-08-05T18:45:00Z',
  },
  {
    _id: 'sample-design-4',
    title: 'Industrial Executive Loft Office',
    description: 'Ergonomic workspace redesign with exposed brick walls, matte black metal framing, and warm overhead Edison pendant lighting.',
    price: 19,
    originalPrice: 39,
    discount: 51,
    toolSlug: 'interior-design',
    roomType: 'Office',
    style: 'Industrial',
    sampleImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80',
    beforeImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80',
    totalImageCount: 3,
    tags: ['Office', 'Industrial', 'Loft'],
    salesCount: 19,
    wishlistCount: 28,
    rating: 4.7,
    reviewCount: 9,
    reviews: [],
    author: {
      name: 'David Miller',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    },
    createdAt: '2026-08-07T11:10:00Z',
  },
];

const CATEGORY_FILTERS = [
  'All',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Office',
  'Villa',
  'Industrial',
  'Commercial',
];

export default function DesignsPage() {
  const { settings } = useSettings();

  // Published Showcase state
  const [publishedDesigns, setPublishedDesigns] = useState<PublishedProjectData[]>([]);
  const [isLoadingShowcase, setIsLoadingShowcase] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showcaseSearch, setShowcaseSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'newest'>('rating');
  const [viewMode, setViewMode] = useState<'masonry' | 'table'>('masonry');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal state
  const [selectedDetailDesign, setSelectedDetailDesign] = useState<PublishedProjectData | null>(null);
  const [detailBeforeSlider, setDetailBeforeSlider] = useState<number>(50);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Review Form state inside detail modal
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');

  // Load published designs showcase
  const loadPublishedShowcase = async () => {
    setIsLoadingShowcase(true);
    try {
      const fetched = await marketplaceService.getPublishedProjects({
        roomType: selectedCategory !== 'All' ? selectedCategory : undefined,
      });

      if (fetched && fetched.length > 0) {
        setPublishedDesigns(fetched);
      } else {
        setPublishedDesigns(INITIAL_CURATED_DESIGNS);
      }
    } catch (err) {
      console.warn('Fallback to curated designs:', err);
      setPublishedDesigns(INITIAL_CURATED_DESIGNS);
    } finally {
      setIsLoadingShowcase(false);
    }
  };

  useEffect(() => {
    loadPublishedShowcase();
  }, []);

  useEffect(() => {
    loadPublishedShowcase();
    setCurrentPage(1);
  }, [selectedCategory]);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [showcaseSearch, sortBy]);

  // Wishlist toggle handler
  const handleWishlistToggle = async (id: string) => {
    const userStr = localStorage.getItem('user');
    let userId = 'user-guest';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userId = u._id || u.id || userId;
      } catch {}
    }
    await marketplaceService.toggleWishlist(id, userId);
  };

  // Open Design Detail Modal
  const handleOpenDetailModal = (proj: PublishedProjectData) => {
    setSelectedDetailDesign(proj);
    setDetailBeforeSlider(50);
    setReviewRating(5);
    setReviewComment('');
    setReviewMessage('');
    setIsDetailModalOpen(true);
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-modal-open', 'true');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    if (typeof document !== 'undefined') {
      document.body.removeAttribute('data-modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailDesign) return;
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    setReviewMessage('');

    try {
      const userStr = localStorage.getItem('user');
      let userId = 'user-guest';
      let userName = 'Design Enthusiast';
      let userAvatar = '';
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          userId = u._id || u.id || userId;
          userName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || userName;
          userAvatar = u.avatar || u.avatarUrl || '';
        } catch {}
      }

      const res = await marketplaceService.addReview(selectedDetailDesign._id, {
        userId,
        userName,
        userAvatar,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res && selectedDetailDesign) {
        const newRev = {
          id: `r-${Date.now()}`,
          userId,
          userName,
          userAvatar,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
        };

        setSelectedDetailDesign({
          ...selectedDetailDesign,
          reviews: [newRev, ...(selectedDetailDesign.reviews || [])],
          reviewCount: (selectedDetailDesign.reviewCount || 0) + 1,
        });

        setReviewComment('');
        setReviewMessage('Thank you! Your review has been added.');
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setReviewMessage('Failed to post review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter & sort published showcase designs
  const filteredShowcase = publishedDesigns
    .filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        p.roomType.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(showcaseSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(showcaseSearch.toLowerCase())) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(showcaseSearch.toLowerCase())));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest')
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });

  // Calculate Paginated Array based on global settings limit
  const pageSize = settings.tablePaginationLimit || 10;
  const paginatedShowcase = filteredShowcase.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Showcase Controls & View Toggles */}
      <div className="space-y-4">
        {/* Top Bar: Search Input, View Toggle, Sort Dropdown */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search designs, room styles, tags..."
              value={showcaseSearch}
              onChange={(e) => setShowcaseSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
            />
            {showcaseSearch && (
              <button
                onClick={() => setShowcaseSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* View Mode Toggle Buttons */}
            <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('masonry')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === 'masonry'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Unsplash-Style Masonry Cards Layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Masonry Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Compact Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
            >
              <option value="rating">Highest Rated ★</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Published Designs Table Display */}
        {isLoadingShowcase ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading design gallery...</p>
          </div>
        ) : filteredShowcase.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No designs found matching your search
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing search filters or category selections above!
            </p>
          </div>
        ) : viewMode === 'masonry' ? (
          /* UNSPLASH / PINTEREST STYLE MASONRY CARDS GRID (PRESERVES EXACT NATURAL IMAGE SHAPE) */
          <div className="space-y-6">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {paginatedShowcase.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => handleOpenDetailModal(proj)}
                  className="break-inside-avoid relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                >
                  {/* NATURAL ASPECT RATIO IMAGE (NO CROPPING!) */}
                  <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={proj.sampleImageUrl}
                      alt={proj.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-3xl"
                    />

                    {/* TOP FLOATING OVERLAY: Room Type Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20 shadow-md">
                        {proj.roomType}
                      </span>
                    </div>

                    {/* TOP RIGHT QUICK ACTIONS: Download */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <a
                        href={proj.sampleImageUrl}
                        download={`${proj.title}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-white hover:bg-purple-600 transition-colors shadow-md"
                        title="Download HD Render"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* BOTTOM HOVER GRADIENT OVERLAY WITH TITLE & STYLE */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white space-y-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <h4 className="font-extrabold text-sm font-heading line-clamp-1 leading-snug text-white">
                        {proj.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                        <span className="text-purple-300 font-bold">{proj.style}</span>
                        <span className="inline-flex items-center gap-1 text-white font-bold group-hover:text-purple-300 transition-colors">
                          <span>View Render</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <CommonPagination
              currentPage={currentPage}
              totalItems={filteredShowcase.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          /* Sleek Admin-Style Data Table Container */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Design Render</th>
                    <th className="py-3.5 px-4">Category & Style</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {paginatedShowcase.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={proj.sampleImageUrl} alt={proj.title} className="w-14 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0" />
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white font-heading line-clamp-1 max-w-[200px] sm:max-w-[300px]">{proj.title}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-[300px]">{proj.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Room Category & Style */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800 inline-block">
                            {proj.roomType}
                          </span>
                          <p className="text-slate-400 font-medium text-[11px]">{proj.style}</p>
                        </div>
                      </td>

                      {/* Download & Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={proj.sampleImageUrl}
                            download={`${proj.title}.jpg`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-600 hover:text-white transition-all shadow-2xs"
                            title="Download Render Image"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(proj)}
                            className="px-3 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                          >
                            <span>View Showcase</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Common Pagination Component attached to bottom of Admin-style Table */}
            <CommonPagination
              currentPage={currentPage}
              totalItems={filteredShowcase.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* DESIGN DETAIL & REVIEWS MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && selectedDetailDesign && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950/85 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 scrollbar-none no-scrollbar"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors z-20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Header info */}
              <div className="space-y-2 pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
                    {selectedDetailDesign.roomType}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-800">
                    {selectedDetailDesign.style}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {selectedDetailDesign.title}
                </h2>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {(selectedDetailDesign.rating || 4.8).toFixed(1)} score
                  </span>
                  <span>({selectedDetailDesign.reviewCount || 0} customer reviews)</span>
                  <span>Designed by {selectedDetailDesign.author?.name || 'Designer'}</span>
                </div>
              </div>

              {/* Before/After Interactive Comparison Slider */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 select-none">
                <img
                  src={selectedDetailDesign.sampleImageUrl}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {selectedDetailDesign.beforeImageUrl && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${detailBeforeSlider}%` }}
                  >
                    <img
                      src={selectedDetailDesign.beforeImageUrl}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: '100%' }}
                    />
                    <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                      BEFORE PHOTO
                    </span>
                  </div>
                )}

                <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-bold text-blue-400 border border-blue-500/30">
                  AFTER REDESIGN
                </span>

                {/* Slider Handle */}
                {selectedDetailDesign.beforeImageUrl && (
                  <div
                    className="absolute top-0 bottom-0 z-30 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
                    style={{ left: `${detailBeforeSlider}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg">
                      ↔
                    </div>
                  </div>
                )}

                {/* Slider Range Input */}
                {selectedDetailDesign.beforeImageUrl && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={detailBeforeSlider}
                    onChange={(e) => setDetailBeforeSlider(Number(e.target.value))}
                    className="absolute inset-0 z-40 w-full h-full opacity-0 cursor-ew-resize"
                  />
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Room Transformation Blueprint
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    Curated AI Design & Style Inspiration
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleWishlistToggle(selectedDetailDesign._id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-rose-500 hover:text-rose-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" /> Save to Wishlist
                  </button>
                  <Link
                    href="/generate"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-colors shadow-md shadow-purple-600/30"
                  >
                    <Sparkles className="w-4 h-4" /> Try This Style in Studio
                  </Link>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" /> Ratings & Customer Reviews
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {selectedDetailDesign.reviews?.length || 0} Total
                  </span>
                </div>

                {/* Submit Review Form */}
                <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Write a Review & Rating
                  </span>

                  {/* Star Selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                      {reviewRating} Star{reviewRating > 1 ? 's' : ''}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    required
                    placeholder="Share your experience with this design layout..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />

                  {reviewMessage && (
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {reviewMessage}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="px-5 py-2 rounded-2xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {selectedDetailDesign.reviews?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to post!</p>
                  ) : (
                    selectedDetailDesign.reviews?.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              {rev.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {rev.userName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
