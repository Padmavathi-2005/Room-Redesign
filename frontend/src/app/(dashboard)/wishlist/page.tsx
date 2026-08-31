'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { marketplaceService, PublishedProjectData } from '@/services/marketplace.service';
import PremiumAppLoader from '@/components/ui/PremiumAppLoader';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<PublishedProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
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
        const items = await marketplaceService.getPublishedProjects({ userId });
        setWishlistItems(items || []);
      } catch {
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemoveItem = async (id: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-500" /> Saved Collection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Wishlist</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Keep track of your favorite room designs, furniture palettes, and AI transformation blueprints.
          </p>
        </div>

        <Link href="/designs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-sm">
          Browse Designs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Wishlist Items Grid */}
      {loading ? (
        <div className="py-12">
          <PremiumAppLoader size="md" label="Loading your saved wishlist..." />
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your wishlist is currently empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Explore community designs, tap the heart icon on any design card, and save your favorite inspirations here.
            </p>
          </div>
          <Link href="/designs" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all">
            Explore Room Designs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img src={item.sampleImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item._id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:bg-rose-500 hover:text-white shadow-md transition-all"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {item.roomType} • {item.style}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {item.price > 0 ? `$${item.price}` : 'Free'}
                  </span>
                  <Link href="/designs" className="px-4 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all">
                    View Design
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
