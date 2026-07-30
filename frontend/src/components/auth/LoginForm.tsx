'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password || (isSignUp && !fullName)) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

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

    // Simulate backend auth check and redirect to dashboard
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      {/* Glassmorphism Card Container */}
      <div className="relative bg-white/95 rounded-[24px] p-6 sm:p-8 shadow-lg shadow-slate-900/5 border border-indigo-100/80 backdrop-blur-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Subtle Ambient Top Radial Light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header & Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100/80 shadow-inner">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 bg-clip-text text-transparent tracking-tight font-heading">
              RoomAI
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {isSignUp ? 'Start designing your dream rooms today.' : 'Continue designing beautiful interiors.'}
          </p>
        </div>

        {/* Social Authentication Buttons */}
        <SocialLoginButtons
          onGoogleClick={() => alert('Google login triggered!')}
          onAppleClick={() => alert('Apple login triggered!')}
        />

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <div className="relative px-3 bg-white/80 backdrop-blur-md rounded-full text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Or continue with email
          </div>
        </div>

        {/* Success Message Banner */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isSignUp ? 'Account created successfully! Redirecting...' : 'Signed in successfully! Welcome back.'}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up Full Name Field */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 glass-input outline-none font-medium"
                />
              </div>
            </motion.div>
          )}

          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 glass-input outline-none font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your email!')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 glass-input outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          {!isSignUp && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>
          )}

          {/* Large Gradient Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-300 animated-glow-btn disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Create Free Account' : 'Sign In to RoomAI'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Bottom Toggle Sign Up / Login */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage('');
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don’t have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMessage('');
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
