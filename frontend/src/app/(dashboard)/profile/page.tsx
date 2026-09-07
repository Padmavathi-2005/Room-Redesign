'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Heart,
  LayoutGrid,
  Bell,
  Camera,
  Check,
  ArrowUpRight,
  Shield,
  Zap,
  Sliders,
  Award,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import CreditTokenIcon from '@/components/ui/CreditTokenIcon';

const PRESET_AVATARS = [
  {
    id: 'avatar-sparkle',
    name: 'Gemini Sparkle',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7C3AED"/>
            <stop offset="100%" stop-color="#4F46E5"/>
          </linearGradient>
          <linearGradient id="glow1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bg1)"/>
        <circle cx="50" cy="30" r="35" fill="url(#glow1)"/>
        <path d="M50 22 L54 42 L74 46 L54 50 L50 70 L46 50 L26 46 L46 42 Z" fill="#FDE047"/>
        <path d="M68 20 L70 30 L80 32 L70 34 L68 44 L66 34 L56 32 L66 30 Z" fill="#FFFFFF" opacity="0.9"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-crown',
    name: 'Royal Crown',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#EA580C"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bg2)"/>
        <path d="M25 65 L25 40 L38 52 L50 30 L62 52 L75 40 L75 65 Z" fill="#FFFFFF"/>
        <circle cx="25" cy="36" r="4" fill="#FDE047"/>
        <circle cx="50" cy="26" r="4" fill="#FDE047"/>
        <circle cx="75" cy="36" r="4" fill="#FDE047"/>
        <rect x="25" y="67" width="50" height="6" rx="3" fill="#FEF08A"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-blueprint',
    name: 'Blueprint Compass',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06B6D4"/>
            <stop offset="100%" stop-color="#2563EB"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bg3)"/>
        <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
        <polygon points="50,30 67,40 67,60 50,70 33,60 33,40" fill="none" stroke="#67E8F9" stroke-width="2"/>
        <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-emerald',
    name: 'Emerald Shield',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#0F766E"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bg4)"/>
        <path d="M50 22 C65 22 75 26 75 38 C75 58 58 72 50 78 C42 72 25 58 25 38 C25 26 35 22 50 22 Z" fill="#FFFFFF"/>
        <path d="M43 48 L48 53 L58 41" fill="none" stroke="#10B981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-palette',
    name: 'Studio Palette',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F43F5E"/>
            <stop offset="100%" stop-color="#DB2777"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bg5)"/>
        <path d="M50 20 C68 20 80 32 80 48 C80 62 70 70 58 70 C52 70 48 66 48 60 C48 56 50 52 48 48 C46 44 40 44 36 44 C26 44 20 36 20 28 C20 22 32 20 50 20 Z" fill="#FFFFFF"/>
        <circle cx="34" cy="32" r="4" fill="#F43F5E"/>
        <circle cx="48" cy="28" r="4" fill="#3B82F6"/>
        <circle cx="62" cy="34" r="4" fill="#EAB308"/>
        <circle cx="68" cy="48" r="4" fill="#10B981"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-diamond',
    name: 'Cosmic Diamond',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6"/>
            <stop offset="100%" stop-color="#C026D3"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bg6)"/>
        <polygon points="50,22 75,40 50,78 25,40" fill="#FFFFFF"/>
        <polygon points="50,22 75,40 50,40" fill="#F5D0FE"/>
        <polygon points="25,40 50,40 50,78" fill="#E9D5FF"/>
      </svg>
    `)}`,
  },
];

const ROOM_PREFERENCES = ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Villa', 'Bathroom'];
const STYLE_PREFERENCES = ['Modern', 'Minimalist', 'Scandinavian', 'Luxury', 'Industrial', 'Bohemian'];

