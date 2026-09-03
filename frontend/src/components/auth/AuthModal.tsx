'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  redirectUrl,
}: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password || (isSignUp && !fullName)) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (email.toLowerCase().trim() === 'admin@gmail.com' || email.toLowerCase().includes('admin')) {
      setErrorMessage('Admin accounts cannot log in through the user login form. Please use the Admin Portal.');
      return;
    }

    setIsLoading(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const nameParts = (fullName || email.split('@')[0] || 'User').trim().split(' ');
    const firstName = nameParts[0] || 'Demo';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    let tokenToSave = '';
    let userToSave: any = null;

    try {
      const endpoint = isSignUp ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
      const payload = isSignUp ? { firstName, lastName, email, password } : { email, password };

      let res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let resData = await res.json();

      if (!res.ok && !isSignUp) {
        res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });
        resData = await res.json();
      }

      if (res.ok && resData.data?.tokens?.accessToken) {
        tokenToSave = resData.data.tokens.accessToken;
        const u = resData.data.user || {};
        userToSave = {
          _id: u._id || u.id,
          id: u._id || u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || fullName || email.split('@')[0],
          email: u.email || email,
          role: u.role || 'user',
          credits: u.credits ?? 0,
          plan: u.plan ? u.plan.toUpperCase() : 'FREE',
          avatar: u.avatar || '',
          token: tokenToSave,
        };
      }
    } catch (err: any) {
      console.warn('Real backend auth failed:', err.message);
    }

    if (typeof window !== 'undefined') {
      if (tokenToSave && userToSave) {
        localStorage.setItem('token', tokenToSave);
        localStorage.setItem('user', JSON.stringify(userToSave));
        document.cookie = `token=${tokenToSave}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        const storedUserStr = localStorage.getItem('user');
        let existingCredits = 0;
        let existingPlan = 'FREE';
        let existingAvatar = '';
        let existingName = fullName || email.split('@')[0] || 'Demo User';

        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            if (parsed) {
              if (typeof parsed.credits === 'number') existingCredits = parsed.credits;
              if (parsed.plan) existingPlan = parsed.plan;
              if (parsed.avatar || parsed.avatarUrl) existingAvatar = parsed.avatar || parsed.avatarUrl;
              if (!fullName && parsed.name) existingName = parsed.name;
            }
          } catch (e) {}
        }

        userToSave = {
          name: existingName,
          email,
          role: 'user',
          credits: existingCredits,
          plan: existingPlan,
          avatar: existingAvatar,
        };
        localStorage.setItem('user', JSON.stringify(userToSave));
      }

      window.dispatchEvent(new Event('auth-changed'));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-credits-updated'));

      setIsLoading(false);

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-none overflow-y-auto">
        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-sm my-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 z-[100000]"
        >
          {/* Header Bar */}
          <div className="relative px-6 pt-6 pb-2 flex items-center justify-center">
            <h3 className="text-2xl font-black bg-gradient-to-r from-[#2563EB] to-indigo-600 bg-clip-text text-transparent font-heading text-center tracking-tight pb-1">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </h3>

            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-2.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {isSignUp && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-w-[160px] mt-2 py-2.5 px-6 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/25 flex items-center justify-center transition-all disabled:opacity-70 font-heading cursor-pointer self-center"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>
            </form>

            <div className="relative py-1.5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[10.5px] text-slate-400 font-medium">
                Or continue with
              </span>
            </div>

            <SocialLoginButtons />

            <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-bold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
