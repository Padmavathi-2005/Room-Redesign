'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Heart,
  Star,
  StarHalf,
  X,
  Send,
  ArrowRight,
  Table,
  LayoutGrid,
  Download,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import {
  marketplaceService,
  PublishedProjectData,
} from '@/services/marketplace.service';
import { ProjectCard } from '@/components/marketplace/ProjectCard';
import CommonPagination from '@/components/ui/CommonPagination';

import { projectService } from '@/services/project.service';

// Curated initial published designs fallback (empty so hardcoded sample images never show up)
const INITIAL_CURATED_DESIGNS: PublishedProjectData[] = [];

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
  const [sortBy, setSortBy] = useState<'rating' | 'newest'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Mounted state for body portal rendering
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedDetailDesign, setSelectedDetailDesign] = useState<PublishedProjectData | null>(null);
  const [detailBeforeSlider, setDetailBeforeSlider] = useState<number>(50);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Review Form state inside detail modal
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');

  // Load user's REAL generated designs showcase
  const loadPublishedShowcase = async () => {
    setIsLoadingShowcase(true);
    try {
      // 1. Load locally generated designs from localStorage
      let localDesigns: PublishedProjectData[] = [];
      try {
        const stored = localStorage.getItem('user_generated_designs');
        if (stored) {
          localDesigns = JSON.parse(stored);
        }
      } catch (e) {}

      // 2. Load backend user rooms
      let backendRooms: any[] = [];
      try {
        backendRooms = await projectService.getAllRooms();
      } catch (e) {}

      const formattedRooms: PublishedProjectData[] = (backendRooms || []).map((r: any) => ({
        _id: r._id || r.id || `room-${Math.random()}`,
        title: r.name || `${r.roomType || 'Room'} ${r.theme || 'AI'} Redesign`,
        description: r.customInstructions || r.prompt || `AI architectural render output`,
        price: 0,
        toolSlug: r.toolSlug || 'interior-design',
        totalImageCount: 1,
        roomType: r.roomType || 'Living Room',
        style: r.theme || 'Modern',
        sampleImageUrl: r.generatedImage || r.coverImage || r.originalImage,
        beforeImageUrl: r.originalImage,
        createdAt: r.createdAt || new Date().toISOString(),
      }));

      // Combine local & backend designs
      const combined = [...localDesigns, ...formattedRooms];

      // Filter by room category if selected
      const filtered = combined.filter((item) => {
        if (!item.sampleImageUrl) return false;
        if (selectedCategory === 'All') return true;
        return item.roomType?.toLowerCase() === selectedCategory.toLowerCase() || item.style?.toLowerCase() === selectedCategory.toLowerCase();
      });

      // Deduplicate items by sampleImageUrl
      const uniqueDesigns = filtered.filter((item, index, self) =>
        index === self.findIndex((t) => t.sampleImageUrl === item.sampleImageUrl)
      );

      setPublishedDesigns(uniqueDesigns);
    } catch (err) {
      console.warn('Error loading real user designs:', err);
      setPublishedDesigns([]);
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

  // Cleanup body attributes on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.removeAttribute('data-modal-open');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    };
  }, []);

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
        ) : (
          /* UNSPLASH / PINTEREST STYLE MASONRY CARDS GRID (2 PER ROW WITH ROUNDED-LG BORDER RADIUS) */
          <div className="space-y-6">
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {paginatedShowcase.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => handleOpenDetailModal(proj)}
                  className="break-inside-avoid relative rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                >
                  {/* NATURAL ASPECT RATIO IMAGE (WITH SMOOTH SKELETON LOADING BACKGROUND!) */}
                  <div className="relative w-full min-h-[220px] overflow-hidden bg-slate-200 dark:bg-slate-800/80 rounded-lg">
                    <img
                      src={proj.sampleImageUrl}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg relative z-10"
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
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white space-y-1.5 opacity-90 group-hover:opacity-100 transition-opacity rounded-b-lg">
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
              className="bg-transparent border-0 shadow-none px-0 py-2"
            />
          </div>
        )}
      </div>

      {/* DESIGN SHOWCASE LIGHTBOX POPUP MODAL (PORTALED DIRECTLY TO BODY TO ELIMINATE TOP BLEED) */}
      {isMounted && isDetailModalOpen && selectedDetailDesign && createPortal(
        <AnimatePresence>
          <div
            onClick={handleCloseDetailModal}
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999999] flex items-center justify-center p-4 sm:p-6 sm:p-8 overflow-y-auto bg-slate-950/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 scrollbar-none no-scrollbar my-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="absolute top-6 right-6 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors z-20 cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Header info */}
              <div className="space-y-2 pr-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-extrabold border border-purple-200 dark:border-purple-800 font-heading">
                      {selectedDetailDesign.roomType}
                    </span>
                    <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold border border-slate-200 dark:border-slate-700 font-heading">
                      {selectedDetailDesign.style}
                    </span>
                  </div>

                  <Link
                    href={`/generate?roomType=${encodeURIComponent(selectedDetailDesign.roomType || '')}&style=${encodeURIComponent(selectedDetailDesign.style || '')}&presetImage=${encodeURIComponent(selectedDetailDesign.beforeImageUrl || selectedDetailDesign.sampleImageUrl || '')}&generatedImage=${encodeURIComponent(selectedDetailDesign.sampleImageUrl || '')}&desc=${encodeURIComponent(selectedDetailDesign.description || '')}&autoView=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/30 transition-all font-heading cursor-pointer"
                    title="Open Full Studio Generation View in New Tab"
                  >
                    <span>View Generation Details</span>
                  </Link>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {selectedDetailDesign.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedDetailDesign.description && !selectedDetailDesign.description.toLowerCase().includes('8k uhd') && !selectedDetailDesign.description.toLowerCase().includes('consistency')
                    ? selectedDetailDesign.description
                    : `${selectedDetailDesign.style || 'Modern'} architectural transformation for ${selectedDetailDesign.roomType || 'space'}`}
                </p>
              </div>

              {/* Before/After Interactive Comparison Slider */}
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 select-none shadow-md">
                <img
                  src={selectedDetailDesign.sampleImageUrl}
                  alt="After Redesign"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />

                {selectedDetailDesign.beforeImageUrl && selectedDetailDesign.beforeImageUrl !== selectedDetailDesign.sampleImageUrl ? (
                  <div
                    className="absolute inset-0 overflow-hidden rounded-lg z-10"
                    style={{ clipPath: `polygon(0 0, ${detailBeforeSlider}% 0, ${detailBeforeSlider}% 100%, 0 100%)` }}
                  >
                    <img
                      src={selectedDetailDesign.beforeImageUrl}
                      alt="Before Photo"
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                    <span className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-md bg-purple-950/85 backdrop-blur-md text-xs font-extrabold text-purple-200 border border-purple-400/40 uppercase tracking-wider font-heading shadow-md">
                      Before Photo
                    </span>
                  </div>
                ) : (
                  <span className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-md bg-purple-950/85 backdrop-blur-md text-xs font-extrabold text-purple-200 border border-purple-400/40 uppercase tracking-wider font-heading shadow-md">
                    Original Source Render
                  </span>
                )}

                <span className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md border border-purple-400/30 uppercase tracking-wider font-heading">
                  After Redesign
                </span>

                {/* Slider Handle */}
                {selectedDetailDesign.beforeImageUrl && (
                  <div
                    className="absolute top-0 bottom-0 z-30 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
                    style={{ left: `${detailBeforeSlider}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg border border-slate-200">
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider font-heading">
                    AI Architectural Transformation
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-heading">
                    Curated Design Style & Architectural Render
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={selectedDetailDesign.sampleImageUrl}
                    download={`${selectedDetailDesign.title}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all font-heading"
                  >
                    <Download className="w-4 h-4 text-purple-600" />
                    <span>Download</span>
                  </a>
                  <Link
                    href={`/generate?roomType=${encodeURIComponent(selectedDetailDesign.roomType || '')}&style=${encodeURIComponent(selectedDetailDesign.style || '')}&presetImage=${encodeURIComponent(selectedDetailDesign.beforeImageUrl || selectedDetailDesign.sampleImageUrl || '')}&desc=${encodeURIComponent(selectedDetailDesign.description || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-colors shadow-md shadow-purple-600/30 font-heading cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Try This Style in Studio</span>
                  </Link>
                </div>
              </div>

              {/* Rating & Review Feedback Section for this Generated Image */}
              <div className="p-5 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-200/50 dark:border-purple-800/40 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Rate & Review This AI Render</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      How accurate and high-quality is this {selectedDetailDesign.style} {selectedDetailDesign.roomType} transformation?
                    </p>
                  </div>

                  {/* 5-Star Selector (Supports Half-Stars 0.5 to 5.0!) */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFull = reviewRating >= star;
                        const isHalf = reviewRating === star - 0.5;
                        return (
                          <div key={star} className="relative inline-flex items-center group">
                            {/* Left Half Click Zone (.5) */}
                            <button
                              type="button"
                              onClick={() => setReviewRating(star - 0.5)}
                              className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                              title={`Rate ${star - 0.5} Stars`}
                            />
                            {/* Right Half Click Zone (.0) */}
                            <button
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                              title={`Rate ${star} Stars`}
                            />

                            {/* Star Icon Rendering */}
                            {isFull ? (
                              <Star className="w-5 h-5 text-amber-400 fill-amber-400 transition-transform group-hover:scale-110" />
                            ) : isHalf ? (
                              <StarHalf className="w-5 h-5 text-amber-400 fill-amber-400 transition-transform group-hover:scale-110" />
                            ) : (
                              <Star className="w-5 h-5 text-slate-300 dark:text-slate-600 transition-transform group-hover:scale-110" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 font-heading min-w-[55px]">
                      {reviewRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>

                {/* Review Message Form */}
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write a review message or feedback for this generated image..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                  <div className="flex items-center justify-between">
                    {reviewMessage ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewMessage}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Your rating & review helps improve site AI design quality.
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-sm font-heading cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
