'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import SocialLoginButtons from './SocialLoginButtons';

export default function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service & Privacy Policy');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    // Save user auth session in localStorage & cookies
    if (typeof window !== 'undefined') {
      const mockToken = 'mock_jwt_token_roomai_' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: fullName || email.split('@')[0] || 'Demo User',
          email,
          role: 'Architect',
          credits: 100,
        })
      );
      document.cookie = `token=${mockToken}; path=/; max-age=86400; SameSite=Lax`;
    }

    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-7 sm:p-9 border border-white/80 shadow-2xl backdrop-blur-2xl bg-white/85 rounded-2xl space-y-6">

        {/* Card Top Branding Badge & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Join 500,000+ Designers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Create Your Account
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Start designing dream rooms with AI magic in seconds.
          </p>
        </div>

        {/* Social Authentication Buttons */}
        <SocialLoginButtons />

        {/* OR Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200/80 w-full" />
          <span className="bg-white/90 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute rounded-full border border-slate-200/60">
            OR SIGN UP WITH EMAIL
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 text-center">
              {errorMsg}
            </div>
          )}

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="glass-input w-full pl-10 pr-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all rounded-2xl"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="glass-input w-full pl-10 pr-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all rounded-2xl"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="glass-input w-full pl-10 pr-10 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all rounded-2xl"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms & Privacy Agreement Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agreeTerms" className="text-xs text-slate-600 font-medium">
              I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> & <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none disabled:opacity-70"
          >
            {isLoading ? (
              <span>Creating Your Account...</span>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </motion.div>
  );
}
