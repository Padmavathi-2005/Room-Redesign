'use client';

import React, { useState } from 'react';
import { Heart, Star, Sparkles, Eye, ArrowRight } from 'lucide-react';

export interface PublishedProjectCardProps {
  id: string;
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  toolSlug?: string;
  roomType: string;
  style?: string;
  sampleImageUrl: string;
  beforeImageUrl?: string;
  totalImageCount?: number;
  wishlistCount?: number;
  rating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  isLocked?: boolean;
  hasPurchased?: boolean;
  onPurchaseClick?: (id: string, price: number) => Promise<void> | void;
  author?: {
    name?: string;
    avatarUrl?: string;
  };
  onWishlistToggle?: (id: string) => void;
  onViewClick?: (id: string) => void;
}

export const ProjectCard: React.FC<PublishedProjectCardProps> = ({
  id,
  title,
  description,
  roomType,
  style = 'Modern',
  sampleImageUrl,
  beforeImageUrl,
  wishlistCount = 0,
  rating = 4.8,
  reviewCount = 12,
  isWishlisted = false,
  author,
  onWishlistToggle,
  onViewClick,
}) => {
  const [liked, setLiked] = useState(isWishlisted);
  const [likesCount, setLikesCount] = useState(wishlistCount);
  const [showBefore, setShowBefore] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount(liked ? Math.max(0, likesCount - 1) : likesCount + 1);
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  return (
    <div
      onClick={() => onViewClick && onViewClick(id)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Before / After Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={showBefore && beforeImageUrl ? beforeImageUrl : sampleImageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
            {showBefore ? 'BEFORE PHOTO' : 'AFTER REDESIGN'}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleHeartClick}
          aria-label="Wishlist toggle"
          className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-200 ${
            liked
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
              : 'bg-slate-950/60 border-slate-700/50 text-slate-300 hover:text-rose-400 hover:scale-110'
          }`}
          title={liked ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`h-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Interactive Before/After Toggle Overlay Button */}
        {beforeImageUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBefore(!showBefore);
            }}
            className="absolute bottom-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-slate-900/90 hover:bg-slate-950 text-slate-200 hover:text-white rounded-2xl border border-slate-700 backdrop-blur-md transition-colors"
          >
            {showBefore ? 'Show Redesign' : 'Compare Before'}
          </button>
        )}

        {/* Rating Score Badge */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-2xl bg-slate-950/90 backdrop-blur-md px-2.5 py-1 border border-amber-500/30 font-bold text-amber-400 text-xs shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{rating.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 font-normal">({reviewCount})</span>
        </div>
      </div>

      {/* Details & Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
            {roomType}
          </span>
          <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs">{style}</span>
        </div>

        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h3>

        {description && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Footer Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            AI Transformation
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
            View Showcase <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
