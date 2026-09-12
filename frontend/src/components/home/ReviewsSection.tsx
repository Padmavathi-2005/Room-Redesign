'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Quote,
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  X,
  Check,
} from 'lucide-react';

interface Review {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  roomType?: string;
  designTheme?: string;
  designImageUrl?: string;
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: 'rev-alex',
    name: 'Alex User',
    role: 'Verified Homeowner & Creator',
    company: 'Living Room Japandi Redesign',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'RoomAI completely transformed my living room space into a modern Japandi sanctuary! The 8K photorealistic renders and lighting simulation gave our contractors the exact blueprints to follow without any guesswork.',
    roomType: 'Living Room',
    designTheme: 'Japandi',
  },
  {
    id: 'rev-1',
    name: 'Elena Rostova',
    role: 'Lead Interior Designer',
    company: 'Studio Lux Interiors',
    avatar: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'RoomAI cut our client proposal rendering time from 4 days to literally 3 minutes. Our client proposal conversion rate went up 40% immediately!',
    roomType: 'Master Bedroom',
    designTheme: 'Modern Luxury',
  },
  {
    id: 'rev-2',
    name: 'Marcus Vance',
    role: 'Managing Director',
    company: 'Apex Commercial Builders',
    avatar: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The AI 3D floor plan generator and site attendance tracking in the ERP module have been game changers for our multi-story commercial projects.',
    roomType: 'Commercial Office',
    designTheme: 'Industrial Chic',
  },
  {
    id: 'rev-3',
    name: 'Sarah Jenkins',
    role: 'Real Estate Broker',
    company: 'Compass Luxury Properties',
    avatar: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Virtual staging with RoomAI lets us list empty homes looking fully furnished in luxury contemporary style without spending thousands on physical staging.',
    roomType: 'Open Living Space',
    designTheme: 'Scandinavian Contemporary',
  },
  {
    id: 'rev-4',
    name: 'David Chen',
    role: 'Principal Architect',
    company: 'Chen & Partners Architecture',
    avatar: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Sketch to 4K render is magic. I upload hand sketches during client meetings and show them photorealistic exterior facade options live in real time.',
    roomType: 'Villa Exterior',
    designTheme: 'Biophilic Modern',
  },
  {
    id: 'rev-5',
    name: 'Priya Sharma',
    role: 'Homeowner & Renovator',
    company: 'Villa Redesign Project',
    avatar: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Redesigned our entire villa interior before hiring contractors. We saved over $8,000 by testing furniture layouts and color schemes virtually first!',
    roomType: 'Kitchen & Dining',
    designTheme: 'Warm Minimalist',
  },
  {
    id: 'rev-6',
    name: 'James Wilson',
    role: 'Senior Project Manager',
    company: 'L&T Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Seamless coordination between site engineers and the office. The visual progress reports keep all stakeholders aligned on schedule.',
    roomType: 'Executive Office',
    designTheme: 'Minimalist Glass',
  },
];

