'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, AlertTriangle, Zap, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export interface CreditLot {
  lotId: string;
  source: string;
  initialCredits: number;
  remainingCredits: number;
  startDate?: string;
  expiryDate?: string;
}

interface CreditExpiryCountdownWidgetProps {
  creditLots?: CreditLot[];
  userToken?: string;
}

export default function CreditExpiryCountdownWidget({
  creditLots: initialLots,
  userToken,
}: CreditExpiryCountdownWidgetProps) {
  const [lots, setLots] = useState<CreditLot[]>(initialLots || []);
  const [loading, setLoading] = useState(!initialLots);

  useEffect(() => {
    if (initialLots && initialLots.length > 0) {
      setLots(initialLots);
      setLoading(false);
      return;
    }

    const fetchLots = async () => {
      try {
        const token = userToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
        if (!token) return;

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${API_BASE}/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.success && data.data?.creditLots) {
          setLots(data.data.creditLots);
        }
      } catch (err) {
        console.error('Failed to fetch credit lots for countdown widget:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [initialLots, userToken]);

  // Only show when credits are expiring within 2 days (48 hours)
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const validExpiringLots = lots
    .filter((l) => {
      if (!l.remainingCredits || l.remainingCredits <= 0 || !l.expiryDate) return false;
      const expiryTime = new Date(l.expiryDate).getTime();
      const diff = expiryTime - now;
      return diff > 0 && diff <= TWO_DAYS_MS;
    })
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

  const targetLot = validExpiringLots[0];

  // Countdown calculations
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUnderOneHour: boolean;
    isUnder24Hours: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isUnderOneHour: false,
    isUnder24Hours: false,
  });

  useEffect(() => {
    if (!targetLot?.expiryDate) return;

    const updateTimer = () => {
      const expiry = new Date(targetLot.expiryDate!).getTime();
      const current = Date.now();
      const diff = expiry - current;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isUnderOneHour: false,
          isUnder24Hours: false,
        });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: d,
        hours: h,
        minutes: m,
        seconds: s,
        isUnderOneHour: diff <= 3600000,
        isUnder24Hours: diff <= 86400000,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetLot?.expiryDate]);

  if (loading) return null;

  // If no credit lot is expiring within 2 days, do not display the widget banner
  if (!targetLot || !targetLot.expiryDate) {
    return null;
  }

  const expiryDateObj = new Date(targetLot.expiryDate);
  const formattedFullDateTime = expiryDateObj.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const isUrgentOneHour = timeLeft.isUnderOneHour;

  return (
    <div
      className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-md ${
        isUrgentOneHour
          ? 'bg-gradient-to-r from-rose-500/10 via-rose-100/80 to-amber-100/80 border-rose-400 text-rose-950 dark:from-rose-950 dark:via-rose-900 dark:to-amber-950 dark:border-rose-500/80 dark:text-white animate-pulse ring-2 ring-rose-500/50'
          : timeLeft.isUnder24Hours
          ? 'bg-gradient-to-r from-amber-500/15 via-amber-50/90 to-indigo-50/90 border-amber-400/60 text-slate-900 dark:from-amber-950 dark:via-slate-900 dark:to-indigo-950 dark:border-amber-500/60 dark:text-white'
          : 'bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-amber-50/80 border-indigo-200/90 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:border-indigo-500/30 dark:text-white'
      }`}
    >
      {/* Ambient background decorative glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Section: Badges, Credit Title, Expiry Timestamp */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1.5 shadow-xs ${
                isUrgentOneHour
                  ? 'bg-rose-500 text-white border-rose-400 animate-bounce'
                  : timeLeft.isUnder24Hours
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40'
                  : 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/25 dark:text-indigo-300 dark:border-indigo-400/30 backdrop-blur-md'
              }`}
            >
              {isUrgentOneHour ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-white" />
                  <span>EXPIRING IN UNDER 1 HOUR!</span>
                </>
              ) : timeLeft.isUnder24Hours ? (
                <>
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Expiring Today</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Active Credit Batch Expiry</span>
                </>
              )}
            </span>

            <span className="text-xs font-extrabold text-slate-700 bg-slate-900/5 dark:bg-white/10 dark:text-slate-300 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-2.5 py-0.5 rounded-full">
              {targetLot.source}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{targetLot.remainingCredits} Credits Expiring Soon</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              (Initial: {targetLot.initialCredits} Credits)
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Exact Expiry Date & Time:</span>
            <strong className="text-amber-800 bg-amber-500/10 border border-amber-300/60 dark:text-amber-200 font-mono dark:bg-amber-400/10 px-2 py-0.5 rounded-md dark:border-amber-400/20">
              {formattedFullDateTime}
            </strong>
          </p>
        </div>

        {/* Right Section: Multi-Unit Live Countdown Cards & Action CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Labeled Countdown Units Box (Days : Hours : Mins : Secs) */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-xl bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/15 shadow-xs">
            {/* Days Card */}
            <div className="flex flex-col items-center justify-center bg-indigo-50/80 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-amber-500/30 rounded-lg px-2.5 py-1 min-w-[48px] sm:min-w-[54px]">
              <span className="text-base sm:text-lg font-black font-mono text-indigo-700 dark:text-amber-300 tracking-tight leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-black text-indigo-600/80 dark:text-amber-400/80 tracking-widest mt-0.5">Days</span>
            </div>

            <span className="text-indigo-400 dark:text-amber-400/60 font-black text-base font-mono -mt-2">:</span>

            {/* Hours Card */}
            <div className="flex flex-col items-center justify-center bg-indigo-50/80 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-amber-500/30 rounded-lg px-2.5 py-1 min-w-[48px] sm:min-w-[54px]">
              <span className="text-base sm:text-lg font-black font-mono text-indigo-700 dark:text-amber-300 tracking-tight leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-black text-indigo-600/80 dark:text-amber-400/80 tracking-widest mt-0.5">Hours</span>
            </div>

            <span className="text-indigo-400 dark:text-amber-400/60 font-black text-base font-mono -mt-2">:</span>

            {/* Minutes Card */}
            <div className="flex flex-col items-center justify-center bg-indigo-50/80 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-amber-500/30 rounded-lg px-2.5 py-1 min-w-[48px] sm:min-w-[54px]">
              <span className="text-base sm:text-lg font-black font-mono text-indigo-700 dark:text-amber-300 tracking-tight leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-black text-indigo-600/80 dark:text-amber-400/80 tracking-widest mt-0.5">Mins</span>
            </div>

            <span className="text-indigo-400 dark:text-amber-400/60 font-black text-base font-mono -mt-2">:</span>

            {/* Seconds Card */}
            <div className="flex flex-col items-center justify-center bg-indigo-50/80 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-amber-500/30 rounded-lg px-2.5 py-1 min-w-[48px] sm:min-w-[54px]">
              <span className="text-base sm:text-lg font-black font-mono text-indigo-700 dark:text-amber-300 tracking-tight leading-none animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-black text-indigo-600/80 dark:text-amber-400/80 tracking-widest mt-0.5">Secs</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <Link
            href="/billing"
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 border ${
              isUrgentOneHour
                ? 'bg-rose-500 hover:bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 border-amber-400/50 text-white font-extrabold'
            }`}
          >
            <span>Top Up / Extend</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
