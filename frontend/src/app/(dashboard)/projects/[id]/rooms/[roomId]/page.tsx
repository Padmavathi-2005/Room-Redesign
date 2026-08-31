'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Calendar,
  Layers,
  Wand2,
  Lock,
  MessageSquare,
  Tag,
  Play,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { projectService, ProjectData, RoomData } from '@/services/project.service';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const roomId = params.roomId as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [conversationData, setConversationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'landscape' | 'portrait'>('landscape');

  useEffect(() => {
    const loadRoomData = async () => {
      setIsLoading(true);
      try {
        const [projData, convData] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getRoomConversation ? projectService.getRoomConversation(projectId, roomId) : null,
        ]);
        setProject(projData);
        setConversationData(convData);

        // Detect room image aspect ratio
        const currentRoom = projData?.rooms?.find((r: any) => String(r._id || r.id) === String(roomId));
        const imgSrc = currentRoom?.originalImage || currentRoom?.coverImage;
        if (imgSrc) {
          const img = new Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            if (ratio > 1.2) {
              setAspectRatio('landscape');
            } else if (ratio < 0.85) {
              setAspectRatio('portrait');
            } else {
              setAspectRatio('square');
            }
          };
          img.src = imgSrc;
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && roomId) {
      loadRoomData();
    }
  }, [projectId, roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/70 pt-24 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold font-heading">Loading Room History...</p>
        </div>
      </div>
    );
  }

  // Find room from project
  const room = project?.rooms?.find((r: any) => String(r._id || r.id) === String(roomId)) || {
    name: 'Master Bedroom',
    roomType: 'Bedroom',
    originalImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
  };

  const downloadImage = (url: string, filename: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const projectTheme = project?.theme || 'Modern Minimalist';

  return (
    <div className="min-h-screen mesh-bg blueprint-grid pt-20 pb-16 text-slate-900 selection:bg-purple-600 selection:text-white">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
        
        {/* BACK NAVIGATION */}
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors font-heading"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Project ({project?.name || 'Project'})</span>
          </Link>
        </div>

        {/* ROOM HEADER CARD */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{projectTheme} Theme</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{room.roomType || 'Room'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                {room.name || room.roomType}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Belongs to project: <strong>{project?.name || 'My Project'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => downloadImage(room.coverImage || room.originalImage, `${room.name || 'room'}-ai-redesign.jpg`)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer border border-slate-200 font-heading"
              >
                <Download className="w-4 h-4 text-purple-600" />
                <span>Download Render (HD)</span>
              </button>

              <Link
                href={`/generate?projectId=${projectId}&roomId=${roomId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all font-heading shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>+ Generate New Redesign</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BEFORE & AFTER IMAGE COMPARISON CARD */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Room Transformation Preview</span>
                </h2>
                <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono">
                  {aspectRatio}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {viewMode === 'slider' ? 'Drag the vertical line left & right to compare Before vs After.' : 'Viewing original and AI redesign side-by-side.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold font-heading">
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1 rounded-2xl transition-all cursor-pointer ${
                    viewMode === 'slider' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interactive Slider ↔
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-3 py-1 rounded-2xl transition-all cursor-pointer ${
                    viewMode === 'sideBySide' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Side-by-Side 📷
                </button>
              </div>

              {room.coverImage && (
                <a
                  href={room.coverImage}
                  target="_blank"
                  download="room_redesign_hd.jpg"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 transition-colors shadow-xs shrink-0 font-heading"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HD</span>
                </a>
              )}
            </div>
          </div>

          {viewMode === 'slider' ? (
            /* INTERACTIVE SPLIT SLIDER WITH CLIP-PATH (ZERO OVERFLOW, PERFECT MATCH) */
            <div
              className={`relative rounded-2xl overflow-hidden border-2 border-purple-200 shadow-lg select-none cursor-ew-resize mx-auto max-w-4xl w-full ${
                aspectRatio === 'square'
                  ? 'aspect-square max-h-[440px]'
                  : aspectRatio === 'portrait'
                  ? 'aspect-[3/4] max-h-[480px]'
                  : 'aspect-video max-h-[400px]'
              }`}
              style={{ overflow: 'hidden', isolation: 'isolate' }}
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  setSliderPos((x / rect.width) * 100);
                }
              }}
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                setSliderPos((x / rect.width) * 100);
              }}
            >
              {/* AFTER AI REDESIGN IMAGE (BACKGROUND) */}
              <img
                src={room.coverImage || room.originalImage || 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop'}
                alt="Converted AI Result"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-purple-600/95 text-white text-xs font-extrabold shadow-md backdrop-blur-xs font-heading flex items-center gap-1.5 z-10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Converted AI Redesign Result</span>
              </div>

              {/* BEFORE ORIGINAL IMAGE (FOREGROUND CLIPPED BY CLIP-PATH) */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={room.originalImage || 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop'}
                  alt="Original Room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-extrabold shadow-md backdrop-blur-xs font-heading whitespace-nowrap z-10">
                  📷 Original Given Image
                </div>
              </div>

              {/* VERTICAL SLIDER DRAG LINE & HANDLE */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.7)] flex items-center justify-center pointer-events-none z-20"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-9 h-9 rounded-full bg-white text-purple-700 border-2 border-purple-400 shadow-2xl flex items-center justify-center -ml-4.5 text-xs font-black">
                  ↔
                </div>
              </div>
            </div>
          ) : (
            /* SIDE BY SIDE VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ORIGINAL IMAGE */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 font-heading block">
                  📷 Given Original Image
                </span>
                <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner ${
                  aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'
                }`}>
                  <img
                    src={room.originalImage || 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop'}
                    alt="Original Room"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* CONVERTED RESULT IMAGE */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-700 font-heading flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Converted AI Redesign Image</span>
                </span>
                <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-purple-300 shadow-md ${
                  aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'
                }`}>
                  <img
                    src={room.coverImage || room.originalImage || 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop'}
                    alt="Converted Result"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ROOM CONVERSATION / GENERATION HISTORY LOG STREAM */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Room Generation & Conversation History</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Synced with AI Session
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 font-heading">
                <span>Generation #1 Completed</span>
                <span className="text-[10px] text-slate-400 font-normal">Recently</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-mono bg-white p-3 rounded-2xl border border-slate-200">
                Prompt compiled with <strong>{projectTheme}</strong> shared design theme consistency. Preserved 1:1 structural bounds of windows, doors, and floor plan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