export default function ReviewsSection() {
  const [reviewsList, setReviewsList] = useState<Review[]>(FALLBACK_REVIEWS);
  const [stats, setStats] = useState({
    averageRating: 5.0,
    companiesCount: '500+',
    onTimeRate: '99.4%',
    totalCount: 7,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Review submission modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [reviewRoomType, setReviewRoomType] = useState('Living Room');
  const [reviewTheme, setReviewTheme] = useState('Japandi');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch reviews dynamically from backend MongoDB API
  useEffect(() => {
    const fetchDynamicReviews = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await fetch(`${apiUrl}/reviews`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: Review[] = json.data.map((r: any) => ({
              id: r._id || r.id,
              name: r.name,
              email: r.email,
              role: r.role || 'Verified Creator',
              company: r.company || (r.roomType ? `${r.roomType} ${r.designTheme || ''}` : 'RoomAI Creator'),
              avatar: r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              rating: r.rating || 5,
              text: r.text,
              roomType: r.roomType,
              designTheme: r.designTheme,
              designImageUrl: r.designImageUrl,
            }));
            setReviewsList(mapped);
          }
          if (json.stats) {
            setStats({
              averageRating: json.stats.averageRating || 5.0,
              companiesCount: json.stats.companiesCount || '500+',
              onTimeRate: json.stats.onTimeRate || '99.4%',
              totalCount: json.stats.totalCount || json.data?.length || 7,
            });
          }
        }
      } catch (err) {
        // Keep fallback seamlessly
      }
    };

    fetchDynamicReviews();

    // Pre-fill logged-in user details if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u) {
            setReviewerName(`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '');
            setReviewerRole(u.role === 'ADMIN' ? 'Lead Designer' : 'Homeowner & Creator');
          }
        }
      } catch (e) {}
    }
  }, []);

  const activeReview = reviewsList[currentIndex] || reviewsList[0] || FALLBACK_REVIEWS[0];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviewsList.length) % reviewsList.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviewsList.length);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const payload = {
        name: reviewerName.trim() || 'Valued Designer',
        role: reviewerRole.trim() || 'Verified Creator',
        company: `${reviewRoomType} ${reviewTheme} Redesign`,
        rating: newRating,
        text: reviewText.trim(),
        roomType: reviewRoomType,
        designTheme: reviewTheme,
      };

      const res = await fetch(`${apiUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const createdReview: Review = {
          id: json.data?._id || `rev-${Date.now()}`,
          name: payload.name,
          role: payload.role,
          company: payload.company,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          rating: payload.rating,
          text: payload.text,
          roomType: payload.roomType,
          designTheme: payload.designTheme,
        };

        setReviewsList((prev) => [createdReview, ...prev]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setReviewText('');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="reviews-section relative w-full py-16 sm:py-24 bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white selection:bg-[var(--primary)] selection:text-white border-none overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="reviews-pill-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 border border-[var(--primary)]/20 text-xs font-semibold text-[var(--primary)] shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Stories & Ratings</span>
            </motion.div>

            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="reviews-write-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-105"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
              <span>Write a Review</span>
            </button>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reviews-title text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-heading"
          >
            Loved by Designers, Builders & Homeowners
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reviews-subtitle text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium px-2"
          >
            See how RoomAI transforms real estate, architectural visualization, and interior design workflows worldwide.
          </motion.p>

          {/* Dynamic Aggregate Rating Banner - Desktop */}
          <div className="reviews-stats-bar hidden sm:inline-flex items-center justify-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
            <div className="reviews-stars-wrap flex items-center gap-1.5 text-amber-500">
              <span className="reviews-stars-score text-sm font-extrabold text-slate-900 dark:text-white">
                {stats.averageRating.toFixed(1)}/5
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <span className="reviews-dot text-slate-400">•</span>
            <span className="reviews-stat-companies flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              {stats.companiesCount} Companies
            </span>
            <span className="reviews-dot text-slate-400">•</span>
            <span className="reviews-stat-ontime flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {stats.onTimeRate} On-Time Rate
            </span>
          </div>

          {/* Dynamic Aggregate Rating Banner - Mobile */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 pt-2 flex-wrap">
            <div className="reviews-mobile-pill flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <span className="font-extrabold text-slate-900 dark:text-white">{stats.averageRating.toFixed(1)}/5</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current text-amber-500" />
                ))}
              </div>
            </div>
            <div className="reviews-mobile-pill flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <Building2 className="w-3 h-3 text-[var(--primary)]" />
              <span>{stats.companiesCount} Co.</span>
            </div>
            <div className="reviews-mobile-pill flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{stats.onTimeRate} On-Time</span>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW: Dynamic Reviews Grid Cards */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviewsList.slice(0, 6).map((review, index) => (
            <motion.div
              key={review.id || review._id || index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="review-card group relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-7 shadow-lg shadow-slate-200/50 dark:shadow-black/40 hover:shadow-xl hover:border-indigo-400 dark:hover:border-2 dark:hover:border-[#A855F7] dark:hover:shadow-[0_0_35px_-2px_rgba(168,85,247,0.75),0_24px_50px_-10px_rgba(0,0,0,0.95)] dark:hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-default"
            >
              <div className="space-y-4">
                {/* Top Rating, Theme Badge & Quote Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    {review.designTheme && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/20">
                        {review.roomType ? `${review.roomType} • ` : ''}{review.designTheme}
                      </span>
                    )}
                  </div>
                  <Quote className="w-6 h-6 text-[var(--primary)]/20 fill-[var(--primary)]/10 group-hover:text-[var(--primary)] group-hover:fill-[var(--primary)]/25 group-hover:scale-110 transition-all duration-300 shrink-0" />
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic">
                  "{review.text}"
                </p>
              </div>

              {/* Author Profile Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-heading truncate">{review.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {review.role} • <span className="text-[var(--primary)] font-semibold">{review.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MOBILE VIEW (< md screens): Dynamic Interactive Carousel */}
        <div className="block md:hidden max-w-md mx-auto space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 shadow-lg">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeReview.id || activeReview._id || currentIndex}
                initial={{ opacity: 0, x: direction > 0 ? 25 : -25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -25 : 25 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Header: Rating & Design Badge & Quote */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(activeReview.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    {activeReview.designTheme && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        {activeReview.designTheme}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">
                      {currentIndex + 1} / {reviewsList.length}
                    </span>
                    <Quote className="w-5 h-5 text-[var(--primary)]/30 fill-[var(--primary)]/10" />
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic min-h-[64px]">
                  "{activeReview.text}"
                </p>

                {/* Author Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <img
                    src={activeReview.avatar}
                    alt={activeReview.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white font-heading truncate">
                      {activeReview.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {activeReview.role} • <span className="text-[var(--primary)] font-semibold">{activeReview.company}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Bar (Prev / Next Arrows + Dots) */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={handlePrev}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {reviewsList.map((r, idx) => (
                <button
                  key={r.id || r._id || idx}
                  type="button"
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-5 bg-[var(--primary)]'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next story"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Write a Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="reviews-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="reviews-modal-box relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="reviews-modal-close-btn absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 mb-5">
                <h3 className="reviews-modal-title text-xl font-black font-heading">Share Your Design Experience</h3>
                <p className="reviews-modal-subtitle text-xs text-slate-500">Rate your AI redesign generations and help other designers.</p>
              </div>

              {submitSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Review Submitted!</h4>
                  <p className="text-xs text-slate-500">Thank you for sharing your experience with the community.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="reviews-modal-label text-xs font-bold text-slate-700 dark:text-slate-300">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-amber-500 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || newRating)
                                ? 'fill-current text-amber-500'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-500 ml-2">
                        {newRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="reviews-modal-label text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Alex User"
                        className="reviews-modal-input w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="reviews-modal-label text-xs font-bold text-slate-700 dark:text-slate-300">Role / Title</label>
                      <input
                        type="text"
                        value={reviewerRole}
                        onChange={(e) => setReviewerRole(e.target.value)}
                        placeholder="Homeowner & Creator"
                        className="reviews-modal-input w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Room Type & Style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="reviews-modal-label text-xs font-bold text-slate-700 dark:text-slate-300">Room Type</label>
                      <input
                        type="text"
                        value={reviewRoomType}
                        onChange={(e) => setReviewRoomType(e.target.value)}
                        placeholder="Living Room"
                        className="reviews-modal-input w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="reviews-modal-label text-xs font-bold text-slate-700 dark:text-slate-300">Design Theme / Style</label>
                      <input
                        type="text"
                        value={reviewTheme}
                        onChange={(e) => setReviewTheme(e.target.value)}
                        placeholder="Japandi, Traditional, etc."
                        className="reviews-modal-input w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-1">
                    <label className="reviews-modal-label text-xs font-bold text-slate-700 dark:text-slate-300">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe your design transformation and how RoomAI assisted your project..."
                      className="reviews-modal-input w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="reviews-modal-cancel-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="reviews-modal-submit-btn px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide bg-primary hover:opacity-90 text-white shadow-md shadow-primary/25 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
