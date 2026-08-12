'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Lock, CheckCircle, Sparkles, ShoppingBag } from 'lucide-react';

export interface PublishedProjectCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  toolSlug: string;
  roomType: string; // e.g. Living Room, Bedroom, Kitchen
  style?: string;
  sampleImageUrl: string;
  totalImageCount: number;
  wishlistCount?: number;
  isWishlisted?: boolean;
  isLocked?: boolean;
  hasPurchased?: boolean;
  author?: {
    name?: string;
    avatarUrl?: string;
  };
  onWishlistToggle?: (id: string) => void;
  onPurchaseClick?: (id: string, price: number) => void;
  onViewClick?: (id: string) => void;
}

export const ProjectCard: React.FC<PublishedProjectCardProps> = ({
  id,
  title,
  price,
  roomType,
  style = 'Modern',
  sampleImageUrl,
  totalImageCount,
  wishlistCount = 0,
  isWishlisted = false,
  isLocked = true,
  hasPurchased = false,
  author,
  onWishlistToggle,
  onPurchaseClick,
  onViewClick,
}) => {
  const [liked, setLiked] = useState(isWishlisted);
  const [likesCount, setLikesCount] = useState(wishlistCount);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handlePurchase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPurchaseClick) {
      onPurchaseClick(id, price);
    }
  };

  return (
    <div
      onClick={() => onViewClick && onViewClick(id)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      {/* 1 Sample Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={sampleImageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {/* Sample Image Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/30">
            <Sparkles className="h-3 w-3" /> Sample Preview
          </span>

          {/* Render Count Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700/50">
            {totalImageCount} Renders
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-200 ${
            liked
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
              : 'bg-slate-950/60 border-slate-700/50 text-slate-400 hover:text-rose-400'
          }`}
          title={liked ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-indigo-500/30 font-semibold text-indigo-400 text-sm shadow-lg">
          {price === 0 ? 'FREE' : `$${price.toFixed(2)}`}
        </div>
      </div>

      {/* Details & Metadata */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-300 border border-indigo-500/20">
            {roomType}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">{style}</span>
        </div>

        <h3 className="font-heading text-base font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        {/* Metadata Details visible for unpurchased view */}
        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
          Original photo + {totalImageCount} high-res AI transformations. Full prompt recipes & material details.
        </p>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {author?.avatarUrl ? (
              <img src={author.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                {author?.name?.[0] || 'C'}
              </div>
            )}
            <span className="truncate max-w-[100px]">{author?.name || 'Creator'}</span>
          </div>

          {hasPurchased ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> Unlocked
            </span>
          ) : (
            <button
              onClick={handlePurchase}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {price === 0 ? 'Get Free' : `Buy ($${price})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
