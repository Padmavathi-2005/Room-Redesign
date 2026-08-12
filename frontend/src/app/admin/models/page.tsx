'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Upload,
  Sparkles,
  Search,
  Zap,
  Edit2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { adminService, AdminModel } from '@/services/admin.service';

export default function AdminModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingToolId, setUploadingToolId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<AdminModel | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getModels();
      setModels(data);
    } catch (err: any) {
      console.error('Failed to load AI models:', err);
      setError(err.message || 'Failed to fetch AI models database.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    modelId: string,
    imageType: 'originalImage' | 'convertedImage',
    file: File
  ) => {
    try {
      setUploadingToolId(`${modelId}-${imageType}`);
      const uploadRes = await adminService.uploadModelImage(file);
      if (uploadRes && uploadRes.url) {
        const fullUrl = uploadRes.url.startsWith('http')
          ? uploadRes.url
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${uploadRes.url}`;

        const updated = await adminService.updateModel(modelId, {
          [imageType]: fullUrl,
        });

        setModels((prev) =>
          prev.map((m) => (m._id === modelId || m.slug === modelId ? updated : m))
        );

        setSuccessMsg(`Uploaded ${imageType === 'originalImage' ? 'Original' : 'Converted'} Image for ${updated.name}! Saved to /uploads/images/ folder.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(`Image Upload Failed: ${err.message}`);
    } finally {
      setUploadingToolId(null);
    }
  };

  const handleSaveModelEdit = async () => {
    if (!editingModel) return;
    try {
      setIsSaving(true);
      const updated = await adminService.updateModel(editingModel._id || editingModel.slug, {
        name: editingModel.name,
        creditCost: editingModel.creditCost,
        badge: editingModel.badge,
        description: editingModel.description,
        originalImage: editingModel.originalImage,
        convertedImage: editingModel.convertedImage,
        category: editingModel.category,
      });

      setModels((prev) =>
        prev.map((m) => (m._id === updated._id || m.slug === updated.slug ? updated : m))
      );

      setEditingModel(null);
      setSuccessMsg(`Model "${updated.name}" updated successfully in DB!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Failed to save model: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredModels = models.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Wand2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 font-heading">
              AI Models & Tools Table Manager
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage all 20+ Dehome AI tools in table format. Upload Original and Converted images stored in <code>/uploads/images</code> folder.
          </p>
        </div>

        <button
          onClick={fetchModels}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: `All Models (${models.length})` },
            { id: 'interior', label: 'Interior' },
            { id: 'exterior', label: 'Exterior' },
            { id: 'floorplan', label: 'Floor Plan' },
            { id: 'editing', label: 'Editing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search models by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-slate-900"
          />
        </div>
      </div>

      {/* ADMIN TABLE DESIGN */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading AI Models Table from Database...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Model & Slug</th>
                  <th className="py-3.5 px-4">Category & Badge</th>
                  <th className="py-3.5 px-4">Credits</th>
                  <th className="py-3.5 px-4 text-center">Original Image (Before)</th>
                  <th className="py-3.5 px-4 text-center">Converted Image (After)</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                {filteredModels.map((model) => (
                  <tr key={model._id || model.slug} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Model Name & Slug */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 font-heading text-sm">
                        {model.name}
                      </div>
                      <code className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 mt-1 inline-block">
                        {model.slug}
                      </code>
                    </td>

                    {/* 2. Category & Badge */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="capitalize font-bold px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                          {model.category}
                        </span>
                        {model.badge && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-purple-100 text-purple-800 border border-purple-200">
                            {model.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Credits */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-900 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {model.creditCost}
                      </span>
                    </td>

                    {/* 4. Original Image Cell */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative shadow-xs group">
                          <img
                            src={
                              model.originalImage ||
                              'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop'
                            }
                            alt={`${model.name} Original`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                          <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 bg-slate-900/80 text-[7px] font-black text-white rounded">
                            Original
                          </span>
                        </div>

                        <label className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors">
                          {uploadingToolId === `${model._id || model.slug}-originalImage` ? (
                            <span className="animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <Upload className="w-2.5 h-2.5 text-purple-600" />
                              <span>Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(model._id || model.slug, 'originalImage', file);
                            }}
                          />
                        </label>
                      </div>
                    </td>

                    {/* 5. Converted Image Cell */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative shadow-xs group">
                          <img
                            src={
                              model.convertedImage ||
                              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'
                            }
                            alt={`${model.name} Converted`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-purple-600 text-[7px] font-black text-white rounded flex items-center gap-0.5">
                            <Sparkles className="w-1.5 h-1.5 text-amber-300 fill-amber-300" />
                            <span>AI Render</span>
                          </span>
                        </div>

                        <label className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs">
                          {uploadingToolId === `${model._id || model.slug}-convertedImage` ? (
                            <span className="animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <Upload className="w-2.5 h-2.5 text-white" />
                              <span>Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(model._id || model.slug, 'convertedImage', file);
                            }}
                          />
                        </label>
                      </div>
                    </td>

                    {/* 6. Description */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {model.description || 'No description configured.'}
                      </p>
                    </td>

                    {/* 7. Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setEditingModel(model)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-extrabold inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Model Details Modal */}
      {editingModel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Edit AI Model: {editingModel.name}
              </h3>
              <button
                onClick={() => setEditingModel(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Model Name</label>
                <input
                  type="text"
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Badge Label</label>
                  <input
                    type="text"
                    value={editingModel.badge || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, badge: e.target.value })}
                    placeholder="e.g. Model 01, Pro AI"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Credit Cost</label>
                  <input
                    type="number"
                    value={editingModel.creditCost}
                    onChange={(e) => setEditingModel({ ...editingModel, creditCost: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={editingModel.description || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 mt-1 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Original Image URL</label>
                <input
                  type="text"
                  value={editingModel.originalImage || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, originalImage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Converted Image URL</label>
                <input
                  type="text"
                  value={editingModel.convertedImage || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, convertedImage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingModel(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveModelEdit}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 shadow-md"
              >
                {isSaving ? 'Saving...' : 'Save Model Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
