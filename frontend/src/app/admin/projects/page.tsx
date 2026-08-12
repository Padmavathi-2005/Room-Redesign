'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { adminService, AdminProject, AdminImage } from '@/services/admin.service';

export default function AdminProjectsPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [allImages, setAllImages] = useState<AdminImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState<boolean>(false);

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

  const columns: Column<AdminProject>[] = [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      accessor: (proj) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
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
      header: 'Owner Account',
      sortable: true,
      accessor: (proj) => {
        if (typeof proj.userId === 'object' && proj.userId !== null) {
          const ownerName = [proj.userId.firstName, proj.userId.lastName].filter(Boolean).join(' ') || 'User';
          return (
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-slate-900 block font-heading">{ownerName}</span>
              <span className="text-[11px] text-slate-500 font-mono block">{proj.userId.email}</span>
            </div>
          );
        }
        return <span className="text-xs text-slate-400 font-mono">{String(proj.userId || 'N/A')}</span>;
      },
    },
    {
      key: 'theme',
      header: 'Locked Theme',
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
      header: 'Room Conversions',
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
      header: 'Created Date',
      sortable: true,
      accessor: (proj) => (
        <span className="text-xs text-slate-500 font-medium">
          {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (proj) => {
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenDetailModal(proj)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDeleteModal(proj)}
              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
              title="Delete Project"
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

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-full font-heading border border-indigo-100">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Platform Projects Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Projects Management</h1>
          <p className="text-xs text-slate-500">
            Monitor all multi-room projects created by users, view theme configurations, and manage platform assets inside the admin console.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProjects}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer font-heading border border-slate-200 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* REUSABLE DATA TABLE */}
      <DataTable
        title={`All Projects (${projects.length})`}
        subtitle="Search projects by name, theme, or owner email"
        columns={columns}
        data={projects}
        searchPlaceholder="Search projects by title, theme, owner..."
        searchKeys={['name', 'theme', 'description']}
        isLoading={isLoading}
        emptyMessage="No projects created yet"
        initialPageSize={10}
      />

      {/* PORTALED IN-ADMIN PROJECT DETAILS MODAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isDetailModalOpen && selectedProject && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/80 shrink-0 shadow-xs">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-extrabold text-slate-900 font-heading">{selectedProject.name}</h2>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold font-heading">
                            <Lock className="w-2.5 h-2.5 text-indigo-600" />
                            {selectedProject.theme} Style
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Project Details & Room Conversions (Admin Console View)</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDetailModalOpen(false)}
                      className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Owner Account</span>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-extrabold text-slate-900 truncate">
                          {typeof selectedProject.userId === 'object' && selectedProject.userId
                            ? [selectedProject.userId.firstName, selectedProject.userId.lastName].filter(Boolean).join(' ') || selectedProject.userId.email
                            : String(selectedProject.userId || 'N/A')}
                        </span>
                      </div>
                      {typeof selectedProject.userId === 'object' && selectedProject.userId?.email && (
                        <p className="text-[10px] text-slate-500 font-mono truncate">{selectedProject.userId.email}</p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Room Conversions</span>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-extrabold text-slate-900">
                          {selectedProject.roomCount || currentProjectImages.length || 0} Rooms Converted
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created Date</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-extrabold text-slate-900">
                          {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProject.description && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Project Description</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedProject.description}</p>
                    </div>
                  )}

                  {/* Associated Room Images & Transformations */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Converted Room Gallery ({currentProjectImages.length})</span>
                    </h3>

                    {currentProjectImages.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium">
                        No room conversions generated under this project yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentProjectImages.map((img) => (
                          <div
                            key={img._id || img.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Original</span>
                                <img
                                  src={img.originalImage}
                                  alt="Original"
                                  className="h-28 w-full object-cover rounded-xl border border-slate-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block font-heading">AI Result</span>
                                <img
                                  src={img.generatedImage || img.originalImage}
                                  alt="AI Result"
                                  className="h-28 w-full object-cover rounded-xl border border-indigo-200"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-900 font-heading">{img.roomType || 'Room Redesign'}</span>
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold text-[10px]">
                                {img.theme || selectedProject.theme}
                              </span>
                            </div>

                            {img.customInstructions && (
                              <p className="text-[11px] text-slate-600 italic line-clamp-2">"{img.customInstructions}"</p>
                            )}

                            <div className="pt-2 border-t border-slate-100 flex justify-end">
                              <a
                                href={img.generatedImage || img.originalImage}
                                target="_blank"
                                download="converted_room.jpg"
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download HD</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleOpenDeleteModal(selectedProject);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Project</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
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
                  className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">Delete Project</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Are you sure you want to delete project <strong className="text-slate-900">"{selectedProject.name}"</strong>?
                      All associated room conversions will be permanently removed.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isActionSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isActionSubmitting ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
