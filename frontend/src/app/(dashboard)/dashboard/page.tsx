'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  ArrowRight,
  Download,
  Eye,
  Zap,
  MoreVertical,
} from 'lucide-react';

import DashboardTopBar from '@/components/dashboard/DashboardTopBar';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget';
import QuickRedesignStudio from '@/components/dashboard/QuickRedesignStudio';
import CommonPagination from '@/components/ui/CommonPagination';
import { useSettings } from '@/context/SettingsContext';

import { projectService, ProjectData, RoomData } from '@/services/project.service';

interface UserSession {
  name: string;
  email: string;
  credits: number;
  plan: string;
}

const AI_SUGGESTIONS = [
  {
    title: 'Biophilic Living Room',
    desc: 'Incorporate natural sunlight, lush indoor foliage, and organic timber accents.',
    badge: 'Popular Preset',
    toolSlug: 'interior-design',
  },
  {
    title: 'Warm Japandi Bedroom',
    desc: 'Neutral linen textures, low wood platform bed, and acoustic wood slat backdrop.',
    badge: 'Trending',
    toolSlug: '3d-floor-plan',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [user, setUser] = useState<UserSession>({
    name: 'User',
    email: 'user@example.com',
    credits: 0,
    plan: 'FREE',
  });

  const [userProjects, setUserProjects] = useState<ProjectData[]>([]);
  const [userRooms, setUserRooms] = useState<RoomData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser({
            name: parsed.name || parsed.firstName || 'Ananya',
            email: parsed.email || 'ananya@example.com',
            credits: parsed.credits ?? 100,
            plan: parsed.plan ? `${parsed.plan.toUpperCase()}` : 'PREMIUM',
          });
        } catch {}
      }
    }

    const fetchLiveUserMetrics = async () => {
      try {
        const [projs, rooms] = await Promise.all([
          projectService.getProjects(),
          projectService.getAllRooms(),
        ]);
        setUserProjects(projs || []);
        setUserRooms(rooms || []);
      } catch (err) {
        console.error('Failed to load user projects/rooms:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchLiveUserMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Greeting & Quick Actions Bar */}
      <DashboardTopBar
        userName={user.name}
        userEmail={user.email}
        credits={user.credits}
        roleBadge={user.plan}
      />

      {/* 4 Metric Stats Cards */}
      <DashboardStats
        totalDesigns={userRooms.length}
        activeProjects={userProjects.length}
        creditsLeft={user.credits}
        wishlistCount={12}
      />

      {/* Middle Section: Recent Designs Data Table & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recent Designs Data Table (2 Columns) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white">
                Recent AI Designs Table
              </h3>
              <p className="text-xs font-medium text-slate-400">View generated renders, credits consumed & download images</p>
            </div>
            <Link
              href="/designs"
              className="px-3.5 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-all"
            >
              View All
            </Link>
          </div>

          {/* Structured Table Format */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Design Render</th>
                  <th className="py-3 px-3">Room & Style</th>
                  <th className="py-3 px-3">Credits Used</th>
                  <th className="py-3 px-3">Generated</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {userRooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                      No AI room renders generated yet. Click &quot;Open AI Studio&quot; to transform your room!
                    </td>
                  </tr>
                ) : (
                  userRooms.slice(
                    (currentPage - 1) * (settings.tablePaginationLimit || 10),
                    currentPage * (settings.tablePaginationLimit || 10)
                  ).map((room) => {
                    const imgUrl = room.generatedImage || room.originalImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80';
                    const title = room.prompt || room.roomType || 'AI Room Redesign';
                    const roomType = room.roomType || 'Living Room';
                    const style = (room as any).designStyle || room.theme || 'Modern';

                    return (
                      <tr key={room._id || room.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img src={imgUrl} alt={title} className="w-12 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0" />
                            <span className="font-bold text-slate-900 dark:text-white font-heading truncate max-w-[140px] sm:max-w-[180px]">{title}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] inline-block">
                              {roomType}
                            </span>
                            <p className="text-slate-400 font-medium text-[11px]">{style}</p>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-[11px]">
                            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                            4 Credits
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                          {(room as any).createdAt ? new Date((room as any).createdAt).toLocaleDateString() : 'Recently'}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={imgUrl}
                              download="room-redesign.jpg"
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-600 hover:text-white transition-all shadow-2xs"
                              title="Download High-Res Render Image"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <Link
                              href="/projects"
                              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-600 hover:text-white transition-all shadow-2xs"
                              title="View Project"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Common Table Pagination Component */}
          <CommonPagination
            currentPage={currentPage}
            totalItems={userRooms.length || 1}
            pageSize={settings.tablePaginationLimit || 10}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Live Event Activity Feed (1 Column) */}
        <div className="lg:col-span-1">
          <RecentActivityWidget />
        </div>
      </div>

      {/* Lower Section: Quick Studio Generator & AI Style Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Quick Studio Generator (2 Columns) */}
        <div className="lg:col-span-2">
          <QuickRedesignStudio />
        </div>

        {/* AI Style Suggestion Card (1 Column) */}
        <div className="lg:col-span-1 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>AI Style Suggestions</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Recommended
              </span>
            </div>

            <div className="space-y-4 mt-4">
              {AI_SUGGESTIONS.map((t) => (
                <Link
                  key={t.title}
                  href={`/generate`}
                  className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all block space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-2xl text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      {t.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/generate"
            className="w-full py-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-300 font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-purple-200 dark:border-purple-800/60"
          >
            <span>Open AI Studio</span>
            <Wand2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
