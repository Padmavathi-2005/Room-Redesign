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
} from 'lucide-react';
import { marketplaceService, PublishedProjectData } from '@/services/marketplace.service';
import { projectService } from '@/services/project.service';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { triggerImageDownload } from '@/utils/download';
import PremiumAppLoader from '@/components/ui/PremiumAppLoader';
import CommonPagination from '@/components/ui/CommonPagination';
import { useTranslation } from '@/context/LanguageContext';

const CATEGORY_ITEMS = [
  { id: 'All', key: 'designs.categories.all' },
  { id: 'Living Room', key: 'designs.categories.livingRoom' },
  { id: 'Bedroom', key: 'designs.categories.bedroom' },
  { id: 'Kitchen', key: 'designs.categories.kitchen' },
  { id: 'Office', key: 'designs.categories.office' },
  { id: 'Villa', key: 'designs.categories.villa' },
  { id: 'Industrial', key: 'designs.categories.industrial' },
  { id: 'Commercial', key: 'designs.categories.commercial' },
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
  const { t } = useTranslation();
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

  const getLocalizedRoomType = (roomType?: string) => {
    if (!roomType) return '';
    const norm = roomType.toLowerCase().replace(/[\s_-]/g, '');
    const map: Record<string, string> = {
      all: t('designs.categories.all'),
      livingroom: t('designs.categories.livingRoom'),
      bedroom: t('designs.categories.bedroom'),
      kitchen: t('designs.categories.kitchen'),
      office: t('designs.categories.office'),
      villa: t('designs.categories.villa'),
      industrial: t('designs.categories.industrial'),
      commercial: t('designs.categories.commercial'),
    };
    return map[norm] || map[roomType] || roomType;
  };

  const getLocalizedStyle = (style?: string) => {
    if (!style) return '';
    const styleKey = style.toLowerCase().replace(/[\s_-]/g, '');
    const directName = t(`styles.${style.toLowerCase()}.name` as any);
    if (directName && !directName.startsWith('styles.')) {
      return directName;
    }
    const normName = t(`styles.${styleKey}.name` as any);
    if (normName && !normName.startsWith('styles.')) {
      return normName;
    }
    return style;
  };

  const getLocalizedTitle = (design?: PublishedProjectData | null) => {
    if (!design) return '';
    const localizedRoom = getLocalizedRoomType(design.roomType);
    const localizedStyle = getLocalizedStyle(design.style);
    const isAutoTitle =
      !design.title ||
      design.title.toLowerCase().includes('redesign') ||
      (design.roomType && design.title.toLowerCase().includes(design.roomType.toLowerCase()));

    if (isAutoTitle && (localizedRoom || localizedStyle)) {
      return t('designs.modal.redesignTitle', {
        roomType: localizedRoom || design.roomType || '',
        style: localizedStyle || design.style || '',
      });
    }
    return design.title;
  };

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
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const pageSize = settings.tablePaginationLimit || 10;
  const paginatedWishlist = filteredWishlist.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Showcase Controls & View Toggles */}
      <div className="space-y-4">
        {/* Top Bar: Search Input & Sort Dropdown */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('designs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
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

          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
            >
              <option value="newest">{t('designs.newestFirst')}</option>
              <option value="rating">{t('designs.highestRated')}</option>
            </select>

            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearWishlist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs cursor-pointer font-heading"
                title={t('designs.clearAll')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('designs.clearAll')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_ITEMS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-extrabold border border-blue-400/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {t(cat.key)}
            </button>
          ))}
        </div>

        {/* MASONRY CARDS GRID / EMPTY STATE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-[10px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="p-12 text-center rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="p-3 w-12 h-12 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              {wishlistItems.length === 0 ? 'Your Wishlist is Empty' : 'No Matching Saved Designs Found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {wishlistItems.length === 0
                ? 'Explore community room designs, tap the heart icon on any design card, and collect your favorite inspirations here.'
                : 'Try adjusting your search query or category filter to view your saved designs.'}
            </p>
            <Link
              href="/designs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md font-heading"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Explore Room Designs</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {paginatedWishlist.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => handleOpenDetailModal(proj)}
                  className="break-inside-avoid relative rounded-[10px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                >
                  {/* NATURAL ASPECT RATIO IMAGE */}
                  <div className="relative w-full min-h-[220px] overflow-hidden bg-slate-200 dark:bg-slate-800/80 rounded-[10px]">
                    <img
                      src={proj.sampleImageUrl}
                      alt={proj.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop';
                      }}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-[10px] relative z-10"
                    />

                    {/* TOP FLOATING OVERLAY: Room Type Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/30 shadow-md">
                        {proj.roomType || 'Room'}
                      </span>
                    </div>

                    {/* TOP RIGHT QUICK ACTIONS: Wishlist Remove & Download */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(proj._id, proj.title);
                        }}
                        className="p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer border bg-rose-500 text-white border-rose-400 opacity-100 hover:scale-110"
                        title="Remove from Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerImageDownload(proj.sampleImageUrl, `${proj.title || 'design'}.png`);
                        }}
                        className="p-2 rounded-full bg-blue-950/80 backdrop-blur-md text-white hover:bg-purple-600 transition-colors shadow-md cursor-pointer border border-white/20"
                        title="Download HD Render"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* BOTTOM HOVER GRADIENT OVERLAY WITH TITLE & STYLE */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white space-y-1.5 opacity-90 group-hover:opacity-100 transition-opacity rounded-b-[10px]">
                      <h4 className="font-extrabold text-sm font-heading line-clamp-1 leading-snug text-white">
                        {proj.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                        <span className="text-purple-300 font-bold">{proj.style || 'Modern'}</span>
                        <span className="inline-flex items-center gap-1 text-white font-bold group-hover:text-purple-300 transition-colors">
                          <span>{t('designs.viewRender')}</span>
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
              totalItems={filteredWishlist.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              className="bg-transparent border-0 shadow-none px-0 py-2"
            />
          </div>
        )}
      </div>

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
                      {getLocalizedRoomType(selectedDetailDesign.roomType)}
                    </span>
                    <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold border border-slate-200 dark:border-slate-700 font-heading">
                      {getLocalizedStyle(selectedDetailDesign.style)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(selectedDetailDesign._id, selectedDetailDesign.title)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition-all font-heading cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('designs.modal.removeFromWishlist')}</span>
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {getLocalizedTitle(selectedDetailDesign)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedDetailDesign.description && !selectedDetailDesign.description.toLowerCase().includes('8k uhd')
                    ? selectedDetailDesign.description
                    : t('designs.modal.transformationSubtitle', {
                        style: getLocalizedStyle(selectedDetailDesign.style) || 'Modern',
                        roomType: getLocalizedRoomType(selectedDetailDesign.roomType) || 'space',
                      })}
                </p>
              </div>

              {/* Before/After Comparison Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400 font-heading">
                    {t('designs.modal.comparisonTitle')}
                  </span>
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
                      {t('designs.modal.uncroppedAuto')}
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
                      {t('designs.modal.fillAreaFixed')}
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
                    alt={t('designs.modal.afterRedesign')}
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
                        alt={t('designs.modal.beforePhoto')}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop';
                        }}
                        className="absolute inset-0 w-full h-full rounded-[10px] transition-all duration-200 object-cover"
                      />
                      <span className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-purple-950/85 backdrop-blur-md text-xs font-extrabold text-purple-200 border border-purple-400/40 uppercase tracking-wider font-heading shadow-md">
                        {t('designs.modal.beforePhoto')}
                      </span>
                    </div>
                  ) : (
                    <span className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-purple-950/85 backdrop-blur-md text-xs font-extrabold text-purple-200 border border-purple-400/40 uppercase tracking-wider font-heading shadow-md">
                      {t('designs.modal.originalSource')}
                    </span>
                  )}

                  <span className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md border border-purple-400/30 uppercase tracking-wider font-heading">
                    {t('designs.modal.afterRedesign')}
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
                    {t('designs.modal.savedBlueprintBadge')}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-heading">
                    {t('designs.modal.actionTitle')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => triggerImageDownload(selectedDetailDesign.sampleImageUrl, `${selectedDetailDesign.title || 'redesign'}.png`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all font-heading cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-purple-600" />
                    <span>{t('designs.modal.download')}</span>
                  </button>
                  <Link
                    href={`/generate?roomType=${encodeURIComponent(selectedDetailDesign.roomType || '')}&style=${encodeURIComponent(selectedDetailDesign.style || '')}&presetImage=${encodeURIComponent(selectedDetailDesign.beforeImageUrl || selectedDetailDesign.sampleImageUrl || '')}&desc=${encodeURIComponent(selectedDetailDesign.description || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-colors shadow-md shadow-purple-600/30 font-heading cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{t('designs.modal.tryThisStyle')}</span>
                  </Link>
                </div>
              </div>

              {/* Rating & Review Section */}
              <div className="p-5 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-200/50 dark:border-purple-800/40 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{t('designs.modal.rateReviewTitle')}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {t('designs.modal.rateReviewDesc', {
                        style: getLocalizedStyle(selectedDetailDesign.style) || '',
                        roomType: getLocalizedRoomType(selectedDetailDesign.roomType) || '',
                      })}
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
                    placeholder={t('designs.modal.reviewPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                  <div className="flex items-center justify-between">
                    {reviewMessage ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewMessage}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {t('designs.modal.reviewHelps')}
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-sm font-heading cursor-pointer"
                    >
                      <span>{isSubmittingReview ? t('designs.modal.submitting') : t('designs.modal.submitReview')}</span>
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

