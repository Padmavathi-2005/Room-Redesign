'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Download,
  Eye,
  X,
  Tag,
  Folder,
  User as UserIcon,
  LayoutGrid,
  List,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { adminService, AdminImage } from '@/services/admin.service';
import { useAdminSearch } from '@/context/AdminSearchContext';

function AdminImagesContent() {
  const { searchQuery } = useAdminSearch();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || searchParams.get('user') || '';
  const effectiveSearchQuery = searchQuery || urlSearchQuery;

  const [images, setImages] = useState<AdminImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedViewImage, setSelectedViewImage] = useState<string | null>(null);

  const loadImages = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await adminService.getConvertedImages();
      setImages(data);
    } catch (err: any) {
      console.error('Failed to fetch converted images:', err);
      setErrorMessage('Failed to load converted images gallery from API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Listen for Escape key to close image lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedViewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Programmatic blob image download helper (bypasses cross-origin restrictions)
  const handleDownload = async (imageUrl: string, filename: string) => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('Direct blob fetch failed, fallback to download link:', error);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filtered images for grid/table view based on top search bar or URL parameter
  const filteredImages = useMemo(() => {
    if (!effectiveSearchQuery.trim()) return images;
    const searchTerms = effectiveSearchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return images.filter((img) => {
      const ownerEmail = typeof img.userId === 'object' && img.userId ? img.userId.email || '' : '';
      const ownerName = typeof img.userId === 'object' && img.userId ? [img.userId.firstName, img.userId.lastName].filter(Boolean).join(' ') : '';
      const projectName = typeof img.projectId === 'object' && img.projectId ? img.projectId.name || (img.projectId as any).title || '' : '';
      const formattedDate = img.createdAt ? new Date(img.createdAt).toLocaleDateString() : '';

      const fullSearchableText = [
        img._id,
        img.id,
        img.roomType,
        img.theme,
        (img as any).designStyle,
        (img as any).colorPalette,
        img.customInstructions,
        ownerEmail,
        ownerName,
        projectName,
        formattedDate,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchTerms.every((term) => fullSearchableText.includes(term));
    });
  }, [images, effectiveSearchQuery]);

  // Columns for Table View
  const columns: Column<AdminImage>[] = [
    {
      key: 'preview',
      header: 'Given vs AI Result Image',
      accessor: (img) => (
        <div className="flex items-center gap-2">
          {/* Original Thumbnail */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Original</span>
            <div
              onClick={() => setSelectedViewImage(img.originalImage)}
              className="relative w-14 h-14 rounded-[10px] overflow-hidden bg-slate-900 border border-slate-200 shadow-xs shrink-0 group cursor-pointer"
              title="Click to view full image"
            >
              <img src={img.originalImage} alt="Original" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Eye className="w-4 h-4" />
              </div>
            </div>
          </div>

          <span className="text-slate-300 font-extrabold text-xs">➔</span>

          {/* AI Result Thumbnail */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block font-heading">AI Result</span>
            <div
              onClick={() => setSelectedViewImage(img.generatedImage || img.originalImage)}
              className="relative w-14 h-14 rounded-[10px] overflow-hidden bg-slate-900 border border-purple-300 shadow-xs shrink-0 group cursor-pointer"
              title="Click to view full image"
            >
              <img
                src={img.generatedImage || img.originalImage}
                alt="AI Result"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Eye className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'roomType',
      header: 'Room & Theme',
      sortable: true,
      accessor: (img) => (
        <div className="space-y-1">
          <span className="font-extrabold text-slate-900 font-heading block text-xs">
            {img.roomType || 'Room Redesign'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold font-heading">
            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
            {img.theme || 'Modern'}
          </span>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project & Owner',
      sortable: true,
      accessor: (img) => {
        const ownerEmail = typeof img.userId === 'object' && img.userId ? img.userId.email : 'Unknown User';
        const projectName = typeof img.projectId === 'object' && img.projectId ? img.projectId.name : 'Unassigned';

        return (
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-slate-900 flex items-center gap-1 font-heading">
              <Folder className="w-3 h-3 text-purple-600" />
              {projectName}
            </span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-slate-400" />
              {ownerEmail}
            </span>
          </div>
        );
      },
    },
    {
      key: 'customInstructions',
      header: 'Custom Prompt / Instructions',
      accessor: (img) => {
        const customPromptText = img.customInstructions || img.customRequirements || img.userPrompt || '';
        return (
          <div className="max-w-xs space-y-1 text-[11px]">
            {customPromptText ? (
              <p className="text-slate-700 font-medium italic line-clamp-2">"{customPromptText}"</p>
            ) : (
              <p className="text-slate-400 italic">No custom requirements specified</p>
            )}

            {img.materials && img.materials.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-purple-700 font-bold flex-wrap">
                <Tag className="w-2.5 h-2.5" />
                <span>{img.materials.join(', ')}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Generated Date',
      sortable: true,
      accessor: (img) => (
        <span className="text-xs text-slate-500 font-medium">
          {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (img) => {
        const resultUrl = img.generatedImage || img.originalImage;
        const originalUrl = img.originalImage;
        return (
          <div className="flex items-center gap-2">
            {originalUrl && (
              <button
                type="button"
                onClick={() => handleDownload(originalUrl, `original_room_${img._id || img.id || 'image'}.jpg`)}
                className="p-2 rounded-[10px] bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-all cursor-pointer shadow-2xs"
                title="Download Original Image"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDownload(resultUrl, `ai_result_room_${img._id || img.id || 'image'}.jpg`)}
              className="p-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer shadow-2xs"
              title="Download AI Result Image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const ViewModeToggle = (
    <div className="flex items-center bg-slate-100 p-1 rounded-[10px] border border-slate-200">
      <button
        type="button"
        onClick={() => setViewMode('table')}
        className={`px-3 py-1 text-xs font-bold rounded-[8px] flex items-center gap-1.5 transition-all cursor-pointer ${
          viewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <List className="w-3.5 h-3.5" />
        <span>Table</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode('grid')}
        className={`px-3 py-1 text-xs font-bold rounded-[8px] flex items-center gap-1.5 transition-all cursor-pointer ${
          viewMode === 'grid' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Grid</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-[10px] text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* VIEW MODES */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={images}
          externalSearchQuery={effectiveSearchQuery}
          hideSearchInput={true}
          isLoading={isLoading}
          emptyMessage="No converted room images found"
          initialPageSize={10}
          actions={ViewModeToggle}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            {ViewModeToggle}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-64 bg-slate-100 rounded-[10px] animate-pulse" />
                ))
              : filteredImages.map((img) => (
                  <div
                    key={img._id || img.id}
                    className="bg-white border border-slate-200 rounded-[10px] overflow-hidden shadow-xs hover:shadow-md transition-all space-y-4 p-4"
                  >
                    <div
                      onClick={() => setSelectedViewImage(img.generatedImage || img.originalImage)}
                      className="relative h-48 bg-slate-900 rounded-[10px] overflow-hidden border border-slate-200 group cursor-pointer"
                    >
                      <img
                        src={img.generatedImage || img.originalImage}
                        alt={img.roomType || 'Converted Room'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-6 h-6" />
                      </div>
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-[8px]">
                        {img.roomType || 'Room'}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-[8px] shadow-xs">
                        {img.theme || 'Modern'}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 font-heading">
                          {img.roomType || 'Room Redesign'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      {(img.customInstructions || img.customRequirements || img.userPrompt) && (
                        <p className="text-[11px] text-slate-600 italic line-clamp-2">
                          "{img.customInstructions || img.customRequirements || img.userPrompt}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">Actions:</span>
                      <div className="flex items-center gap-2">
                        {img.originalImage && (
                          <button
                            type="button"
                            onClick={() => handleDownload(img.originalImage, `original_room_${img._id || img.id || 'image'}.jpg`)}
                            className="p-2 rounded-[10px] bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-all cursor-pointer"
                            title="Download Original Image"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownload(img.generatedImage || img.originalImage, `ai_result_room_${img._id || img.id || 'image'}.jpg`)}
                          className="p-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer shadow-2xs"
                          title="Download AI Result Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX OVERLAY (NO CONTAINER POPUP, NO RADIUS) */}
      {selectedViewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedViewImage(null)}
        >
          {/* Top Right Close X Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedViewImage(null);
            }}
            className="fixed top-5 right-5 text-white/80 hover:text-white p-2.5 rounded-none cursor-pointer z-50 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Raw Image - No Corner Radius, No Dialog Card Popup */}
          <img
            src={selectedViewImage}
            alt="Enlarged View"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[92vh] object-contain rounded-none shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default function AdminImagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Loading Converted Images Gallery...</div>}>
      <AdminImagesContent />
    </Suspense>
  );
}
