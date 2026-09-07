'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Trash2,
  ArrowRight,
  Search,
  Download,
  Star,
  StarHalf,
  X,
  Coins,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { marketplaceService, PublishedProjectData } from '@/services/marketplace.service';
import { projectService } from '@/services/project.service';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { triggerImageDownload } from '@/utils/download';
import PremiumAppLoader from '@/components/ui/PremiumAppLoader';
import CommonPagination from '@/components/ui/CommonPagination';

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

const formatRenderUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendOrigin}${cleanPath}`;
};

export default function WishlistPage() {
  const { settings } = useSettings();
  const { toast } = useToast();

  const [wishlistItems, setWishlistItems] = useState<PublishedProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal Portal State
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedDetailDesign, setSelectedDetailDesign] = useState<PublishedProjectData | null>(null);
  const [detailBeforeSlider, setDetailBeforeSlider] = useState<number>(50);
  const [detailFitMode, setDetailFitMode] = useState<'contain' | 'cover'>('contain');
  const [detailAspectRatio, setDetailAspectRatio] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Review Form inside Lightbox
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      let userId = 'user-guest';
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          userId = u._id || u.id || userId;
        } catch {}
      }

      // 1. Fetch user wishlist from backend
      let items = await marketplaceService.getUserWishlist(userId);

      // 2. Fetch local storage wishlisted designs fallback
      let storedIds: string[] = [];
      try {
        storedIds = JSON.parse(localStorage.getItem('user_wishlist_ids') || '[]');
      } catch (e) {}

      let localDesigns: PublishedProjectData[] = [];
      try {
        const storedGen = localStorage.getItem('user_generated_designs');
        if (storedGen) {
          localDesigns = JSON.parse(storedGen);
        }
      } catch (e) {}

      const wishlistedLocal = localDesigns.filter((d) => storedIds.includes(d._id));

      // 3. Fetch backend user rooms for wishlisted rooms fallback
      let backendRooms: any[] = [];
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || '';
        backendRooms = await projectService.getAllRooms(token);
      } catch (e) {}

      const wishlistedBackend = backendRooms
        .filter((r) => storedIds.includes(r._id || r.id))
        .map((r: any) => ({
          _id: r._id || r.id,
          title: r.name || `${r.roomType || 'Room'} ${r.theme || 'AI'} Redesign`,
          description: r.customInstructions || r.prompt || `AI architectural render output`,
          price: 0,
          toolSlug: r.toolSlug || 'interior-design',
          totalImageCount: (r.generatedImages && r.generatedImages.length) ? r.generatedImages.length : 1,
          roomType: r.roomType || 'Living Room',
          style: r.theme || 'Modern',
          sampleImageUrl: formatRenderUrl(r.generatedImage || (r.generatedImages && r.generatedImages[0]) || r.coverImage),
          beforeImageUrl: formatRenderUrl(r.originalImage),
          createdAt: r.createdAt || new Date().toISOString(),
        }));

      // Combine all wishlisted items, formatting URLs and deduplicating
      const combined = [...(items || []), ...wishlistedLocal, ...wishlistedBackend].map((item) => ({
        ...item,
        sampleImageUrl: formatRenderUrl(item.sampleImageUrl),
        beforeImageUrl: formatRenderUrl(item.beforeImageUrl),
      }));

      const unique = combined.filter(
        (item, index, self) =>
          item.sampleImageUrl && index === self.findIndex((t) => t.sampleImageUrl === item.sampleImageUrl || t._id === item._id)
      );

      setWishlistItems(unique);
    } catch (err) {
      console.warn('Failed to load wishlist:', err);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Remove single item from wishlist
  const handleRemoveItem = async (id: string, title?: string) => {
    const userStr = localStorage.getItem('user');
    let userId = 'user-guest';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userId = u._id || u.id || userId;
      } catch {}
    }

    await marketplaceService.toggleWishlist(id, userId);
    setWishlistItems((prev) => prev.filter((item) => item._id !== id));
    toast.info(title ? `"${title}" removed from wishlist` : 'Removed from wishlist');
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    const userStr = localStorage.getItem('user');
    let userId = 'user-guest';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userId = u._id || u.id || userId;
      } catch {}
    }

    for (const item of wishlistItems) {
      await marketplaceService.toggleWishlist(item._id, userId);
    }
    localStorage.removeItem('user_wishlist_ids');
    setWishlistItems([]);
    toast.info('Wishlist cleared');
  };

  // Lightbox Aspect Ratio Handler
  useEffect(() => {
    if (!selectedDetailDesign) return;
    const targetSrc = selectedDetailDesign.sampleImageUrl || selectedDetailDesign.beforeImageUrl;
    if (!targetSrc) return;
    const img = new Image();
    img.src = targetSrc;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
        setDetailAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
  }, [selectedDetailDesign]);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailDesign || !reviewComment.trim()) return;

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
        toast.success('Review submitted successfully!');
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setReviewMessage('Failed to post review. Please try again.');
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter & Sort Wishlist items
  const filteredWishlist = wishlistItems
    .filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        item.roomType?.toLowerCase() === selectedCategory.toLowerCase() ||
        item.style?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.style && item.style.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const pageSize = settings.tablePaginationLimit || 9;
  const paginatedWishlist = filteredWishlist.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const uniqueStylesCount = new Set(wishlistItems.map((i) => i.style).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-xs">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> Saved Collection
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/15">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Design' : 'Designs'}
            </span>
            {uniqueStylesCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                {uniqueStylesCount} Unique Styles
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Your Saved Wishlist
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Keep track of your favorite room designs, architectural palettes, and AI transformation blueprints in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearWishlist}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all shadow-xs cursor-pointer font-heading"
              title="Clear All Wishlist Items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <Link
            href="/designs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition-all shadow-sm font-heading cursor-pointer"
          >
            <span>Explore Designs</span>
            <ArrowRight className="w-4 h-4 text-purple-600" />
          </Link>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search saved designs, room types, or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-xs"
            >
              <option value="newest">Recently Saved</option>
              <option value="rating">Highest Rated ★</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-heading ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-purple-400/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid / Empty State */}
      {loading ? (
        <div className="py-16">
          <PremiumAppLoader size="md" />
        </div>
      ) : filteredWishlist.length === 0 ? (
        <div className="rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              {wishlistItems.length === 0 ? 'Your wishlist is currently empty' : 'No matching saved designs found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {wishlistItems.length === 0
                ? 'Explore community room designs, tap the heart icon on any design card, and collect your favorite inspirations here.'
                : 'Try adjusting your search query or category filter to view your saved designs.'}
            </p>
          </div>
          <Link
            href="/designs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all font-heading"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Explore Room Designs</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedWishlist.map((item) => (
              <div
                key={item._id}
                onClick={() => handleOpenDetailModal(item)}
                className="group rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-52 w-full bg-slate-950 overflow-hidden rounded-t-[10px]">
                  <img
                    src={item.sampleImageUrl}
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left Room Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/30 shadow-md">
                      {item.roomType || 'Room'}
                    </span>
                  </div>

                  {/* Top Right Actions: Heart Remove & Download */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item._id, item.title);
                      }}
                      className="p-2 rounded-full bg-rose-500 text-white shadow-md hover:scale-110 transition-transform cursor-pointer border border-rose-400"
                      title="Remove from Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerImageDownload(item.sampleImageUrl, `${item.title || 'design'}.png`);
                      }}
                      className="p-2 rounded-full bg-slate-950/80 hover:bg-purple-600 text-white shadow-md transition-colors cursor-pointer border border-white/20"
                      title="Download HD Render"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Gradient Title Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent text-white space-y-1">
                    <h4 className="font-extrabold text-sm font-heading line-clamp-1 text-white">
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-bold text-purple-300">
                      {item.style || 'Modern'}
                    </span>
                  </div>
                </div>

                {/* Card Content & Action Bar */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description && !item.description.toLowerCase().includes('8k uhd')
                      ? item.description
                      : `${item.style || 'Modern'} room transformation for ${item.roomType || 'space'}`}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-heading">
                      <Eye className="w-3.5 h-3.5 text-purple-600" /> Details
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(item)}
                      className="px-3.5 py-1.5 rounded-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-extrabold text-xs hover:bg-purple-600 hover:text-white transition-all font-heading"
                    >
                      View Design
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <CommonPagination
            currentPage={currentPage}
            totalItems={filteredWishlist.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            className="bg-transparent border-0 shadow-none px-0 py-2"
          />
        </div>
      )}

      {/* DESIGN LIGHTBOX POPUP MODAL (PORTALED DIRECTLY TO BODY) */}
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
              className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 scrollbar-none no-scrollbar my-auto"
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

              {/* Header Info */}
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

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(selectedDetailDesign._id, selectedDetailDesign.title)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition-all font-heading cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from Wishlist</span>
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {selectedDetailDesign.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedDetailDesign.description && !selectedDetailDesign.description.toLowerCase().includes('8k uhd')
                    ? selectedDetailDesign.description
                    : `${selectedDetailDesign.style || 'Modern'} architectural transformation for ${selectedDetailDesign.roomType || 'space'}`}
                </p>
              </div>

              {/* Before/After Comparison Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400 font-heading">Interactive Before/After Comparison</span>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDetailFitMode('contain')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer font-heading ${
                        detailFitMode === 'contain'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Uncropped (Auto Height)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailFitMode('cover')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer font-heading ${
                        detailFitMode === 'cover'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Fill Area (Fixed Height)
                    </button>
                  </div>
                </div>

                <div
                  className={`relative w-full rounded-[10px] overflow-hidden bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 select-none shadow-xl flex items-center justify-center transition-all duration-300 ${
                    detailFitMode === 'cover'
                      ? 'h-[480px] sm:h-[580px]'
                      : 'min-h-[350px] max-h-[70vh]'
                  }`}
                  style={
                    detailFitMode === 'contain'
                      ? { aspectRatio: detailAspectRatio ? `${detailAspectRatio}` : '4/3' }
                      : undefined
                  }
                >
                  <img
                    src={selectedDetailDesign.sampleImageUrl}
                    alt="After Redesign"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="absolute inset-0 w-full h-full rounded-[10px] transition-all duration-200 object-cover"
                  />

                  {selectedDetailDesign.beforeImageUrl && selectedDetailDesign.beforeImageUrl !== selectedDetailDesign.sampleImageUrl ? (
                    <div
                      className="absolute inset-0 overflow-hidden rounded-[10px] z-10"
                      style={{ clipPath: `polygon(0 0, ${detailBeforeSlider}% 0, ${detailBeforeSlider}% 100%, 0 100%)` }}
                    >
                      <img
                        src={selectedDetailDesign.beforeImageUrl}
                        alt="Before Photo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop';
                        }}
                        className="absolute inset-0 w-full h-full rounded-[10px] transition-all duration-200 object-cover"
                      />
                      <span className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-purple-950/85 backdrop-blur-md text-xs font-extrabold text-purple-200 border border-purple-400/40 uppercase tracking-wider font-heading shadow-md">
                        Before Photo
                      </span>
                    </div>
                  ) : (
                    <span className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-purple-950/85 backdrop-blur-md text-xs font-extrabold text-purple-200 border border-purple-400/40 uppercase tracking-wider font-heading shadow-md">
                      Original Source Render
                    </span>
                  )}

                  <span className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md border border-purple-400/30 uppercase tracking-wider font-heading">
                    After Redesign
                  </span>

                  {selectedDetailDesign.beforeImageUrl && (
                    <div
                      className="absolute top-0 bottom-0 z-30 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
                      style={{ left: `${detailBeforeSlider}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg border border-slate-200">
                        ↔
                      </div>
                    </div>
                  )}

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
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider font-heading">
                    Saved Blueprint
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-heading">
                    Curated Design Style & Architectural Render
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => triggerImageDownload(selectedDetailDesign.sampleImageUrl, `${selectedDetailDesign.title || 'redesign'}.png`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all font-heading cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-purple-600" />
                    <span>Download</span>
                  </button>
                  <Link
                    href={`/generate?roomType=${encodeURIComponent(selectedDetailDesign.roomType || '')}&style=${encodeURIComponent(selectedDetailDesign.style || '')}&presetImage=${encodeURIComponent(selectedDetailDesign.beforeImageUrl || selectedDetailDesign.sampleImageUrl || '')}&desc=${encodeURIComponent(selectedDetailDesign.description || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-colors shadow-md shadow-purple-600/30 font-heading cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Try This Style in Studio</span>
                  </Link>
                </div>
              </div>

              {/* Rating & Review Section */}
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

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFull = reviewRating >= star;
                        const isHalf = reviewRating === star - 0.5;
                        return (
                          <div key={star} className="relative inline-flex items-center group">
                            <button
                              type="button"
                              onClick={() => setReviewRating(star - 0.5)}
                              className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                              title={`Rate ${star - 0.5} Stars`}
                            />
                            <button
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                              title={`Rate ${star} Stars`}
                            />
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-sm font-heading cursor-pointer"
                    >
                      <span>Submit Review</span>
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

