'use client';

import React, { useState } from 'react';
import { X, Sparkles, DollarSign, Upload, Image as ImageIcon, Tag, Check } from 'lucide-react';

export interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedImages: string[]; // List of AI rendered images
  originalImageUrl?: string;
  toolSlug: string;
  roomType: string;
  onPublishSubmit: (payload: {
    title: string;
    description: string;
    price: number;
    sampleImageUrl: string;
    lockedImageUrls: string[];
    originalImageUrl?: string;
    toolSlug: string;
    roomType: string;
    tags: string[];
  }) => Promise<void>;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  generatedImages = [],
  originalImageUrl = '',
  toolSlug,
  roomType,
  onPublishSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(15);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [tagsInput, setTagsInput] = useState<string>('Modern, Luxury, 4K');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const sampleImageUrl = generatedImages[selectedSampleIndex] || generatedImages[0] || '';
  const lockedImageUrls = generatedImages.filter((_, idx) => idx !== selectedSampleIndex);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sampleImageUrl) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onPublishSubmit({
        title,
        description,
        price,
        sampleImageUrl,
        lockedImageUrls,
        originalImageUrl,
        toolSlug,
        roomType,
        tags,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Publish to Community Marketplace</h2>
              <p className="text-xs text-slate-400">Earn 80% net royalties whenever users purchase your project.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">Published Successfully!</h3>
            <p className="text-sm text-slate-400 mt-1">Your project is now live on the Community Marketplace.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Scandinavian Living Room Redesign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Select Single Public Sample Display Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select 1 Sample Image for Public Showcase
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Unpurchased users will only see this 1 display image. The remaining {generatedImages.length - 1} images will be locked until purchased.
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {generatedImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSampleIndex(idx)}
                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedSampleIndex === idx
                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/50'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                    {selectedSampleIndex === idx && (
                      <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing ($ USD) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Set Listing Price ($ USD)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-indigo-400">
                You earn 80% (${(price * 0.8).toFixed(2)}) per sale. Set $0 for free community showcase.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Details</label>
              <textarea
                rows={2}
                placeholder="Include architectural details, color palettes, or furniture materials..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Search Tags (Comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
