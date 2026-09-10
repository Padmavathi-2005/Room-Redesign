'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Folder,
  Lock,
  MessageSquare,
  Sparkles,
  Plus,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Download,
  Calendar,
  Zap,
  Settings,
  Palette,
  Sliders,
  ChevronRight,
  PlusCircle,
  X,
  FileText,
  Upload,
  Trash2,
} from 'lucide-react';
import { projectService, ProjectData } from '@/services/project.service';
import { ROOM_TYPES } from '@/constants';
import { useTranslation } from '@/context/LanguageContext';

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLocalizedRoomType = (roomType?: string) => {
    if (!roomType) return '';
    const norm = roomType.toLowerCase().replace(/[\s_-]/g, '');
    const map: Record<string, string> = {
      all: t('designs.categories.all'),
      livingroom: t('designs.categories.livingRoom'),
      living: t('designs.categories.livingRoom'),
      bedroom: t('designs.categories.bedroom'),
      masterbedroom: t('projects.roomTypes.masterBedroom'),
      kitchen: t('designs.categories.kitchen'),
      openkitchenlivingroom: `${t('designs.categories.kitchen')} & ${t('designs.categories.livingRoom')}`,
      bathroom: t('projects.roomTypes.bathroom'),
      diningroom: t('projects.roomTypes.diningRoom'),
      office: t('designs.categories.office'),
      homeoffice: t('projects.roomTypes.homeOffice'),
      kidsbedroom: t('projects.roomTypes.kidsBedroom'),
      kidsroom: t('projects.roomTypes.kidsBedroom'),
      balcony: t('projects.roomTypes.balcony'),
      outdoorpatio: t('projects.roomTypes.outdoorPatio'),
      patio: t('projects.roomTypes.outdoorPatio'),
      villa: t('designs.categories.villa'),
      industrial: t('designs.categories.industrial'),
      commercial: t('designs.categories.commercial'),
    };
    return map[norm] || map[roomType] || roomType;
  };

  const getLocalizedStyle = (style?: string) => {
    if (!style) return '';
    const styleKey = style.toLowerCase().replace(/[\s_-]/g, '');
    const directName = t(`styles.${style.toLowerCase()}.name` as any);
    if (directName && !directName.startsWith('styles.')) {
      return directName;
    }
    const normName = t(`styles.${styleKey}.name` as any);
    if (normName && !normName.startsWith('styles.')) {
      return normName;
    }
    return style;
  };

  // Add Room Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [selectedRoomForDrawer, setSelectedRoomForDrawer] = useState<any | null>(null);
  const [selectedDrawerImage, setSelectedDrawerImage] = useState<string | null>(null);
  const [domainScope, setDomainScope] = useState<'interior' | 'exterior' | 'floorplan'>('interior');
  const [roomName, setRoomName] = useState<string>('');
  const [roomType, setRoomType] = useState<string>('Living Room');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Light Oak Hardwood']);
  const [furnitureHandling, setFurnitureHandling] = useState<'replace' | 'reuse' | 'repair'>('replace');
  const [budgetLevel, setBudgetLevel] = useState<'Low' | 'Medium' | 'Premium' | 'Luxury'>('Medium');
  const [customNotes, setCustomNotes] = useState<string>('');

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      if (selectedMaterials.length > 1) {
        setSelectedMaterials(selectedMaterials.filter((m) => m !== mat));
      }
    } else {
      if (selectedMaterials.length < 10) {
        setSelectedMaterials([...selectedMaterials, mat]);
      }
    }
  };
  const [uploadedRoomImage, setUploadedRoomImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<'square' | 'landscape' | 'portrait'>('landscape');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [showcaseMode, setShowcaseMode] = useState<'slider' | 'sideBySide'>('slider');
  const [isAddingRoom, setIsAddingRoom] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStage, setGenerationStage] = useState<string>('Initializing AI Generation...');

  const getCategoryOptions = () => {
    if (domainScope === 'exterior') {
      return ['Facade & Front Elevation', 'Patio & Deck', 'Backyard & Garden', 'Rooftop Terrace', 'Pool House', 'Garage Facade'];
    }
    if (domainScope === 'floorplan') {
      return ['2D Floor Plan to 3D Render', 'Architectural Layout Map', 'Open Concept Living Plan', 'Furniture Placement Map'];
    }
    return ['Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Home Office', 'Kids Bedroom', 'Balcony'];
  };

  const getMaterialOptions = () => {
    if (domainScope === 'exterior') {
      return ['Exposed Brick', 'Modern Stucco', 'Vertical Wood Siding', 'Natural Cut Stone', 'Glass Curtain Wall'];
    }
    if (domainScope === 'floorplan') {
      return ['Natural Oak Hardwood', 'Polished Concrete', 'Porcelain Tiles', 'Terrazzo Flooring', 'Walnut Parquet'];
    }
    return ['Light Oak Hardwood', 'Venetian Plaster', 'Marble Tile', 'Linen Textiles', 'Matte Black Metal'];
  };

  const getProjectExactThemeColors = (projectData?: ProjectData | null) => {
    const pal = (projectData?.colorPalette || projectData?.theme || '').toLowerCase();
    
    let primary = (projectData?.primaryColor && projectData.primaryColor.trim() !== '')
      ? projectData.primaryColor
      : projectData?.designTheme?.primaryColors?.[0];

    let secondary = (projectData?.secondaryColor && projectData.secondaryColor.trim() !== '')
      ? projectData.secondaryColor
      : projectData?.accentColor || projectData?.designTheme?.secondaryColors?.[0] || projectData?.designTheme?.accentColors?.[0];

    if (!primary || typeof primary !== 'string' || primary.trim() === '') {
      if (pal.includes('emerald') || pal.includes('green')) primary = '#059669';
      else if (pal.includes('blue') || pal.includes('navy')) primary = '#2563eb';
      else if (pal.includes('amber') || pal.includes('gold') || pal.includes('warm')) primary = '#d97706';
      else if (pal.includes('rose') || pal.includes('pink')) primary = '#e11d48';
      else primary = '#9333ea'; // Studio Purple
    }

    if (!secondary || typeof secondary !== 'string' || secondary.trim() === '') {
      if (pal.includes('emerald') || pal.includes('green')) secondary = '#0d9488';
      else if (pal.includes('blue') || pal.includes('navy')) secondary = '#4f46e5';
      else if (pal.includes('amber') || pal.includes('gold') || pal.includes('warm')) secondary = '#ea580c';
      else if (pal.includes('rose') || pal.includes('pink')) secondary = '#db2777';
      else secondary = '#4f46e5'; // Studio Indigo
    }

    return {
      primary,
      secondary,
      primaryStyle: { backgroundColor: primary, color: '#ffffff' },
      primaryTextStyle: { color: primary },
      primaryBorderStyle: { borderColor: `${primary}40` },
      primaryLightBgStyle: { backgroundColor: `${primary}14`, borderColor: `${primary}38` },
      primaryBadgeStyle: { backgroundColor: `${primary}1a`, color: primary },
      secondaryBadgeStyle: { backgroundColor: `${secondary}1a`, color: secondary },
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isRoomModalOpen || selectedRoomForDrawer) {
      document.body.setAttribute('data-modal-open', 'true');
      document.documentElement.setAttribute('data-modal-open', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.removeAttribute('data-modal-open');
      document.documentElement.removeAttribute('data-modal-open');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.removeAttribute('data-modal-open');
      document.documentElement.removeAttribute('data-modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isRoomModalOpen, selectedRoomForDrawer]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedRoomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsAddingRoom(true);
    setGenerationProgress(5);
    setGenerationStage('🔍 Analyzing Room Geometry & Structural Bounds...');

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 92) return prev;
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next < 25) {
          setGenerationStage('🔍 Analyzing Room Geometry & Structural Bounds...');
        } else if (next < 50) {
          setGenerationStage('🎨 Synthesizing Selected Materials & Textures...');
        } else if (next < 75) {
          setGenerationStage('💡 Calculating 3D Ambient Illumination & Shadows...');
        } else if (next < 92) {
          setGenerationStage('✨ Rendering Photorealistic 8K Architectural Details...');
        }
        return next;
      });
    }, 350);

    try {
      const newRoom = await projectService.createRoom(projectId, {
        name: roomName,
        roomType: roomType,
        materials: selectedMaterials,
        originalImage: uploadedRoomImage || undefined,
      });

      setGenerationProgress(100);
      setGenerationStage('🎉 Finalizing Room Redesign Showcase...');
      await new Promise((r) => setTimeout(r, 500));

      clearInterval(interval);
      setIsRoomModalOpen(false);
      setRoomName('');
      setCustomNotes('');
      setUploadedRoomImage(null);
      await fetchProject();

      const newRoomId = newRoom._id || newRoom.id;
      if (newRoomId) {
        router.push(`/projects/${projectId}/rooms/${newRoomId}`);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      clearInterval(interval);
    } finally {
      setIsAddingRoom(false);
      setGenerationProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/70 pt-24 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold font-heading">Loading Project Workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-100/70 pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 font-heading">Project Not Found</h2>
          <p className="text-xs text-slate-500">The requested project could not be found or was removed.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold font-heading"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects Workspace
          </Link>
        </div>
      </div>
    );
  }

  const rooms = project.rooms || [];
  const totalImages = project.totalGeneratedImages ?? rooms.reduce((acc: number, r: any) => acc + (r.generatedImages?.length || (r.coverImage || r.originalImage ? 1 : 0)), 0);
  const designTheme = project.designTheme || {};
  const themeColors = getProjectExactThemeColors(project);

  return (
    <div className="min-h-screen mesh-bg blueprint-grid pt-20 pb-16 text-slate-900 selection:bg-purple-600 selection:text-white">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
        
        {/* TOP NAVIGATION LINK */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors font-heading"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Projects Workspace</span>
          </Link>
        </div>

        {/* UNIFIED HERO HEADER (CLEAN & TRANSPARENT WITHOUT HEAVY BACKGROUND BOX) */}
        <div className="py-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* LEFT: PROJECT TITLE & DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold font-heading shadow-xs"
                  style={themeColors.primaryBadgeStyle}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{project.theme} Theme</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold font-mono">
                  Active Workspace
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* RIGHT: PRIMARY ACTION BUTTONS */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRoomModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all font-heading cursor-pointer shrink-0"
                style={themeColors.primaryStyle}
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-white font-extrabold">{t('projects.addRoom')}</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Project Settings Console')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all font-heading cursor-pointer border border-slate-200/80 dark:border-slate-700"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>{t('projects.settings')}</span>
              </button>
            </div>
          </div>

          {/* INTEGRATED INLINE STATS BAR */}
          <div className="flex items-center gap-3 sm:gap-6 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }} />
              <span className="font-extrabold text-slate-900 font-heading">
                🏠 {rooms.length} {rooms.length === 1 ? t('projects.room') : t('projects.rooms')}
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 font-heading">
                🖼️ {totalImages} {t('projects.generatedRenders')}
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-700 font-heading">
                🎨 {t('projects.palette')}: {project.colorPalette || 'Warm White & Brass'}
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">
                🕒 {t('projects.updatedToday')}
              </span>
            </div>
          </div>
        </div>

        {/* COMPACT DESIGN STYLE BAR (MINIMAL TRANSPARENT BAR) */}
        <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-purple-600" style={themeColors.primaryTextStyle} />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold font-heading text-slate-900 block">
                {t('projects.lockedProjectStyle')}: <strong style={themeColors.primaryTextStyle}>{getLocalizedStyle(designTheme.style) || designTheme.style || getLocalizedStyle(project.theme) || project.theme || 'Modern Minimalist'}</strong>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 block">
                {t('projects.styleConsistencyNote')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="px-3 py-1 rounded-2xl text-[11px] font-extrabold font-heading border border-slate-200 bg-white/90 shadow-2xs text-slate-700">
              🪵 {(designTheme.materials || ['Light Oak', 'Linen']).join(', ')}
            </span>
            <span className="px-3 py-1 rounded-2xl text-[11px] font-extrabold font-heading border border-slate-200 bg-white/90 shadow-2xs text-slate-700">
              💡 {designTheme.lighting || 'Warm Ambient 3000K'}
            </span>
          </div>
        </div>

        {/* ROOMS STUDIO WORKSPACE SECTION */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                {t('projects.roomsStudio')}
              </h2>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono"
                style={themeColors.primaryBadgeStyle}
              >
                {rooms.length} {rooms.length === 1 ? t('projects.room') : t('projects.rooms')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className="text-xs font-extrabold hover:underline flex items-center gap-1 font-heading cursor-pointer"
              style={themeColors.primaryTextStyle}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('projects.addRoom')}</span>
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">{t('projects.noRoomsCreatedYet')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {t('projects.generateFirstRoomDesc', { theme: getLocalizedStyle(project.theme) || project.theme })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md font-heading cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('projects.addFirstRoom')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room: any, idx: number) => {
                const roomId = room._id || room.id || `room-${idx}`;
                const roomImg = room.coverImage || room.originalImage || (room.generatedImages && room.generatedImages[0]) || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop';
                const imageCount = room.generatedImages?.length || (room.coverImage || room.originalImage ? 1 : 0);

                return (
                  <div
                    key={roomId}
                    onClick={() => {
                      setSelectedRoomForDrawer(room);
                      const initialImg = room.coverImage || room.originalImage || (room.generatedImages && room.generatedImages[0]) || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop';
                      setSelectedDrawerImage(initialImg);
                    }}
                    className="relative rounded-[14px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* CARD IMAGE CONTAINER WITH SKELETON BACKDROP */}
                      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={roomImg}
                          alt={room.name || room.roomType}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* TOP LEFT: FLOATING ROOM TYPE BADGE */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/30 shadow-md">
                            {getLocalizedRoomType(room.roomType || room.name) || t('projects.room')}
                          </span>
                        </div>

                        {/* TOP RIGHT: ACCURATE IMAGE COUNT BADGE */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/20 shadow-md flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-purple-300" />
                            <span>{imageCount} {imageCount === 1 ? t('projects.image') : t('projects.images')}</span>
                          </span>
                        </div>

                        {/* BOTTOM GRADIENT OVERLAY */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent text-white transition-opacity">
                          <h3 className="font-extrabold text-base font-heading text-white line-clamp-1">
                            {room.name || getLocalizedRoomType(room.roomType)}
                          </h3>
                          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1 font-medium">
                            <span className="text-purple-300 font-bold">{getLocalizedStyle(project.theme) || project.theme}</span>
                            <span className="inline-flex items-center gap-1 text-white font-bold group-hover:text-purple-300 transition-colors">
                              <span>{t('projects.openRoom')}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ADD ROOM MODAL */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <div data-modal-open="true" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-5xl w-full max-h-[88vh] overflow-y-auto overflow-x-hidden shadow-2xl space-y-6 relative text-left custom-modal-scroll"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full font-heading mb-1"
                    style={themeColors.primaryBadgeStyle}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('projects.roomsStudio')}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                    {t('projects.addRoomToProject', { name: project?.name || 'Project' })}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('projects.uploadRoomPhotoDesc', { theme: getLocalizedStyle(project?.theme) || project?.theme || '' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  aria-label={t('common.close')}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2-COLUMN STUDIO GRID */}
              <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* LEFT COLUMN: FORM CONTROLS (5 COLS) */}
                <div className="md:col-span-5 space-y-4">
                  {/* LOCKED PROJECT STYLE DEFAULTS BOX */}
                  <div
                    className="p-3 border rounded-2xl space-y-2 shadow-2xs"
                    style={themeColors.primaryLightBgStyle}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold font-heading flex items-center gap-1" style={themeColors.primaryTextStyle}>
                        <Lock className="w-3 h-3" />
                        <span>{t('projects.projectStyleDefaults')}</span>
                      </span>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full font-heading" style={themeColors.primaryBadgeStyle}>
                        🔒 {t('projects.lockedTheme')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{t('projects.themeStyleLabel')}</label>
                        <div className="px-2.5 py-1.5 bg-white/90 border rounded-2xl font-bold text-slate-800 text-[11px] flex items-center justify-between shadow-2xs" style={themeColors.primaryBorderStyle}>
                          <span className="truncate">{getLocalizedStyle(project?.theme) || project?.theme || 'Modern Minimalist'}</span>
                          <Lock className="w-3 h-3 shrink-0 ml-1" style={themeColors.primaryTextStyle} />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{t('projects.colorPalette')}</label>
                        <div className="px-2.5 py-1.5 bg-white/90 border rounded-2xl font-bold text-slate-800 text-[11px] flex items-center justify-between shadow-2xs" style={themeColors.primaryBorderStyle}>
                          <span className="truncate">{project?.colorPalette || 'Warm White & Brass'}</span>
                          <Lock className="w-3 h-3 shrink-0 ml-1" style={themeColors.primaryTextStyle} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESIGN SCOPE SELECTOR */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading block">
                      {t('projects.redesignScope')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'interior', label: t('projects.interior'), icon: '🛋️' },
                        { id: 'exterior', label: t('projects.exterior'), icon: '🏡' },
                        { id: 'floorplan', label: t('projects.floorPlan'), icon: '📐' },
                      ].map((scope) => (
                        <button
                          key={scope.id}
                          type="button"
                          onClick={() => {
                            const newScope = scope.id as 'interior' | 'exterior' | 'floorplan';
                            setDomainScope(newScope);
                            if (newScope === 'exterior') {
                              setRoomType('Facade & Front Elevation');
                              setSelectedMaterials(['Exposed Brick']);
                            } else if (newScope === 'floorplan') {
                              setRoomType('2D Floor Plan to 3D Render');
                              setSelectedMaterials(['Natural Oak Hardwood']);
                            } else {
                              setRoomType('Living Room');
                              setSelectedMaterials(['Light Oak Hardwood']);
                            }
                          }}
                          className={`px-2.5 py-2 rounded-2xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1 cursor-pointer font-heading ${
                            domainScope === scope.id
                              ? 'border-transparent shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          style={domainScope === scope.id ? themeColors.primaryStyle : undefined}
                        >
                          <span>{scope.icon}</span>
                          <span>{scope.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ORIGINAL ROOM PHOTO UPLOAD */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading flex items-center justify-between">
                      <span>
                        {domainScope === 'exterior'
                          ? 'Original Exterior Photo'
                          : domainScope === 'floorplan'
                          ? '2D Floor Plan Drawing / Layout'
                          : 'Original Room Photo (Before Photo)'}
                      </span>
                      <span className="text-[10px] font-extrabold font-heading" style={themeColors.primaryTextStyle}>Required</span>
                    </label>
                    {uploadedRoomImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-[160px] group shadow-xs">
                        <img src={uploadedRoomImage} alt="Room Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedRoomImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 rounded-2xl cursor-pointer transition-all group text-center">
                        <Upload className="w-6 h-6 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-extrabold text-slate-800 font-heading">Click or Drag & Drop Photo</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG or WEBP (Max 10MB)</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* ROOM / AREA NAME */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {domainScope === 'exterior' ? 'Exterior Area Name' : domainScope === 'floorplan' ? 'Layout Title' : 'Room Name'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder={
                        domainScope === 'exterior'
                          ? 'e.g. Front Facade & Lawn'
                          : domainScope === 'floorplan'
                          ? 'e.g. Ground Floor Master Layout'
                          : 'e.g. Master Bedroom'
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  {/* DYNAMIC ROOM CATEGORY */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {domainScope === 'exterior' ? 'Exterior Category' : domainScope === 'floorplan' ? 'Plan Type' : 'Room Category'}
                    </label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                    >
                      {getCategoryOptions().map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MULTI-SELECT MATERIAL & TEXTURE FINISHES */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 font-heading">
                        Material & Texture Preferences
                      </label>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono" style={themeColors.primaryBadgeStyle}>
                        {selectedMaterials.length} / 10 selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {getMaterialOptions().map((mat) => {
                        const isSelected = selectedMaterials.includes(mat);
                        return (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => toggleMaterial(mat)}
                            className={`px-2.5 py-1 rounded-2xl text-[10px] font-extrabold transition-all border cursor-pointer font-heading flex items-center gap-1 ${
                              isSelected
                                ? 'border-transparent shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                            style={isSelected ? themeColors.primaryStyle : undefined}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{mat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FURNITURE & LAYOUT HANDLING */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading block">
                      Furniture & Layout Handling
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'replace', label: 'Replace Everything' },
                        { id: 'reuse', label: 'Reuse Existing' },
                        { id: 'repair', label: 'Fix / Damaged Only' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFurnitureHandling(opt.id as any)}
                          className={`px-2 py-2 rounded-2xl text-[10px] font-extrabold border transition-all text-center cursor-pointer font-heading ${
                            furnitureHandling === opt.id
                              ? 'border-transparent shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                          style={furnitureHandling === opt.id ? themeColors.primaryStyle : undefined}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BUDGET LEVEL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading block">
                      Budget Level
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['Low', 'Medium', 'Premium', 'Luxury'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudgetLevel(b as any)}
                          className={`px-2 py-2 rounded-2xl text-[10px] font-extrabold border transition-all text-center cursor-pointer font-heading ${
                            budgetLevel === b
                              ? 'border-transparent shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                          style={budgetLevel === b ? themeColors.primaryStyle : undefined}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CUSTOM INSTRUCTIONS / NOTES */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      {t('projects.customInstructions')} <span className="text-slate-400 font-normal">({t('common.cancel') ? 'Optional' : ''})</span>
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder={
                        domainScope === 'exterior'
                          ? 'e.g. Add dark wooden cladding, floor-to-ceiling glass windows, and warm outdoor lighting...'
                          : domainScope === 'floorplan'
                          ? 'e.g. Convert 2D draft drawing into photorealistic 3D interior render with oak hardwood flooring...'
                          : 'e.g. Add a velvet emerald sofa, oak wall slats, and warm 3000K ambient illumination...'
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none font-semibold"
                    />
                  </div>

                  {/* SUBMIT ACTION BUTTONS */}
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsRoomModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingRoom}
                      className="px-5 py-2.5 rounded-2xl text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all font-heading cursor-pointer flex items-center gap-2"
                      style={themeColors.primaryStyle}
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>{isAddingRoom ? t('projects.creatingRoom') : t('projects.createAndGenerateRoom')}</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: LIVE BEFORE & AFTER DYNAMIC SLIDER SHOWCASE (7 COLS) */}
                <div className="md:col-span-7 space-y-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between overflow-x-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" style={themeColors.primaryTextStyle} />
                        <span className="text-xs font-extrabold text-slate-800 font-heading">
                          {t('projects.roomShowcasePreview')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono" style={themeColors.secondaryBadgeStyle}>
                          {imageAspectRatio}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-extrabold">
                          <Lock className="w-3 h-3" />
                          <span>{getLocalizedStyle(project?.theme) || project?.theme || 'Theme'}</span>
                        </span>
                      </div>
                    </div>

                    {/* INTERACTIVE BEFORE / AFTER SLIDER SHOWCASE OR LIVE PROGRESS LOADER */}
                    {isAddingRoom ? (
                      <div className="space-y-4 p-6 bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-900 rounded-2xl text-center text-white shadow-xl my-auto border border-purple-500/30">
                        <div className="relative w-16 h-16 mx-auto my-2">
                          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xs font-mono text-amber-300">
                            {generationProgress}%
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold font-heading text-white tracking-wide">
                            {t('projects.aiRedesign')}
                          </h3>
                          <p className="text-xs font-semibold text-purple-200 animate-pulse transition-all">
                            {generationStage}
                          </p>
                        </div>

                        {/* ANIMATED PROGRESS BAR */}
                        <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
                          <span>{t('projects.lockedTheme')}: {getLocalizedStyle(project?.theme) || project?.theme || 'Theme'}</span>
                          <span>•</span>
                          <span>{selectedMaterials.length} Materials Active</span>
                        </div>
                      </div>
                    ) : uploadedRoomImage ? (
                      <div className="space-y-2">
                        {/* TOGGLE MODES */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 font-heading">
                            {showcaseMode === 'slider' ? t('projects.dragLineToCompare') : t('projects.sideBySideView')}
                          </span>
                          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-2xl text-[10px] font-bold font-heading">
                            <button
                              type="button"
                              onClick={() => setShowcaseMode('slider')}
                              className={`px-2 py-0.5 rounded-2xl transition-all ${
                                showcaseMode === 'slider' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              {t('projects.interactiveSlider')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowcaseMode('sideBySide')}
                              className={`px-2 py-0.5 rounded-2xl transition-all ${
                                showcaseMode === 'sideBySide' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              {t('projects.sideBySide')}
                            </button>
                          </div>
                        </div>

                        {showcaseMode === 'slider' ? (
                          /* INTERACTIVE SPLIT SLIDER WITH CLIP-PATH (ZERO OVERFLOW, PERFECT MATCH) */
                          <div
                            className={`relative rounded-2xl overflow-hidden border border-purple-300 shadow-md select-none cursor-ew-resize w-full ${
                              imageAspectRatio === 'square'
                                ? 'aspect-square max-h-[320px]'
                                : imageAspectRatio === 'portrait'
                                ? 'aspect-[3/4] max-h-[340px]'
                                : 'aspect-video max-h-[280px]'
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
                            {/* BLANK AI REDESIGN CANVAS (BACKGROUND) */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-900 flex flex-col items-center justify-center p-4 text-center select-none pointer-events-none">
                              <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center mb-2 shadow-inner">
                                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                              </div>
                              <span className="text-xs font-extrabold text-white font-heading tracking-wide">
                                {t('projects.aiRedesignCanvas')}
                              </span>
                              <span className="text-[10px] text-purple-200 mt-0.5 max-w-[180px] leading-tight font-semibold">
                                {t('projects.readyToGenerateIn', { theme: getLocalizedStyle(project?.theme) || project?.theme || 'Project Theme' })}
                              </span>
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-extrabold shadow-sm backdrop-blur-xs font-heading z-10">
                                ✨ AI Canvas
                              </div>
                            </div>

                            {/* BEFORE IMAGE (FOREGROUND CLIPPED BY CLIP-PATH) */}
                            <div
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                            >
                              <img
                                src={uploadedRoomImage}
                                alt="Original Before"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[9px] font-extrabold shadow-sm backdrop-blur-xs font-heading whitespace-nowrap z-10">
                                📷 {t('projects.originalImage')}
                              </div>
                            </div>

                            {/* SLIDER LINE HANDLE */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)] flex items-center justify-center pointer-events-none z-20"
                              style={{ left: `${sliderPos}%` }}
                            >
                              <div className="w-6 h-6 rounded-full bg-white text-purple-700 border border-purple-300 shadow-lg flex items-center justify-center -ml-3 text-[10px] font-black">
                                ↔
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* SIDE BY SIDE VIEW */
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-600 block">{t('projects.originalImage')}</span>
                              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-square">
                                <img src={uploadedRoomImage} alt="Original" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-purple-700 block">{t('projects.aiRedesignCanvas')}</span>
                              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-900 border border-purple-300 aspect-square flex flex-col items-center justify-center p-3 text-center">
                                <Sparkles className="w-6 h-6 text-amber-300 mb-1 animate-pulse" />
                                <span className="text-xs font-extrabold text-white font-heading">{t('projects.aiRedesign')}</span>
                                <span className="text-[9px] text-purple-200 mt-0.5">{t('projects.readyToGenerateIn', { theme: '' })}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* NO IMAGE UPLOADED PLACEHOLDER */
                      <div className="space-y-3">
                        <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50 text-purple-400" />
                          <span className="text-xs font-bold text-slate-300 font-heading">Upload a Photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Supports Square, Landscape & Portrait</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-2xl bg-purple-50/90 border border-purple-200 text-[10px] font-semibold text-purple-900 font-heading leading-relaxed">
                    ⚡ {t('projects.aspectRatioGuarantee')}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDE SLIDE-OVER CANVAS DRAWER (50% DARK BACKDROP, SHOWS ALL IMAGES) */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedRoomForDrawer && (
            <>
              {/* 50% DARKNESS BACKDROP OVERLAY */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRoomForDrawer(null)}
                className="fixed inset-0 z-[99998] bg-slate-950/50 backdrop-blur-xs"
              />

              {/* RIGHT SIDE SLIDE-OVER SHEET */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed top-0 right-0 bottom-0 z-[99999] w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
              >
                {/* DRAWER HEADER */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                          {getLocalizedRoomType(selectedRoomForDrawer.roomType || selectedRoomForDrawer.name) || t('projects.room')}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {project.name}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                        {selectedRoomForDrawer.name || getLocalizedRoomType(selectedRoomForDrawer.roomType)}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${projectId}/rooms/${selectedRoomForDrawer._id || selectedRoomForDrawer.id}`}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-extrabold transition-colors font-heading flex items-center gap-1"
                      >
                        <span>{t('projects.fullWorkspace')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedRoomForDrawer(null)}
                        aria-label={t('projects.closeDrawer')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* MAIN SELECTED IMAGE VIEW */}
                  <div className="space-y-4">
                    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md group">
                      <img
                        src={selectedDrawerImage || selectedRoomForDrawer.coverImage || selectedRoomForDrawer.originalImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop'}
                        alt="Room Render Preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <a
                          href={selectedDrawerImage || selectedRoomForDrawer.coverImage || selectedRoomForDrawer.originalImage}
                          download={`${selectedRoomForDrawer.name || 'room'}-render.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-white hover:bg-purple-600 transition-colors shadow-md border border-white/20 flex items-center gap-1 text-xs font-bold cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('common.download')}</span>
                        </a>
                      </div>
                    </div>

                    {/* ROOM IMAGES GALLERY GRID */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-white font-heading">
                        <span>{t('projects.allRoomRendersAndPhotos')}</span>
                        <span className="text-slate-400 font-normal text-[11px]">
                          {t('projects.selectImageToPreview')}
                        </span>
                      </div>

                      {/* LIST OF ALL IMAGES ONLY */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {(() => {
                          const allImgs: { url: string; label: string }[] = [];
                          if (selectedRoomForDrawer.originalImage) {
                            allImgs.push({ url: selectedRoomForDrawer.originalImage, label: t('projects.originalPhoto') });
                          }
                          if (selectedRoomForDrawer.coverImage && !allImgs.some((i) => i.url === selectedRoomForDrawer.coverImage)) {
                            allImgs.push({ url: selectedRoomForDrawer.coverImage, label: t('projects.renderNum', { num: 1 }) });
                          }
                          if (Array.isArray(selectedRoomForDrawer.generatedImages)) {
                            selectedRoomForDrawer.generatedImages.forEach((imgUrl: string, idx: number) => {
                              if (!allImgs.some((i) => i.url === imgUrl)) {
                                allImgs.push({ url: imgUrl, label: t('projects.renderNum', { num: idx + 1 }) });
                              }
                            });
                          }
                          if (allImgs.length === 0) {
                            allImgs.push({
                              url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
                              label: t('projects.renderNum', { num: 1 }),
                            });
                          }

                          return allImgs.map((imgObj, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedDrawerImage(imgObj.url)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                selectedDrawerImage === imgObj.url
                                  ? 'border-purple-600 shadow-md ring-2 ring-purple-600/30'
                                  : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <img src={imgObj.url} alt={imgObj.label} className="w-full h-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 p-1 bg-slate-950/80 backdrop-blur-xs text-[9px] font-bold text-white text-center truncate">
                                {imgObj.label}
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DRAWER FOOTER ACTION */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    {t('projects.themeStyleLabel')}: <strong className="text-slate-800 dark:text-slate-200">{getLocalizedStyle(project.theme) || project.theme}</strong>
                  </div>
                  <Link
                    href={`/generate?roomType=${encodeURIComponent(selectedRoomForDrawer.roomType || '')}&style=${encodeURIComponent(project.theme || '')}&presetImage=${encodeURIComponent(selectedDrawerImage || selectedRoomForDrawer.originalImage || '')}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all font-heading"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{t('projects.generateNewRender')}</span>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
