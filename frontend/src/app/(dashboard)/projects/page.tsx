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
} from 'lucide-react';
import { projectService, ProjectData, RoomData } from '@/services/project.service';
import { marketplaceService } from '@/services/marketplace.service';

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

  // Publish Modal State
  const [publishingTargetProject, setPublishingTargetProject] = useState<ProjectData | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishDesc, setPublishDesc] = useState<string>('');
  const [publishRoomType, setPublishRoomType] = useState<string>('Living Room');
  const [publishStyle, setPublishStyle] = useState<string>('Modern');
  const [publishPrice, setPublishPrice] = useState<number>(29);
  const [publishOrigPrice, setPublishOrigPrice] = useState<number>(49);
  const [publishSampleImage, setPublishSampleImage] = useState<string>('');
  const [publishBeforeImage, setPublishBeforeImage] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string>('');

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
      await projectService.createProject({
        name: projectName,
        theme: projectTheme,
        description: projectDescription,
      });

      setIsModalOpen(false);
      setProjectName('');
      setProjectDescription('');
      await loadData();
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

  const handleOpenPublishModal = (proj: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    setPublishingTargetProject(proj);
    setPublishTitle(proj.name);
    setPublishDesc(proj.description || `High resolution ${proj.theme} redesign project set.`);
    setPublishRoomType(proj.theme || 'Living Room');
    setPublishStyle(proj.theme || 'Modern');
    setPublishPrice(29);
    setPublishOrigPrice(49);

    const pRooms = allRooms.filter((r) => String(r.projectId) === String(proj._id || proj.id));
    const sampleImg =
      pRooms.find((r) => r.generatedImage || r.coverImage)?.generatedImage ||
      pRooms.find((r) => r.generatedImage || r.coverImage)?.coverImage ||
      proj.coverImage ||
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80';
    const beforeImg =
      pRooms.find((r) => r.originalImage)?.originalImage ||
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&q=80';

    setPublishSampleImage(sampleImg);
    setPublishBeforeImage(beforeImg);
    setPublishSuccessMsg('');
    setIsPublishModalOpen(true);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingTargetProject || !publishTitle.trim()) return;

    setIsPublishing(true);
    setPublishSuccessMsg('');

    try {
      const userStr = localStorage.getItem('user');
      let authorId = '64f1a2b3c4d5e6f7a8b9c0d1';
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          authorId = u._id || u.id || authorId;
        } catch {}
      }

      const origP = publishOrigPrice || Math.round(publishPrice * 1.5);
      const disc = Math.round(((origP - publishPrice) / origP) * 100);

      await marketplaceService.publishProject({
        authorId,
        sourceProjectId: publishingTargetProject._id || publishingTargetProject.id,
        title: publishTitle,
        description: publishDesc,
        price: publishPrice,
        originalPrice: origP,
        discount: disc,
        roomType: publishRoomType,
        style: publishStyle,
        sampleImageUrl: publishSampleImage,
        beforeImageUrl: publishBeforeImage,
        tags: [publishRoomType, publishStyle, 'AI Design'],
      });

      setPublishSuccessMsg('Project published successfully to Designs showcase!');

      setTimeout(() => {
        setIsPublishModalOpen(false);
        router.push('/designs');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to publish project:', err);
    } finally {
      setIsPublishing(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          My Projects ({projects.length})
        </h1>

        <div className="flex items-center gap-2.5">
          <Link
            href="/designs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Showcase</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
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
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-2xs"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <FolderPlus className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No projects found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first project to organize your room redesign spaces and AI image transformations!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-md"
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
              proj.coverImage ||
              pRooms[0]?.generatedImage ||
              pRooms[0]?.coverImage ||
              'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80';

            return (
              <div
                key={projId}
                onClick={() => router.push(`/projects/${projId}`)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={coverImg}
                    alt={proj.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-blue-400 border border-blue-500/30">
                    {proj.theme}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-slate-300 border border-slate-700">
                    {pRooms.length} Rooms
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {proj.name}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteProject(projId, proj.name, e)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {proj.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleOpenPublishModal(proj, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-600/20"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Publish to Designs
                    </button>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  Create New Room Project
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dream Apartment Redesign"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Theme / Style
                  </label>
                  <select
                    value={projectTheme}
                    onChange={(e) => setProjectTheme(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="Modern">Modern Minimalist</option>
                    <option value="Japandi">Japandi</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Bohemian">Bohemian</option>
                    <option value="Scandinavian">Scandinavian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief overview of project goals..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs font-bold text-rose-500">{errorMessage}</p>
                )}

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !projectName.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/30"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PUBLISH TO DESIGNS MODAL */}
      <AnimatePresence>
        {isPublishModalOpen && publishingTargetProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                    Publish Project to Designs Showcase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Make your redesign visible on the community /designs showcase with pricing, discount, and reviews.
                  </p>
                </div>
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublishSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Design Showcase Title
                  </label>
                  <input
                    type="text"
                    required
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={publishDesc}
                    onChange={(e) => setPublishDesc(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Room Category
                    </label>
                    <select
                      value={publishRoomType}
                      onChange={(e) => setPublishRoomType(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Office">Office</option>
                      <option value="Villa">Villa</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Design Style
                    </label>
                    <input
                      type="text"
                      value={publishStyle}
                      onChange={(e) => setPublishStyle(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                {/* Pricing & Discount Settings */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Selling Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={publishPrice}
                      onChange={(e) => setPublishPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Set 0 for FREE</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={publishOrigPrice}
                      onChange={(e) => setPublishOrigPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    {publishOrigPrice > publishPrice && (
                      <span className="text-[10px] font-bold text-rose-500 mt-1 block">
                        Auto Discount: {Math.round(((publishOrigPrice - publishPrice) / publishOrigPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Images Preview URLs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Redesign (After) Sample Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={publishSampleImage}
                    onChange={(e) => setPublishSampleImage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Original (Before) Photo URL
                  </label>
                  <input
                    type="url"
                    value={publishBeforeImage}
                    onChange={(e) => setPublishBeforeImage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {publishSuccessMsg && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {publishSuccessMsg}
                  </p>
                )}

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing || !publishTitle.trim() || !publishSampleImage}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/30"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish to Designs'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
