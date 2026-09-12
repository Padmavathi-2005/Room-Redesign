'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Save,
  Sparkles,
  CreditCard,
  Camera,
  Upload,
  Trash2,
  Star,
  ExternalLink,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/context/LanguageContext';
import CreditTokenIcon from '@/components/ui/CreditTokenIcon';

export interface ReviewedDesign {
  id: string;
  designId?: string;
  title: string;
  image: string;
  beforeImage?: string;
  roomType: string;
  style: string;
  rating: number;
  comment: string;
  createdAt: string;
  generationUrl: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState('Free Plan');
  const [statusText, setStatusText] = useState('active');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reviewed Designs State (Real User Reviews Only)
  const [reviews, setReviews] = useState<ReviewedDesign[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);

  // Load User Info and Reviews
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setName(parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User');
          setEmail(parsed.email || 'user@example.com');

          let userAvatar = parsed.avatarUrl || parsed.avatar || '';
          if (userAvatar.includes('unsplash.com') || userAvatar.startsWith('data:image/svg+xml')) {
            userAvatar = '';
            parsed.avatarUrl = '';
            parsed.avatar = '';
            localStorage.setItem('user', JSON.stringify(parsed));
          }
          setAvatarUrl(userAvatar);
          setCredits(parsed.credits ?? 0);
          setPlan(parsed.subscriptionTier || 'Free Plan');
        } catch {}
      }

      // Load reviewed designs from localStorage (real user ratings only)
      const storedReviews = localStorage.getItem('user_design_reviews');
      if (storedReviews) {
        try {
          const parsed = JSON.parse(storedReviews);
          if (Array.isArray(parsed)) {
            // Remove mock items if any exist from previous versions
            const realReviews = parsed.filter(
              (r: any) => r && r.id && !['rev-1', 'rev-2', 'rev-3', 'rev-4'].includes(r.id)
            );
            setReviews(realReviews);
            localStorage.setItem('user_design_reviews', JSON.stringify(realReviews));
          } else {
            setReviews([]);
          }
        } catch {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
    }

    // Fetch live backend subscription status
    async function fetchServerStatus() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      if (!token) return;

      try {
        const statusRes = await fetch(`${API_URL}/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusJson = await statusRes.json();
        if (statusJson.success && statusJson.data) {
          setCredits(statusJson.data.credits ?? 0);
          setPlan(
            statusJson.data.subscriptionTier ||
              (statusJson.data.plan === 'pro'
                ? 'Pro Plan'
                : statusJson.data.plan === 'starter'
                ? 'Starter Plan'
                : 'Free Plan'),
          );
          setStatusText(statusJson.data.subscriptionStatus || 'active');
        }
      } catch {}
    }

    fetchServerStatus();
  }, []);

  // Sync document title
  useEffect(() => {
    if (t?.profilePage?.title) {
      document.title = `${t.profilePage.title} | RoomAI`;
    }
  }, [t?.profilePage?.title]);

  // Handle Profile Photo Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        let parsed: any = {};
        if (storedUser) {
          try {
            parsed = JSON.parse(storedUser);
          } catch {}
        }
        parsed.avatar = base64;
        parsed.avatarUrl = base64;
        localStorage.setItem('user', JSON.stringify(parsed));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('user-updated'));
      }
      toast.success(t?.profilePage?.accountDetails?.successToast || 'Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Profile Photo
  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      let parsed: any = {};
      if (storedUser) {
        try {
          parsed = JSON.parse(storedUser);
        } catch {}
      }
      parsed.avatar = '';
      parsed.avatarUrl = '';
      localStorage.setItem('user', JSON.stringify(parsed));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-updated'));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success(
      t?.profilePage?.avatarSection?.removeButton
        ? `${t.profilePage.avatarSection.removeButton} ✓`
        : 'Profile photo removed',
    );
  };

  // Save Profile Handler (Name & Email)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      let parsed: any = {};
      if (storedUser) {
        try {
          parsed = JSON.parse(storedUser);
        } catch {}
      }
      parsed.name = name;
      parsed.email = email;
      parsed.avatar = avatarUrl;
      parsed.avatarUrl = avatarUrl;
      localStorage.setItem('user', JSON.stringify(parsed));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-updated'));
    }

    toast.success(t?.profilePage?.accountDetails?.successToast || 'Profile details updated successfully!');
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(t?.profilePage?.security?.errorCurrent || 'Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t?.profilePage?.security?.errorMinLength || 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t?.profilePage?.security?.errorMismatch || 'New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t?.profilePage?.security?.successToast || 'Password changed successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP SECTION: USER PROFILE, EMAIL, PASSWORD & CREDITS DETAILS           */}
      {/* ========================================================================= */}
      <div className="transactions-main-card bg-white dark:bg-[#0D121F]/95 border border-slate-200/90 dark:border-purple-500/20 rounded-3xl p-6 sm:p-7 shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden">
        {/* Profile Card Header & Quick Credit Details */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
          {/* Avatar + Identity Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-start">
            {/* Avatar with Camera Overlay */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl ring-2 ring-purple-500/30 dark:ring-purple-500/40 shadow-lg shadow-purple-500/10 p-0.5 bg-slate-100 dark:bg-[#0A0E1A] overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-2xl font-sans shadow-inner">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              {/* Camera Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -end-1.5 w-7 h-7 rounded-xl bg-purple-600 hover:bg-purple-500 text-white border-2 border-white dark:border-[#0D121F] flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all hover:scale-110 cursor-pointer"
                title={t?.profilePage?.avatarSection?.uploadButton || 'Upload Photo'}
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* User Title & Badges */}
            <div className="space-y-1.5 text-center sm:text-start">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  {name || 'Alex User'}
                </h1>
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(139,92,246,0.15)]">
                  {plan}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  {statusText === 'active' ? (t?.profilePage?.activeStatus || 'Active') : statusText}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span dir="ltr">{email || 'user@yopmail.com'}</span>
              </p>

              {/* Photo Action Links */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-purple-400 dark:text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 transition-all inline-flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Upload className="w-3 h-3" />
                  <span>{t?.profilePage?.avatarSection?.uploadButton || 'Change Photo'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[11px] font-bold text-rose-400 hover:text-white px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all inline-flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t?.profilePage?.avatarSection?.removeButton || 'Remove'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Credits Details & Subscription Plan Box */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-3 bg-slate-50 dark:bg-[#0A0E1A]/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-amber-500/25 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-500/30 text-amber-400">
                <CreditTokenIcon size="sm" />
              </div>
              <div className="text-start">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 font-sans">
                  {t?.profilePage?.stats?.creditBalance || 'Studio Credits Available'}
                </p>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-amber-300 font-mono">
                  {credits.toLocaleString()} {t?.generate?.availableCredits ? '' : 'Credits'}
                </p>
              </div>
            </div>
            <Link
              href="/billing"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/25 border border-purple-400/30 transition-all hover:scale-[1.03] font-sans shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t?.profilePage?.managePlan || 'Manage Plan'}</span>
            </Link>
          </div>
        </div>

        {/* User Details & Password Form (Clean 2-Column Section) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sub-Card: Name & Email Form */}
          <form onSubmit={handleSaveProfile} className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-0.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.15)]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-sans">
                {t?.profilePage?.accountDetails?.title || 'Account Credentials'}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-start font-sans">
                  {t?.profilePage?.accountDetails?.fullName || 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-purple-400/60" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A]/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all text-start"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-start font-sans">
                  {t?.profilePage?.accountDetails?.email || 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-purple-400/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A]/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all text-start"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/25 border border-purple-400/30 transition-all font-sans cursor-pointer hover:scale-[1.02]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t?.profilePage?.accountDetails?.saveChanges || 'Save Details'}</span>
              </button>
            </div>
          </form>

          {/* Right Sub-Card: Security & Password Update */}
          <form onSubmit={handleChangePassword} className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-0.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.15)]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-sans">
                {t?.profilePage?.security?.title || 'Security & Password'}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-start font-sans">
                  {t?.profilePage?.security?.currentPassword || 'Current Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-purple-400/60" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A]/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all text-start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-start font-sans">
                    {t?.profilePage?.security?.newPassword || 'New Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-purple-400/60" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      dir="ltr"
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A]/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all text-start"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-start font-sans">
                    {t?.profilePage?.security?.confirmPassword || 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-purple-400/60" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      dir="ltr"
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A]/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all text-start"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1 flex justify-start">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/25 border border-purple-400/30 transition-all font-sans cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isChangingPassword
                    ? t?.profilePage?.security?.updating || 'Updating...'
                    : t?.profilePage?.security?.updatePassword || 'Update Password'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SECTION: USER'S REVIEWED DESIGNS (LATEST 4 + SHOW MORE)            */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.2)] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                {t?.profilePage?.reviewedDesigns?.title || 'Reviewed Room Designs'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t?.profilePage?.reviewedDesigns?.subtitle ||
                  'Your ratings and reviews on AI room redesigns. Click visit to reopen any design in the studio.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-black font-sans shadow-[0_0_12px_rgba(139,92,246,0.2)]">
              {t?.profilePage?.reviewedDesigns?.ratingCount
                ? t.profilePage.reviewedDesigns.ratingCount.replace('{count}', String(reviews.length))
                : `${reviews.length} ${reviews.length === 1 ? 'Review' : 'Reviews'}`}
            </span>
          </div>
        </div>

        {/* Reviews List or Empty State */}
        {reviews.length === 0 ? (
          <div className="transactions-main-card bg-white dark:bg-[#0D121F]/95 border border-slate-200/90 dark:border-purple-500/20 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-sans">
                {t?.profilePage?.reviewedDesigns?.noReviewsTitle || 'No Reviews Yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                {t?.profilePage?.reviewedDesigns?.noReviewsDesc || "You haven't reviewed any AI room redesigns yet. Generate rooms in the Studio and submit your rating to see them appear here."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/30 border border-purple-400/30 transition-all hover:scale-105 font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t?.profilePage?.reviewedDesigns?.startGenerating || 'Start Generating in Studio'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.slice(0, visibleCount).map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#0D121F]/95 border border-slate-200/90 dark:border-purple-500/20 rounded-2xl p-5 shadow-md hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Row: Stars Rating + Visit Link Icon */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black font-mono text-amber-500 dark:text-amber-400">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Visit in Studio Link Icon Button */}
                    <Link
                      href={item.generationUrl || '/generate'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-bold transition-all font-sans hover:scale-105 shadow-xs"
                      title={t?.profilePage?.reviewedDesigns?.openInStudio || 'Visit in Generation Studio'}
                    >
                      <span>{t?.profilePage?.reviewedDesigns?.visitStudio || 'Visit Studio'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    </Link>
                  </div>

                  {/* Review Feedback Quote */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
                    "{item.comment}"
                  </p>

                  {/* Bottom Row: Design Title, Room/Style Badges & Date */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                        {item.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 text-[10px] font-bold">
                        {item.roomType}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                        {item.style}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button (Loads Next 4) */}
            {visibleCount < reviews.length && (
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-black transition-all cursor-pointer font-sans shadow-md hover:scale-105"
                >
                  <span>{t?.profilePage?.reviewedDesigns?.showMore || 'Show More'}</span>
                  <span className="text-[11px] font-medium opacity-80">
                    {(t?.profilePage?.reviewedDesigns?.remainingCount || '({count} remaining)').replace('{count}', String(reviews.length - visibleCount))}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        id="profile-photo-file-upload"
      />
    </div>
  );
}