export default function ProfilePage() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stats' | 'preferences'>('profile');

  // User Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('Interior Enthusiast');
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState('Free Plan');
  const [statusText, setStatusText] = useState('active');

  // Stats State
  const [totalDesignsCount, setTotalDesignsCount] = useState(0);
  const [totalWishlistCount, setTotalWishlistCount] = useState(0);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences State
  const [defaultRoom, setDefaultRoom] = useState('Living Room');
  const [defaultStyle, setDefaultStyle] = useState('Modern');
  const [notifyLowCredits, setNotifyLowCredits] = useState(true);
  const [notifyNewFeatures, setNotifyNewFeatures] = useState(true);

  // Load User Info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setName(parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'User');
          setEmail(parsed.email || 'user@example.com');
          setPhone(parsed.phone || '+1 (555) 019-2834');
          
          let userAvatar = parsed.avatarUrl || parsed.avatar || '';
          if (!userAvatar || userAvatar.includes('unsplash.com')) {
            userAvatar = PRESET_AVATARS[0].url;
            parsed.avatarUrl = userAvatar;
            parsed.avatar = userAvatar;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
          setAvatarUrl(userAvatar);
          setCredits(parsed.credits ?? 0);
          setPlan(parsed.subscriptionTier || 'Free Plan');
        } catch {}
      } else {
        setAvatarUrl(PRESET_AVATARS[0].url);
      }

      // Count local designs
      try {
        const storedGen = localStorage.getItem('user_generated_designs');
        if (storedGen) {
          const parsed = JSON.parse(storedGen);
          setTotalDesignsCount(parsed.length || 0);
        }
      } catch (e) {}

      // Count wishlist items
      try {
        const storedWish = localStorage.getItem('user_wishlist_ids');
        if (storedWish) {
          const parsed = JSON.parse(storedWish);
          setTotalWishlistCount(parsed.length || 0);
        }
      } catch (e) {}
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
          setPlan(statusJson.data.subscriptionTier || (statusJson.data.plan === 'pro' ? 'Pro Plan' : statusJson.data.plan === 'starter' ? 'Starter Plan' : 'Free Plan'));
          setStatusText(statusJson.data.subscriptionStatus || 'active');
        }
      } catch {}
    }

    fetchServerStatus();
  }, []);

  // Save Profile Handler
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
      parsed.phone = phone;
      parsed.avatarUrl = avatarUrl;
      localStorage.setItem('user', JSON.stringify(parsed));
    }

    toast.success('Profile details updated successfully!');
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    }, 600);
  };

  // Save Preferences Handler
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('user_preferences', JSON.stringify({
        defaultRoom,
        defaultStyle,
        notifyLowCredits,
        notifyNewFeatures,
      }));
    } catch (err) {}
    toast.success('Preferences saved successfully!');
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Top Banner Hero Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500/10 skew-x-12 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar Profile Ring */}
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-purple-500/60 p-1 bg-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-xs" title="Account Active">
              <Check className="w-3 h-3 text-white stroke-[3]" />
            </span>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-purple-500/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-purple-200 border border-purple-400/30">
                {plan}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                {statusText}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
              {name || 'User'}
            </h1>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{email}</span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full md:w-auto">
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 font-extrabold text-xs shadow-xs justify-center">
            <CreditTokenIcon size="sm" />
            <span>{credits.toLocaleString()} Credits Available</span>
          </div>

          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition-all shadow-sm font-heading cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Manage Plan</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-extrabold transition-all cursor-pointer font-heading whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-extrabold transition-all cursor-pointer font-heading whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-extrabold transition-all cursor-pointer font-heading whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Activity & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-extrabold transition-all cursor-pointer font-heading whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Avatar Select Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[10px] p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Profile Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Choose a preset avatar or paste a custom image URL.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {PRESET_AVATARS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(item.url)}
                    title={item.name}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === item.url
                        ? 'border-purple-600 ring-2 ring-purple-600/30 scale-105'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-400'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Custom Avatar Image URL
                </label>
                <div className="relative max-w-md">
                  <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[10px] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Account Details
                </h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Occupation / Role
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all font-heading cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[10px] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Change Password
                </h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all font-heading cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ACTIVITY & STATS */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Generated Designs</span>
                  <div className="p-2 rounded-[8px] bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {totalDesignsCount}
                </h3>
                <Link href="/designs" className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 font-heading pt-1">
                  View Generated Showcase <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Saved Wishlist Items</span>
                  <div className="p-2 rounded-[8px] bg-rose-50 dark:bg-rose-950/60 text-rose-500">
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {totalWishlistCount}
                </h3>
                <Link href="/wishlist" className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 font-heading pt-1">
                  Open Wishlist Collection <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Credit Balance</span>
                  <div className="p-2 rounded-[8px] bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                    <Zap className="w-4 h-4 fill-amber-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {credits.toLocaleString()}
                </h3>
                <Link href="/billing" className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 font-heading pt-1">
                  Recharge Credits <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PREFERENCES */}
        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[10px] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Studio & System Preferences
                </h3>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Room Type for Generation
                  </label>
                  <select
                    value={defaultRoom}
                    onChange={(e) => setDefaultRoom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {ROOM_PREFERENCES.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Theme / Style Filter
                  </label>
                  <select
                    value={defaultStyle}
                    onChange={(e) => setDefaultStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {STYLE_PREFERENCES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all font-heading cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


