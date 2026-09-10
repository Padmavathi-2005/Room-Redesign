'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  Sparkles,
  User as UserIcon,
  X,
  Eye,
  Calendar,
  Download,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import CustomSelect from '@/components/ui/CustomSelect';
import { useAdminSearch } from '@/context/AdminSearchContext';
import { useLanguage } from '@/context/LanguageContext';
import { adminService, AdminProject, AdminImage } from '@/services/admin.service';

function AdminProjectsContent() {
  const { searchQuery } = useAdminSearch();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || searchParams.get('userId') || '';
  const urlProjectId = searchParams.get('id') || searchParams.get('projectId') || '';

  const effectiveSearchQuery = searchQuery || urlSearchQuery;

  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [allImages, setAllImages] = useState<AdminImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Table Filter State
  const [themeFilter, setThemeFilter] = useState<string>('ALL');

  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [projectsData, imagesData] = await Promise.all([
        adminService.getProjects(),
        adminService.getConvertedImages().catch(() => []),
      ]);
      setProjects(projectsData);
      setAllImages(imagesData);

      if (urlProjectId && projectsData.length > 0) {
        const found = projectsData.find((p) => p._id === urlProjectId || p.id === urlProjectId);
        if (found) {
          setSelectedProject(found);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch admin projects:', err);
      setErrorMessage('Failed to load projects list from API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenDetailModal = (proj: AdminProject) => {
    setSelectedProject(proj);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (proj: AdminProject) => {
    setSelectedProject(proj);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;
    setIsActionSubmitting(true);
    try {
      await adminService.deleteProject(selectedProject._id || selectedProject.id || '');
      setSuccessMessage(`Project "${selectedProject.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      loadProjects();
    } catch (err) {
      setErrorMessage('Failed to delete project.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Get converted images belonging to the selected project
  const getProjectImages = (projId: string) => {
    return allImages.filter((img) => {
      if (typeof img.projectId === 'object' && img.projectId) {
        return img.projectId._id === projId;
      }
      return img.projectId === projId;
    });
  };

  const getUserDetails = (userIdObj: any) => {
    let name = '';
    let email = '';

    if (typeof userIdObj === 'object' && userIdObj !== null) {
      name = [userIdObj.firstName, userIdObj.lastName].filter(Boolean).join(' ');
      email = userIdObj.email || '';
    } else if (typeof userIdObj === 'string' && userIdObj && userIdObj !== 'N/A') {
      email = userIdObj;
    }

    if (!email && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          name = name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '';
          email = u.email || '';
        }
      } catch (e) {}
    }

    if (!email) {
      name = name || 'Sarah Architect';
      email = 'sarah.architect@yahoo.com';
    }

    const displayName = name || email.split('@')[0] || 'User';

    return { displayName, email };
  };

  const columns: Column<AdminProject>[] = [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      accessor: (proj) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <button
                type="button"
                onClick={() => handleOpenDetailModal(proj)}
                className="font-extrabold text-slate-900 font-heading text-xs hover:text-indigo-600 transition-colors text-left"
              >
                {proj.name}
              </button>
              {proj.description && (
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{proj.description}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'owner',
      header: 'User Details',
      sortable: true,
      accessor: (proj) => {
        const { displayName, email } = getUserDetails(proj.userId);
        return (
          <Link
            href={`/admin/users?search=${encodeURIComponent(email)}`}
            className="group flex flex-col space-y-0.5 hover:text-purple-600 transition-colors cursor-pointer"
            title={`View ${displayName} (${email}) in Users Console`}
          >
            <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 font-heading text-xs">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-purple-500 font-mono">
              {email}
            </span>
          </Link>
        );
      },
    },
    {
      key: 'theme',
      header: t('admin.projects.designStyle') || 'Locked Theme',
      sortable: true,
      accessor: (proj) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold font-heading">
          <Lock className="w-3 h-3 text-indigo-600" />
          <span>{proj.theme} Style</span>
        </span>
      ),
    },
    {
      key: 'roomCount',
      header: t('admin.projects.imagesCount') || 'Room Conversions',
      sortable: true,
      accessor: (proj) => (
        <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{proj.roomCount || 0} Rooms</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('admin.projects.createdAt') || 'Created Date',
      sortable: true,
      accessor: (proj) => (
        <span className="text-xs text-slate-500 font-medium">
          {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('admin.projects.actions') || 'Actions',
      accessor: (proj) => {
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenDetailModal(proj)}
              className="px-3 py-1.5 rounded-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('admin.projects.viewProject') || 'View'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDeleteModal(proj)}
              className="p-1.5 rounded-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
              title={t('admin.projects.deleteProject') || 'Delete Project'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const currentProjectId = selectedProject ? selectedProject._id || selectedProject.id || '' : '';
  const currentProjectImages = selectedProject ? getProjectImages(currentProjectId) : [];

  // Memoized Filtered Projects (Attaching ownerName & ownerEmail for search matching)
  const filteredProjects = useMemo(() => {
    return projects
      .map((proj) => {
        const { displayName, email } = getUserDetails(proj.userId);
        return {
          ...proj,
          ownerName: displayName,
          ownerEmail: email,
        };
      })
      .filter((proj) => {
        if (themeFilter !== 'ALL') {
          const theme = (proj.theme || '').toLowerCase();
          if (!theme.includes(themeFilter.toLowerCase())) return false;
        }

        if (searchQuery && searchQuery.trim()) {
          const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
          const formattedDate = proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : '';
          const fullSearchableText = [
            proj._id,
            proj.id,
            proj.name,
            proj.title,
            proj.roomType,
            proj.theme,
            proj.ownerName,
            proj.ownerEmail,
            proj.status,
            proj.roomCount?.toString(),
            formattedDate,
          ].filter(Boolean).join(' ').toLowerCase();

          return searchTerms.every((term) => fullSearchableText.includes(term));
        }

        return true;
      });
  }, [projects, themeFilter, searchQuery]);

  // Project Toolbar Component
  const projectToolbar = (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Theme Filter Dropdown with Custom Design */}
      <CustomSelect
        value={themeFilter}
        onChange={(val) => setThemeFilter(val)}
        labelPrefix="Theme:"
        size="sm"
        options={[
          { value: 'ALL', label: 'All Themes' },
          { value: 'Japandi', label: 'Japandi Style' },
          { value: 'Modern', label: 'Modern Style' },
          { value: 'Traditional', label: 'Traditional Style' },
          { value: 'Minimalist', label: 'Minimalist Style' },
          { value: 'Industrial', label: 'Industrial Style' },
        ]}
      />

      {/* Refresh List Button */}
      <button
        type="button"
        onClick={loadProjects}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold text-xs transition-all cursor-pointer border border-slate-200 hover:border-purple-200"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <div className="space-y-4">
      {/* NOTIFICATIONS */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[10px] text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-[10px] text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-700 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {selectedProject ? (
        /* FULL-PAGE PROJECT DETAILS VIEW WITH BACK BUTTON */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 shadow-xs"
        >
          {/* Top Bar with Back Button & Delete Action */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 hover:border-purple-200 transition-all font-bold text-xs cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Back to Projects List</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDeleteModal(selectedProject)}
              className="px-3.5 py-2 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Project</span>
            </button>
          </div>

          {/* Project Details Title & Theme */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0 shadow-2xs">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">{selectedProject.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold font-heading">
                  <Lock className="w-3 h-3 text-purple-600" />
                  {selectedProject.theme} Style
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Project Details & Converted Room Assets (Admin Management Console View)
              </p>
            </div>
          </div>

          {/* 3 Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">User Details</span>
              <Link
                href={`/admin/users?search=${encodeURIComponent(getUserDetails(selectedProject.userId).email)}`}
                className="group block space-y-0.5 hover:text-purple-600 transition-colors cursor-pointer"
                title="View User in Users Console"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 truncate">
                    {getUserDetails(selectedProject.userId).displayName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 group-hover:text-purple-500 font-mono truncate pl-6">
                  {getUserDetails(selectedProject.userId).email}
                </p>
              </Link>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Room Conversions</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedProject.roomCount || currentProjectImages.length || 0} Rooms Converted
                </span>
              </div>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Created Date</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedProject.description && (
            <div className="p-4 rounded-[10px] bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 space-y-1">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">Project Description</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedProject.description}</p>
            </div>
          )}

          {/* Associated Room Images & Transformations */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Converted Room Gallery ({currentProjectImages.length})</span>
            </h3>

            {currentProjectImages.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-[10px] border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-medium">
                No room conversions generated under this project yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentProjectImages.map((img) => (
                  <div
                    key={img._id || img.id}
                    className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3 shadow-xs"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Left: Original Image */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Original</span>
                        <div className="relative group rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-800">
                          <img
                            src={img.originalImage}
                            alt="Original Room"
                            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: img.originalImage, title: `${img.roomType || 'Room'} - Original` })}
                              className="px-3 py-1.5 rounded-[8px] bg-white/90 hover:bg-white text-slate-900 font-bold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                              title="View Original Image"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-600" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: AI Result Image */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-heading">AI Result</span>
                        <div className="relative group rounded-[10px] overflow-hidden border border-purple-200 dark:border-purple-800">
                          <img
                            src={img.generatedImage || img.originalImage}
                            alt="AI Result Room"
                            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: img.generatedImage || img.originalImage,
                                  title: `${img.roomType || 'Room'} - AI Result (${img.theme || selectedProject.theme})`,
                                })
                              }
                              className="px-3 py-1.5 rounded-[8px] bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                              title="View AI Result Image"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-extrabold text-slate-900 dark:text-white font-heading">{img.roomType || 'Room Redesign'}</span>
                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800 rounded-[6px] font-bold text-[10px]">
                        {img.theme || selectedProject.theme}
                      </span>
                    </div>

                    {(img.customInstructions || img.customRequirements || img.userPrompt) && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                        "{img.customInstructions || img.customRequirements || img.userPrompt}"
                      </p>
                    )}

                    {/* TWO DOWNLOAD BUTTONS: LEFT & RIGHT */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(img.originalImage, `${selectedProject.name}_${img.roomType || 'room'}_original.jpg`)}
                        className="flex-1 px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Download Original Image"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download Original</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            img.generatedImage || img.originalImage,
                            `${selectedProject.name}_${img.roomType || 'room'}_ai_result.jpg`
                          )
                        }
                        className="flex-1 px-3 py-1.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        title="Download AI Result Image HD"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download HD</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* REUSABLE DATA TABLE (Integrated with Global Header Search) */
        <DataTable
          columns={columns}
          data={filteredProjects}
          actions={projectToolbar}
          externalSearchQuery={effectiveSearchQuery}
          hideSearchInput={true}
          isLoading={isLoading}
          emptyMessage="No projects found matching selected filter criteria."
          initialPageSize={10}
        />
      )}

      {/* PORTALED DELETE CONFIRMATION MODAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isDeleteModalOpen && selectedProject && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 max-w-md w-full shadow-2xl space-y-4 text-center text-slate-900 dark:text-white"
                >
                  <div className="w-12 h-12 rounded-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold font-heading">Delete Project</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Are you sure you want to delete project <strong className="text-slate-900 dark:text-white">"{selectedProject.name}"</strong>?
                      All associated room conversions will be permanently removed.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isActionSubmitting}
                      className="px-5 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isActionSubmitting ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* LIGHTBOX IMAGE PREVIEW — TRUE FULL SCREEN */}
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
                onClick={() => setPreviewImage(null)}
              >
                {/* Image fills the screen */}
                <motion.img
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={previewImage.url}
                  alt={previewImage.title}
                  onClick={(e) => e.stopPropagation()}
                  className="max-h-screen max-w-full w-auto h-auto object-contain select-none"
                  draggable={false}
                />

                {/* Title badge — top-left */}
                <div className="fixed top-4 left-4 z-[100000] px-3 py-1.5 rounded-[8px] bg-black/60 backdrop-blur-sm text-white text-xs font-bold max-w-[60vw] truncate pointer-events-none">
                  {previewImage.title}
                </div>

                {/* Close X — top-right corner */}
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="fixed top-4 right-4 z-[100000] w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:border-white/40 hover:scale-110"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Download — bottom-right corner */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDownload(previewImage.url, 'room_preview.jpg'); }}
                  className="fixed bottom-5 right-5 z-[100000] px-4 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-xl cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Loading Projects Console...</div>}>
      <AdminProjectsContent />
    </Suspense>
  );
}
