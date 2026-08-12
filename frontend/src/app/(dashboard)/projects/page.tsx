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
  Lock,
  MessageSquare,
  Plus,
  Trash2,
  ArrowRight,
  Layers,
  CheckCircle2,
  X,
  Download,
  Image as ImageIcon,
  Sliders,
  Check,
  Search,
  ChevronRight,
  FileText,
  Tag,
  Wand2,
} from 'lucide-react';
import { projectService, ProjectData, RoomData } from '@/services/project.service';
import { DESIGN_STYLES, COLOR_PALETTES, LIGHTING_OPTIONS } from '@/constants';

export default function ProjectsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [colorPalette, setColorPalette] = useState<string>('');
  const [lighting, setLighting] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isModalOpen) {
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

      if (projsData.length > 0 && !selectedProjectId) {
        const firstId = projsData[0]._id || projsData[0].id || null;
        setSelectedProjectId(firstId);
      }
    } catch (err) {
      console.error('Failed to load projects data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMessage('Please enter a project name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const newProj = await projectService.createProject({
        name: projectName,
        theme: projectTheme,
        description: projectDescription,
        colorPalette,
        lighting,
      });

      setIsModalOpen(false);
      setProjectName('');
      setProjectDescription('');

      await loadData();

      const newId = newProj._id || newProj.id;
      if (newId) {
        setSelectedProjectId(newId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      await projectService.deleteProject(id);
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
      await loadData();
    }
  };

  // Active selected project
  const activeProject = projects.find(
    (p) => (p._id || p.id) === selectedProjectId
  ) || projects[0] || null;

  // Filter rooms belonging to active project
  const projectRooms: RoomData[] = activeProject
    ? allRooms.filter(
        (r) =>
          String(r.projectId) === String(activeProject._id || activeProject.id) ||
          (activeProject.rooms && activeProject.rooms.some((pr: any) => String(pr._id || pr) === String(r._id)))
      )
    : [];

  const displayRooms = projectRooms.length > 0 ? projectRooms : (activeProject?.rooms || []);
  const latestRoom: RoomData | null = displayRooms.length > 0 ? displayRooms[0] : null;

  // Filter projects by search query
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen mesh-bg blueprint-grid pt-20 pb-16 text-slate-900 selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* TOP HEADER BAR WITH CREATE PROJECT BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 shadow-sm"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100/80 text-purple-700 text-xs font-extrabold rounded-full">
              <Folder className="w-3.5 h-3.5 fill-purple-700 text-purple-700" />
              <span>Multi-Room Project Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Projects Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Organize room transformations by project. Every room in a project inherits the same theme style and shares a continuous <strong>Manus AI chat session</strong> context.
            </p>
          </div>

          {/* TOP BUTTON: CREATE PROJECT */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer font-heading shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white font-extrabold">Create New Project</span>
          </motion.button>
        </motion.div>

        {/* TWO-COLUMN WORKSPACE: LEFT SMALL SIDE BOX & CENTER MAIN DISPLAY AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SMALL SIDE BOX: LIST ALL PROJECTS */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-4 bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>All Projects ({projects.length})</span>
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1 font-heading cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Project Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-semibold"
              />
            </div>

            {/* Project Small Side Cards List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <Folder className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold">No projects found</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-purple-600 underline font-semibold"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-modal-scroll">
                {filteredProjects.map((proj) => {
                  const projId = proj._id || proj.id || '';
                  const isSelected = selectedProjectId === projId;
                  const roomCount = allRooms.filter((r) => String(r.projectId) === String(projId)).length || (proj.rooms ? proj.rooms.length : 0);

                  return (
                    <motion.div
                      key={projId}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setSelectedProjectId(projId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'bg-purple-50/90 border-purple-400 shadow-2xs font-bold'
                          : 'bg-white/90 border-slate-200/80 hover:border-purple-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xs font-extrabold truncate font-heading ${
                            isSelected ? 'text-purple-900' : 'text-slate-900 group-hover:text-purple-600'
                          }`}>
                            {proj.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          <span className="inline-flex items-center gap-1 font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200 font-heading">
                            <Lock className="w-2.5 h-2.5" />
                            {proj.theme} Style
                          </span>

                          <span className="font-semibold text-slate-500">
                            {roomCount} {roomCount === 1 ? 'Converted Image' : 'Converted Images'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(projId, proj.name, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-purple-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* CENTER DISPLAY AREA: ACTIVE / LATEST PROJECT SHOWCASE */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeProject ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* ACTIVE PROJECT HEADER & ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold font-heading">
                        <Lock className="w-3 h-3" />
                        <span>{activeProject.theme} Theme</span>
                      </span>

                      {activeProject.manusChatId ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300 font-heading">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>Manus Session Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-300 font-heading">
                          <span>Pending First Conversion</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                        {activeProject.name}
                      </h2>
                      <Link
                        href={`/projects/${activeProject._id || activeProject.id}`}
                        className="text-xs font-extrabold text-purple-600 hover:underline flex items-center gap-1 font-heading"
                      >
                        <span>Full Detail View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {activeProject.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {activeProject.description}
                      </p>
                    )}
                  </div>

                  {/* CONVERTED IMAGES COUNTER BADGE & ADD ROOM BUTTON */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs font-heading">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Total Converted Images: <strong>{displayRooms.length}</strong></span>
                    </div>

                    <Link
                      href={`/generate?projectId=${activeProject._id || activeProject.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all font-heading cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Add Room to Project</span>
                    </Link>
                  </div>
                </div>

                {/* LATEST CONVERTED IMAGE SHOWCASE OR EMPTY STATE */}
                {latestRoom ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span>Latest Image Conversion Preview</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Original Given Image vs Converted AI Result Image with Prompt Keywords
                        </p>
                      </div>

                      {latestRoom.generatedImage && (
                        <a
                          href={latestRoom.generatedImage}
                          target="_blank"
                          download="converted_redesign.jpg"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs font-heading"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Result HD</span>
                        </a>
                      )}
                    </div>

                    {/* SIDE-BY-SIDE IMAGE COMPARISON (ORIGINAL VS CONVERTED) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ORIGINAL GIVEN IMAGE */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 font-heading">
                            📷 Given Original Image
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                            Source Input
                          </span>
                        </div>
                        <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                          <img
                            src={latestRoom.originalImage}
                            alt="Original Image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* CONVERTED RESULT IMAGE */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-700 font-heading flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Converted Result Image</span>
                          </span>
                          <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-md font-extrabold font-heading">
                            {latestRoom.theme || activeProject.theme} AI Result
                          </span>
                        </div>
                        <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900 border border-purple-300 shadow-md">
                          <img
                            src={latestRoom.generatedImage || latestRoom.originalImage}
                            alt="Converted Result"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PROMPT KEYWORDS & CUSTOM REQUIREMENTS MSG BOX */}
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5 font-heading">
                          <Tag className="w-3.5 h-3.5 text-purple-600" />
                          <span>Given Parameters & Prompt Keywords</span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-purple-700 border border-purple-200 font-heading">
                          {latestRoom.toolSlug || 'Interior Design'}
                        </span>
                      </div>

                      {/* KEYWORDS TAGS GRID */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {latestRoom.roomType && (
                          <div className="px-3 py-1 bg-white rounded-xl border border-purple-200 text-slate-800 font-semibold">
                            Category: <span>{latestRoom.roomType}</span>
                          </div>
                        )}

                        {latestRoom.materials && Array.isArray(latestRoom.materials) && latestRoom.materials.length > 0 && (
                          <div className="px-3 py-1 bg-white rounded-xl border border-purple-200 text-slate-800 font-semibold">
                            Materials: <span>{latestRoom.materials.join(', ')}</span>
                          </div>
                        )}

                        {latestRoom.lighting && (
                          <div className="px-3 py-1 bg-white rounded-xl border border-purple-200 text-slate-800 font-semibold">
                            Lighting: <span>{latestRoom.lighting}</span>
                          </div>
                        )}
                      </div>

                      {/* CUSTOM MESSAGE / INSTRUCTIONS BOX */}
                      {latestRoom.customInstructions && (
                        <div className="p-3 bg-white rounded-xl border border-purple-200/90 text-xs space-y-1">
                          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block font-heading">
                            💬 Custom Requirements / Message Given:
                          </span>
                          <p className="text-slate-800 font-semibold leading-relaxed italic">
                            "{latestRoom.customInstructions}"
                          </p>
                        </div>
                      )}

                      {/* COMPILED VISION PROMPT OUTPUT */}
                      {latestRoom.prompt && (
                        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                          <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block font-heading">
                            📝 Compiled AI Prompt:
                          </span>
                          <p className="text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-3">
                            {latestRoom.prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center space-y-4 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/40">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-heading">No Images Converted Yet in this Project</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Click "Add Room to Project" to upload your room image and convert it in <strong>{activeProject.theme}</strong> theme!
                      </p>
                    </div>
                    <Link
                      href={`/generate?projectId=${activeProject._id || activeProject.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all font-heading"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Convert First Room Image</span>
                    </Link>
                  </div>
                )}

                {/* ALL CONVERTED ROOMS GALLERY IN THIS PROJECT */}
                {displayRooms.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center justify-between">
                      <span>All Converted Images in Project ({displayRooms.length})</span>
                      <span className="text-xs text-slate-500 font-normal">Showing all room conversions</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {displayRooms.map((room: RoomData, index: number) => {
                        const imgUrl = room.generatedImage || room.originalImage;
                        return (
                          <div
                            key={room._id || index}
                            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 p-3"
                          >
                            <div className="space-y-2">
                              <div className="relative h-40 bg-slate-900 rounded-xl overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={room.roomType || 'Room Redesign'}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold rounded-md font-heading">
                                  {room.roomType || 'Room'}
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-extrabold rounded-md font-heading">
                                  {room.theme || activeProject.theme}
                                </div>
                              </div>

                              <div className="space-y-1 text-xs">
                                <h4 className="font-extrabold text-slate-900 font-heading">
                                  {room.roomType || `Room #${index + 1}`}
                                </h4>
                                {room.customInstructions && (
                                  <p className="text-[11px] text-slate-600 italic line-clamp-1">
                                    "{room.customInstructions}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-heading">
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Recent'}
                              </span>

                              {room.generatedImage && (
                                <a
                                  href={room.generatedImage}
                                  target="_blank"
                                  download="converted_room.jpg"
                                  className="text-purple-600 hover:underline font-extrabold text-[11px] flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <Folder className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900 font-heading">Select or Create a Project</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Choose a project from the left side box or click "Create New Project" to start adding room transformations.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div data-modal-open="true" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-6 relative text-left custom-modal-scroll"
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-extrabold rounded-full font-heading">
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>New Workspace</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close Modal"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                    Create Multi-Room Project
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    All rooms generated inside this project will be locked to the selected theme and share the same Manus AI chat context.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold font-heading">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4 text-left">
                {/* PROJECT NAME */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Modern Penthouse Redesign"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                {/* THEME SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading flex items-center justify-between">
                    <span>Primary Design Theme (Locked for Project)</span>
                    <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5">
                      <Lock className="w-3 h-3" /> Same Theme Generation
                    </span>
                  </label>
                  <select
                    value={projectTheme}
                    onChange={(e) => setProjectTheme(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
                  >
                    {DESIGN_STYLES.map((style) => (
                      <option key={style.id} value={style.name}>
                        {style.name} Style
                      </option>
                    ))}
                  </select>
                </div>

                {/* COLOR PALETTE & LIGHTING */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Color Palette (Optional)
                    </label>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 cursor-pointer font-semibold"
                    >
                      <option value="">Default Theme Palette</option>
                      {COLOR_PALETTES.map((pal) => (
                        <option key={pal.slug} value={pal.slug}>
                          {pal.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Lighting Atmosphere
                    </label>
                    <select
                      value={lighting}
                      onChange={(e) => setLighting(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 cursor-pointer font-semibold"
                    >
                      <option value="">Default Theme Lighting</option>
                      {LIGHTING_OPTIONS.map((light) => (
                        <option key={light} value={light}>
                          {light}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="e.g. Master bedroom, living room and dining hall redesign in Japandi style..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2 flex items-center justify-end gap-3 font-heading">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50 font-heading flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Creating Project...' : 'Create Project'}
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
