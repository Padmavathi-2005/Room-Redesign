'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  ExternalLink,
  RefreshCw,
  Tag,
  Folder,
  User as UserIcon,
  LayoutGrid,
  List,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { adminService, AdminImage } from '@/services/admin.service';

export default function AdminImagesPage() {
  const [images, setImages] = useState<AdminImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs shrink-0">
              <img src={img.originalImage} alt="Original" className="w-full h-full object-cover" />
            </div>
          </div>

          <span className="text-slate-300 font-extrabold text-xs">➔</span>

          {/* AI Result Thumbnail */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block font-heading">AI Result</span>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-purple-300 shadow-2xs shrink-0">
              <img
                src={img.generatedImage || img.originalImage}
                alt="AI Result"
                className="w-full h-full object-cover"
              />
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-extrabold font-heading">
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
      header: 'Given Prompt / Keywords',
      accessor: (img) => (
        <div className="max-w-xs space-y-1 text-[11px]">
          {img.customInstructions ? (
            <p className="text-slate-700 font-medium italic line-clamp-2">"{img.customInstructions}"</p>
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
      ),
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
        return (
          <div className="flex items-center gap-2">
            <a
              href={resultUrl}
              target="_blank"
              download="converted_room_hd.jpg"
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer font-heading"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HD Download</span>
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-extrabold rounded-full font-heading">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Platform AI Conversions Gallery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Converted Images Gallery</h1>
          <p className="text-xs text-slate-500">
            View all photorealistic 8K AI room transformations rendered across all user projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* VIEW TOGGLE */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer font-heading ${
                viewMode === 'table' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer font-heading ${
                viewMode === 'grid' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadImages}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer font-heading border border-slate-200 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* VIEW MODES */}
      {viewMode === 'table' ? (
        <DataTable
          title={`Total Converted Images (${images.length})`}
          subtitle="Search image transformations by room type, theme, or custom prompt keywords"
          columns={columns}
          data={images}
          searchPlaceholder="Search images by room type, theme, instructions..."
          searchKeys={['roomType', 'theme', 'customInstructions']}
          isLoading={isLoading}
          emptyMessage="No converted room images found"
          initialPageSize={10}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
              ))
            : images.map((img) => (
                <div
                  key={img._id || img.id}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all space-y-4 p-4"
                >
                  <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={img.generatedImage || img.originalImage}
                      alt={img.roomType || 'Converted Room'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold rounded-lg font-heading">
                      {img.roomType || 'Room'}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-extrabold rounded-lg font-heading shadow-xs">
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

                    {img.customInstructions && (
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        "{img.customInstructions}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={img.generatedImage || img.originalImage}
                      target="_blank"
                      download="converted_room.jpg"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs font-heading cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download HD</span>
                    </a>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
