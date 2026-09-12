'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus,
  Folder,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Layers,
  CheckCircle2,
  X,
  Search,
  Share2,
  ChevronDown,
  Check,
  Lock,
  ChevronRight,
  Image as ImageIcon,
  Download,
  ExternalLink,
} from 'lucide-react';
import { projectService, ProjectData, RoomData } from '@/services/project.service';
import { marketplaceService } from '@/services/marketplace.service';
import { DESIGN_STYLES } from '@/constants';
import Modal from '@/components/ui/Modal';
import { useTranslation } from '@/context/LanguageContext';

export default function UserProjectsDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [mounted, setMounted] = useState<boolean>(false);
  const [fullscreenModalData, setFullscreenModalData] = useState<{
    originalImage: string;
    generatedImage: string;
    roomType: string;
    theme?: string;
  } | null>(null);
  const [lightboxViewMode, setLightboxViewMode] = useState<'slider' | 'sideBySide'>('slider');
  const [lightboxSliderPos, setLightboxSliderPos] = useState<number>(50);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectForCanvas, setSelectedProjectForCanvas] = useState<ProjectData | null>(null);

  // Create Project Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form fields
  const [projectName, setProjectName] = useState<string>('');
  const [projectTheme, setProjectTheme] = useState<string>('Modern');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (isModalOpen || selectedProjectForCanvas) {
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-modal-open');
    }
    return () => {
      document.body.removeAttribute('data-modal-open');
    };
  }, [isModalOpen, selectedProjectForCanvas]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projsData, roomsData] = await Promise.all([
        projectService.getProjects(),
        projectService.getAllRooms(),
      ]);
      setProjects(projsData);
      setAllRooms(roomsData);
    } catch (err) {
      console.error('Failed to load projects data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMessage(t('projects.enterProjectNameError'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const created = await projectService.createProject({
        name: projectName,
        theme: projectTheme,
        description: projectDescription,
      });

      setIsModalOpen(false);
      setProjectName('');
      setProjectDescription('');
      
      const newId = created?._id || created?.id;
      if (newId) {
        router.push(`/generate?projectId=${newId}`);
      } else {
        await loadData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      await projectService.deleteProject(id);
      await loadData();
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Clean Header: No background box, Title only, 1-2 word simple buttons */}
      {/* Clean Header: Title and + New Project button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          {t('projects.myProjects')} ({projects.length})
        </h1>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>{t('projects.newProject')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('projects.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <FolderPlus className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-heading">
            {t('projects.noProjectsFound')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('projects.noProjectsDesc')}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md font-heading"
          >
            <Plus className="w-4 h-4" /> {t('projects.createFirstProject')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const projId = proj._id || proj.id || '';
            const pRooms = allRooms.filter(
              (r) => String(r.projectId) === String(projId)
            );
            const coverImg =
              pRooms.length > 0
                ? pRooms[0]?.generatedImage || pRooms[0]?.coverImage || (proj.coverImage && !proj.coverImage.includes('unsplash') ? proj.coverImage : null)
                : null;

            return (
              <div
                key={projId}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
              >
                {/* PROJECT HEADER CARD BANNER */}
                {coverImg ? (
                  <div
                    onClick={() => setSelectedProjectForCanvas(proj)}
                    className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  >
                    <img
                      src={coverImg}
                      alt={proj.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* GLASSMORPHIC THEME BADGE */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-[11px] font-extrabold text-white border border-purple-400/30 font-heading shadow-md flex items-center gap-1.5 z-10">
                      <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>{proj.theme}</span>
                    </div>

                    {/* ROOMS COUNT BADGE */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-extrabold text-slate-200 border border-white/20 font-heading shadow-md z-10">
                      {pRooms.length} {pRooms.length === 1 ? t('projects.room') : t('projects.rooms')}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/70 to-slate-950 p-5 flex flex-col justify-between border-b border-purple-500/20 text-white select-none">
                    {/* Glowing Accent Light Orb & Pattern */}
                    <div className="absolute -top-10 -left-10 w-36 h-36 bg-purple-500/25 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                    <div className="absolute -right-4 -bottom-4 text-6xl font-extrabold text-purple-300/10 font-heading pointer-events-none uppercase tracking-tighter">
                      {proj.theme}
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      {/* VIBRANT PRIMARY FOLDER ICON BADGE */}
                      <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 border border-purple-400/40 flex items-center justify-center shrink-0">
                        <Folder className="w-5 h-5 text-white stroke-[2.5]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-[10px] font-extrabold text-purple-300 border border-purple-500/30 font-heading uppercase tracking-wider">
                          {proj.theme}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-[10px] font-bold text-slate-300 border border-slate-700">
                          0 {t('projects.rooms')}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold tracking-wider text-purple-400 uppercase font-heading">
                          {t('projects.workspaceReady')}
                        </span>
                        <p className="text-xs text-slate-300 font-medium">
                          {t('projects.noRedesignsYet')}
                        </p>
                      </div>

                      <Link
                        href={`/generate?projectId=${projId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.03] font-heading cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('projects.generate')}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* CARD BODY */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        onClick={() => setSelectedProjectForCanvas(proj)}
                        className="font-heading text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors cursor-pointer tracking-tight"
                      >
                        {proj.name}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteProject(projId, proj.name, e)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                        title={t('projects.deleteProject')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {proj.description && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={`/generate?projectId=${projId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] font-heading cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>{t('projects.generateRoom')}</span>
                    </Link>

                    <button
                      onClick={() => setSelectedProjectForCanvas(proj)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-extrabold transition-all cursor-pointer font-heading"
                    >
                      <span>{t('projects.openProject')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('projects.modalTitle')}
        subtitle={t('projects.modalSubtitle')}
        icon={<FolderPlus className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {t('projects.projectNameLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('projects.projectNamePlaceholder')}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {t('projects.themeStyleLabel')}
            </label>
            <button
              type="button"
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {(() => {
                const sObj = DESIGN_STYLES.find((s) => s.name === projectTheme);
                const sName = sObj ? (t(`styles.${sObj.id}.name`) !== `styles.${sObj.id}.name` ? t(`styles.${sObj.id}.name`) : sObj.name) : projectTheme;
                const sDesc = sObj ? (t(`styles.${sObj.id}.desc`) !== `styles.${sObj.id}.desc` ? t(`styles.${sObj.id}.desc`) : sObj.description) : '';
                return (
                  <div className="flex items-center gap-2 truncate text-left">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">
                      {sName} {sDesc ? `— ` : ''}
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        {sDesc}
                      </span>
                    </span>
                  </div>
                );
              })()}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isThemeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsThemeDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-1.5 z-20 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 space-y-1 backdrop-blur-xl"
                  >
                    {DESIGN_STYLES.map((style) => {
                      const isSelected = style.name === projectTheme;
                      const styleName = t(`styles.${style.id}.name`) !== `styles.${style.id}.name` ? t(`styles.${style.id}.name`) : style.name;
                      const styleDesc = t(`styles.${style.id}.desc`) !== `styles.${style.id}.desc` ? t(`styles.${style.id}.desc`) : style.description;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setProjectTheme(style.name);
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white font-bold shadow-2xs'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-900 dark:hover:text-purple-300'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold truncate">{styleName}</p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-purple-100 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                              {styleDesc}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {t('projects.descriptionLabel')}
            </label>
            <textarea
              rows={3}
              placeholder={t('projects.descriptionPlaceholder')}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-rose-500">{errorMessage}</p>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-heading"
            >
              {t('projects.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !projectName.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50 font-heading"
            >
              {isSubmitting ? t('projects.creating') : t('projects.createProject')}
            </button>
          </div>
        </form>
      </Modal>

      {/* RIGHT-SIDE SLIDE-OVER CANVAS DRAWER FOR SELECTED PROJECT */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedProjectForCanvas && (
            <>
              {/* 50% DARKNESS BACKDROP OVERLAY */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProjectForCanvas(null)}
                className="fixed inset-0 z-[99998] bg-slate-950/50 backdrop-blur-xs"
              />

              {/* RIGHT-SIDE SLIDE-OVER SHEET (70% WIDTH) */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed top-0 right-0 bottom-0 z-[99999] w-full lg:w-[70vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
              >
                <div className="space-y-6">
                  {/* ROOMS STUDIO SECTION IN CANVAS */}
                  <div className="space-y-4">
                    {(() => {
                      const pId = selectedProjectForCanvas._id || selectedProjectForCanvas.id;
                      const projRooms = allRooms.filter((r) => String(r.projectId) === String(pId));

                      return (
                        <>
                          {/* HEADER ROW WITH TITLE, ADD ROOM & CLOSE ICON */}
                          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-500/20">
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2.5">
                              <span>{t('projects.roomsStudio')}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/25 text-xs font-mono font-extrabold text-purple-700 dark:text-purple-200 border border-purple-200/60 dark:border-purple-400/35 shadow-2xs">
                                {projRooms.length}
                              </span>
                            </h3>

                            <div className="flex items-center gap-2.5">
                              <Link
                                href={`/generate?projectId=${pId}`}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/90 dark:bg-purple-500/20 dark:hover:bg-purple-600 dark:text-purple-200 dark:hover:text-white dark:border-purple-400/40 dark:hover:border-transparent dark:shadow-[0_0_14px_rgba(168,85,247,0.35)] transition-all flex items-center gap-1.5 text-xs font-extrabold font-heading shadow-2xs"
                              >
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                                <span>{t('projects.addRoom')}</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => setSelectedProjectForCanvas(null)}
                                aria-label={t('projects.closeDrawer')}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/90 dark:bg-[#151D2E] dark:hover:bg-purple-600 dark:text-slate-200 dark:hover:text-white dark:border dark:border-slate-700/80 dark:hover:border-purple-400/50 dark:shadow-[0_0_10px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
                              >
                                <X className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>

                          {/* PROJECT DESCRIPTION */}
                          {selectedProjectForCanvas.description && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              {selectedProjectForCanvas.description}
                            </p>
                          )}

                          {projRooms.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                              <FolderPlus className="w-10 h-10 text-purple-600 mx-auto opacity-70" />
                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                                {t('projects.noRoomsCreatedYet')}
                              </p>
                              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                {t('projects.generateFirstRoomDesc', {
                                  theme: getLocalizedStyle(selectedProjectForCanvas.theme) || selectedProjectForCanvas.theme || '',
                                })}
                              </p>
                              <Link
                                href={`/generate?projectId=${pId}`}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md font-heading"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>{t('projects.generateRoom')}</span>
                              </Link>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {projRooms.map((rm: any, idx: number) => {
                                const rmImg = rm.generatedImage || rm.coverImage || rm.originalImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop';
                                const origImg = rm.originalImage || rm.coverImage || rmImg;
                                const genImg = rm.generatedImage || rm.coverImage || rm.originalImage || rmImg;

                                return (
                                  <div
                                    key={rm._id || rm.id || idx}
                                    className="break-inside-avoid block relative rounded-2xl overflow-hidden bg-transparent border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                    onClick={() => setFullscreenModalData({
                                      originalImage: origImg,
                                      generatedImage: genImg,
                                      roomType: rm.roomType || rm.name || 'Living Room',
                                      theme: rm.theme || selectedProjectForCanvas?.theme || '',
                                    })}
                                  >
                                    {/* NATURAL UN-CROPPED RENDER IMAGE */}
                                    <div className="relative w-full overflow-hidden rounded-2xl bg-transparent">
                                      <img
                                        src={rmImg}
                                        alt="Room Render"
                                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl block border-0 outline-none"
                                      />

                                      {/* HOVER OVERLAY DIRECTLY OVER THE IMAGE (NO BLACKNESS) */}
                                      <div className="absolute inset-0 bg-transparent flex flex-col justify-between p-3.5 z-10 pointer-events-none">
                                        {/* TOP OVERLAY: ROOM TYPE BADGE */}
                                        <div className="flex items-center justify-between">
                                          <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-extrabold border border-white/20 font-heading shadow-md">
                                            {getLocalizedRoomType(rm.roomType || rm.name)}
                                          </span>
                                        </div>

                                        {/* BOTTOM OVERLAY: FULL DETAILS LINK BUTTON & DOWNLOAD BUTTON */}
                                        <div className="flex items-center justify-between gap-2 pt-2 pointer-events-auto">
                                          <Link
                                            href={`/generate?projectId=${encodeURIComponent(pId || '')}&generatedImage=${encodeURIComponent(rm.generatedImage || rmImg)}&presetImage=${encodeURIComponent(rm.originalImage || rm.beforeImageUrl || '')}&roomType=${encodeURIComponent(rm.roomType || rm.name || 'Living Room')}&style=${encodeURIComponent(rm.theme || selectedProjectForCanvas?.theme || 'Modern')}&desc=${encodeURIComponent(rm.prompt || rm.description || rm.name || '')}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5 font-heading cursor-pointer hover:scale-105"
                                            title={t('projects.fullDetails')}
                                          >
                                            <span>{t('projects.fullDetails')}</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </Link>

                                          <a
                                            href={rmImg}
                                            download="room-render.png"
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 rounded-xl bg-slate-900/90 hover:bg-purple-600 text-white transition-colors shadow-lg cursor-pointer border border-white/20"
                                            title={t('projects.downloadRender')}
                                          >
                                            <Download className="w-4 h-4" />
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* DRAWER FOOTER */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <Link
                    href={`/generate?projectId=${selectedProjectForCanvas._id || selectedProjectForCanvas.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all font-heading"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{t('projects.generateRoom')}</span>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* INTERACTIVE FULL-SCREEN COMPARISON LIGHTBOX MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {fullscreenModalData && (
            <div
              onClick={() => setFullscreenModalData(null)}
              className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 select-none overflow-y-auto"
            >
              {/* TOP CENTER CONTROL BAR (PRIMARY PURPLE ACTIVE PILL TOGGLE) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setLightboxViewMode('slider')}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer font-heading ${
                    lightboxViewMode === 'slider'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('projects.interactiveSlider')}
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxViewMode('sideBySide')}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer font-heading ${
                    lightboxViewMode === 'sideBySide'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('projects.sideBySide')}
                </button>
              </div>

              {/* TOP-RIGHT CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setFullscreenModalData(null)}
                className="fixed top-6 right-6 p-3 rounded-full bg-slate-900/90 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors z-30 cursor-pointer shadow-2xl border border-white/20"
                title={t('common.close')}
              >
                <X className="w-6 h-6" />
              </button>

              {/* MODAL MAIN CONTENT */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-6xl my-auto pt-16 pb-4 flex items-center justify-center"
              >
                {lightboxViewMode === 'slider' ? (
                  /* INTERACTIVE SPLIT SLIDER MODE WITH CLEAN IMAGE DISPLAY */
                  <div
                    className="relative max-h-[82vh] h-[78vh] w-auto max-w-full rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl select-none cursor-ew-resize mx-auto flex items-center justify-center bg-slate-950"
                    style={{ isolation: 'isolate' }}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                        setLightboxSliderPos((x / rect.width) * 100);
                      }
                    }}
                    onTouchMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const touch = e.touches[0];
                      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                      setLightboxSliderPos((x / rect.width) * 100);
                    }}
                  >
                    {/* AI REDESIGN (BACKGROUND) */}
                    <img
                      src={fullscreenModalData.generatedImage}
                      alt={t('projects.aiRedesign')}
                      className="h-[78vh] max-h-[82vh] w-auto max-w-full object-contain pointer-events-none block"
                    />

                    {/* ORIGINAL IMAGE (FOREGROUND CLIPPED BY CLIP-PATH) */}
                    <div
                      className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - lightboxSliderPos}% 0 0)` }}
                    >
                      <img
                        src={fullscreenModalData.originalImage}
                        alt={t('projects.originalImage')}
                        className="h-[78vh] max-h-[82vh] w-auto max-w-full object-contain block"
                      />
                    </div>

                    {/* VERTICAL SLIDER DRAG HANDLE (PRIMARY PURPLE HANDLE) */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] flex items-center justify-center pointer-events-none z-30"
                      style={{ left: `${lightboxSliderPos}%` }}
                    >
                      <div className="w-9 h-9 rounded-full bg-purple-600 text-white border-2 border-purple-300 shadow-2xl flex items-center justify-center -ml-4.5 text-xs font-black">
                        ↔
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SIDE-BY-SIDE MODE WITH PRIMARY PURPLE ACCENTS & DB DATA */
                  <div className="w-full max-w-6xl max-h-[82vh] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center justify-center p-2">
                    {/* 1. PRIMARY ORIGINAL IMAGE FROM DB */}
                    <div className="flex flex-col items-center justify-center space-y-2.5 h-full">
                      <div className="flex items-center gap-2">
                        <div className="px-3.5 py-1 rounded-full bg-slate-900/90 text-slate-200 text-xs font-extrabold border border-white/20 font-heading shadow-md">
                          📷 {t('projects.originalImage')}
                        </div>
                        <a
                          href={fullscreenModalData.originalImage}
                          download="primary-original-image.png"
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white transition-all shadow-md border border-white/20 cursor-pointer"
                          title={t('projects.originalImage')}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                      <img
                        src={fullscreenModalData.originalImage}
                        alt={t('projects.originalImage')}
                        className="max-w-full max-h-[74vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                      />
                    </div>

                    {/* 2. SECONDARY GENERATED REDESIGN FROM DB */}
                    <div className="flex flex-col items-center justify-center space-y-2.5 h-full">
                      <div className="flex items-center gap-2">
                        <div className="px-3.5 py-1 rounded-full bg-purple-600/95 text-white text-xs font-extrabold border border-purple-400/40 font-heading shadow-md flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>{t('projects.aiRedesign')} ({fullscreenModalData.theme ? `${getLocalizedStyle(fullscreenModalData.theme)} • ` : ''}{getLocalizedRoomType(fullscreenModalData.roomType) || ''})</span>
                        </div>
                        <a
                          href={fullscreenModalData.generatedImage}
                          download="secondary-ai-redesign.png"
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md border border-purple-400/40 cursor-pointer"
                          title={t('projects.aiRedesign')}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                      <img
                        src={fullscreenModalData.generatedImage}
                        alt={t('projects.aiRedesign')}
                        className="max-w-full max-h-[74vh] object-contain rounded-2xl shadow-2xl border border-purple-500/40 ring-2 ring-purple-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
