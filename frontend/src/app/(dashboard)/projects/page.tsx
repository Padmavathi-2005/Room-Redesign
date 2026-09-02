'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { projectService, ProjectData, RoomData } from '@/services/project.service';
import { marketplaceService } from '@/services/marketplace.service';
import { DESIGN_STYLES } from '@/constants';
import Modal from '@/components/ui/Modal';

export default function UserProjectsDashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    if (isModalOpen) {
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-modal-open');
    }
    return () => {
      document.body.removeAttribute('data-modal-open');
    };
  }, [isModalOpen]);

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
      setErrorMessage('Please enter a project name.');
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
          My Projects ({projects.length})
        </h1>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name or theme..."
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
            No projects found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first project workspace to organize your room redesigns and AI image transformations!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md font-heading"
          >
            <Plus className="w-4 h-4" /> Create Your First Project
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
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xl transition-all duration-300 relative"
              >
                {/* PROJECT HEADER CARD BANNER */}
                {coverImg ? (
                  <div
                    onClick={() => router.push(`/projects/${projId}`)}
                    className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={coverImg}
                      alt={proj.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-extrabold text-purple-300 border border-purple-500/30 font-heading">
                      {proj.theme}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-extrabold text-slate-300 border border-slate-700 font-heading">
                      {pRooms.length} {pRooms.length === 1 ? 'Room' : 'Rooms'}
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
                          0 Rooms
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold tracking-wider text-purple-400 uppercase font-heading">
                          Workspace Ready
                        </span>
                        <p className="text-xs text-slate-300 font-medium">
                          No redesigns generated yet
                        </p>
                      </div>

                      <Link
                        href={`/generate?projectId=${projId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.03] font-heading cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* CARD BODY */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3
                        onClick={() => router.push(`/projects/${projId}`)}
                        className="font-heading text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors cursor-pointer"
                      >
                        {proj.name}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteProject(projId, proj.name, e)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {proj.description ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {proj.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 italic">
                        Organized redesign workspace folder
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <Link
                      href={`/generate?projectId=${projId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors font-heading cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Room</span>
                    </Link>

                    <span
                      onClick={() => router.push(`/projects/${projId}`)}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors cursor-pointer font-heading"
                    >
                      Open Project <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
        title="Create New Room Project"
        subtitle="Group your AI room designs into a project workspace"
        icon={<FolderPlus className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dream Apartment Redesign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Theme / Style
            </label>
            <button
              type="button"
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate text-left">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="truncate">
                  {DESIGN_STYLES.find((s) => s.name === projectTheme)?.name || projectTheme} —{' '}
                  <span className="text-slate-500 dark:text-slate-400 font-normal">
                    {DESIGN_STYLES.find((s) => s.name === projectTheme)?.description || ''}
                  </span>
                </span>
              </div>
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
                            <p className="text-xs font-bold truncate">{style.name}</p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-purple-100 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                              {style.description}
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
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of project goals..."
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !projectName.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50 font-heading"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
