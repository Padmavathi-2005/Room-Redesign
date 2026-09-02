'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Heart, Bookmark, Wand2, Clock } from 'lucide-react';
import { RoomData } from '@/services/project.service';

interface RecentActivityWidgetProps {
  rooms?: RoomData[];
}

export default function RecentActivityWidget({ rooms = [] }: RecentActivityWidgetProps) {
  const activities = rooms.slice(0, 4).map((room, idx) => {
    const title = room.prompt || room.roomType || 'AI Room Redesign';
    const action = `Rendered ${room.theme || room.roomType || 'Design'}`;
    const dateObj = (room as any).createdAt ? new Date((room as any).createdAt) : new Date();
    const timeAgo = dateObj.toLocaleDateString();

    return {
      id: room._id || room.id || String(idx),
      title,
      action,
      timeAgo,
      type: 'render' as const,
    };
  });

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
          {activities.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Recent Activity</p>
                <p className="text-[11px] text-slate-400 font-medium">Your design activity log will appear here after creating your first redesign.</p>
              </div>
              <Link
                href="/generate"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-[11px] font-extrabold hover:bg-purple-700 transition-colors"
              >
                <Wand2 className="w-3 h-3" />
                <span>Start Redesign</span>
              </Link>
            </div>
          ) : (
            activities.map((act) => {
              const Icon = Sparkles;
              const iconBg = 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400';

              return (
                <div key={act.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-2xl ${iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{act.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{act.action}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{act.timeAgo}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

