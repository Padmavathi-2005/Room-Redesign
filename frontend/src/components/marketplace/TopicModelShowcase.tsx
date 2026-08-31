'use client';

import React, { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { Sparkles, Filter, LayoutGrid } from 'lucide-react';

export interface TopicModelShowcaseProps {
  toolSlug: string;
  roomType?: string;
  activeUserId?: string;
}

export const TopicModelShowcase: React.FC<TopicModelShowcaseProps> = ({
  toolSlug,
  roomType,
  activeUserId,
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>(roomType || 'all');

  useEffect(() => {
    fetchProjects();
  }, [toolSlug, selectedRoomFilter, activeUserId]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/marketplace?toolSlug=${toolSlug}`;
      if (selectedRoomFilter && selectedRoomFilter !== 'all') {
        url += `&roomType=${encodeURIComponent(selectedRoomFilter)}`;
      }
      if (activeUserId) {
        url += `&userId=${activeUserId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace showcase:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (projectId: string) => {
    if (!activeUserId) return;
    try {
      await fetch(`/api/v1/marketplace/${projectId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId }),
      });
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handlePurchaseClick = async (projectId: string, price: number) => {
    if (!activeUserId) {
      alert('Please log in to purchase projects.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/marketplace/${projectId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: activeUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Project unlocked successfully!');
        fetchProjects();
      } else {
        alert(data.message || 'Purchase failed.');
      }
    } catch (err) {
      console.error('Purchase error:', err);
    }
  };

  return (
    <section className="mt-12 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Community Showcase
          </div>
          <h2 className="font-heading text-xl font-extrabold text-white">
            Published Community Projects
          </h2>
          <p className="text-xs text-slate-400">
            Explore 1-sample display previews, wishlist top designs, or unlock full high-res renders.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Exterior'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedRoomFilter(type)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all ${
                selectedRoomFilter === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {type === 'all' ? 'All Rooms' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LayoutGrid className="h-10 w-10 text-slate-600 mb-3" />
          <h3 className="font-heading text-base font-bold text-slate-300">No Published Projects Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Be the first creator to generate and publish a redesign project for this model!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects.map((proj) => (
            <ProjectCard
              key={proj._id}
              id={proj._id}
              title={proj.title}
              description={proj.description}
              price={proj.price}
              toolSlug={proj.toolSlug}
              roomType={proj.roomType}
              style={proj.style}
              sampleImageUrl={proj.sampleImageUrl}
              totalImageCount={proj.totalImageCount}
              wishlistCount={proj.wishlistCount}
              isWishlisted={proj.isWishlisted}
              isLocked={proj.isLocked}
              hasPurchased={proj.hasPurchased}
              author={proj.author}
              onWishlistToggle={handleWishlistToggle}
              onPurchaseClick={handlePurchaseClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};
