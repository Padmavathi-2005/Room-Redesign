'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Heart, Bookmark, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  action: string;
  timeAgo: string;
  type: 'render' | '3d' | 'saved' | 'wishlist';
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: '1', title: 'Modern Living Room', action: 'Redesign completed', timeAgo: '2 min ago', type: 'render' },
  { id: '2', title: 'Minimal Bedroom', action: '3D render generated', timeAgo: '2 hours ago', type: '3d' },
  { id: '3', title: 'Cozy Dining Area', action: 'Design saved', timeAgo: '1 day ago', type: 'saved' },
  { id: '4', title: 'Scandinavian Study', action: 'Added to wishlist', timeAgo: '3 days ago', type: 'wishlist' },
];

export default function RecentActivityWidget() {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <Link
            href="/designs"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3 pt-3">
          {DEFAULT_ACTIVITIES.map((act) => {
            let Icon = Sparkles;
            let iconBg = 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400';

            if (act.type === '3d') {
              Icon = CheckCircle2;
              iconBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
            } else if (act.type === 'saved') {
              Icon = Bookmark;
              iconBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
            } else if (act.type === 'wishlist') {
              Icon = Heart;
              iconBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400';
            }

            return (
              <div key={act.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-2xl ${iconBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{act.action}</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{act.timeAgo}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
