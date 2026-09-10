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
  ClipboardList,
  ChevronLeft,
  PlusCircle,
  Trash,
  Save,
  Layout,
  Power,
  ExternalLink
} from 'lucide-react';
import { adminService, AdminModel } from '@/services/admin.service';
import { useAdminSearch } from '@/context/AdminSearchContext';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = 'http://localhost:3002';

const WIDGET_TEMPLATES = [
  { type: 'Select Dropdown', defaultLabel: 'New Dropdown' },
  { type: 'Option Grid', defaultLabel: 'New Options' },
  { type: 'Check Grid', defaultLabel: 'New Checkbox Grid' },
  { type: 'Range Slider', defaultLabel: 'New Slider' },
  { type: 'Color Swatch', defaultLabel: 'New Color Palette' },
  { type: 'Text Block', defaultLabel: 'New Text Area' },
  { type: 'Asset Picker', defaultLabel: 'New Image Uploader' }
];

interface Widget {
  id: string;
  type: string;
  label: string;
  options?: string[];
  dataSource?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  maxLength?: number;
  placeholder?: string;
  width?: 'half' | 'full' | string;
  planRequirement?: 'free' | 'starter' | 'standard' | 'professional' | string;
}

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const fetchDataSourceOptions = async (source: string): Promise<string[]> => {
  const url = `${getApiBaseUrl()}/${source}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const payload = await res.json();
      const items = payload.data || payload;
      if (Array.isArray(items)) {
        return items.map((item: any) => item.name || item.title || item.slug || String(item));
      }
    }
  } catch (e) {
    console.error(`Failed to fetch database source ${source}:`, e);
  }
  return [];
};

export default function AdminModelsPage() {
  const router = useRouter();
  const { searchQuery } = useAdminSearch();
  const { t } = useLanguage();
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingToolId, setUploadingToolId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<AdminModel | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const filteredModels = models.filter((m) => {
    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory) {
      if (selectedCategory === 'floorplan') {
        matchesCategory = m.category === 'floorplan' || m.category === 'floor-plans' || m.category === 'architectural';
      } else if (selectedCategory === 'editing') {
        matchesCategory = m.category === 'editing' || m.category === 'garden' || m.category === 'gardens';
      } else if (selectedCategory === 'interior') {
        matchesCategory = m.category === 'interior' || m.category === 'interiors' || m.category === 'commercial' || m.category === 'real-estate' || m.category === 'specialty' || m.category === 'video';
      } else if (selectedCategory === 'exterior') {
        matchesCategory = m.category === 'exterior' || m.category === 'exteriors';
      } else {
        matchesCategory = m.category === selectedCategory;
      }
    }

    if (!matchesCategory) return false;

    if (searchQuery && searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const fullSearchableText = [
        m.name,
        m.slug,
        m.description,
        m.category,
        m.badge,
        m.creditCost?.toString(),
      ].filter(Boolean).join(' ').toLowerCase();

      return searchTerms.every((term) => fullSearchableText.includes(term));
    }

    return true;
  });
  
  // Database option cache
  const [dbOptions, setDbOptions] = useState<Record<string, string[]>>({});

  // Form customization states
  const [customizingWidgetsModel, setCustomizingWidgetsModel] = useState<AdminModel | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [widgetToolName, setWidgetToolName] = useState('');
  const [widgetToolDesc, setWidgetToolDesc] = useState('');
  const [widgetToolCategory, setWidgetToolCategory] = useState('interiors');
  const [mockSubscriberTier, setMockSubscriberTier] = useState<string>('free');
  const [upgradePopup, setUpgradePopup] = useState<{
    isOpen: boolean;
    fieldName: string;
    requiredPlan: string;
  } | null>(null);

  // Auto-close upgrade popup
  useEffect(() => {
    if (upgradePopup?.isOpen) {
      const timer = setTimeout(() => {
        setUpgradePopup(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [upgradePopup]);

  const getPlanRank = (plan: string): number => {
    const p = plan.toLowerCase();
    if (p === 'starter') return 2;
    if (p === 'standard') return 3;
    if (p === 'professional') return 4;
    return 1; // free / everything else
  };

  const isWidgetLockedInMock = (w: Widget): boolean => {
    const req = w.planRequirement || 'free';
    if (req === 'free') return false;
    return getPlanRank(mockSubscriberTier) < getPlanRank(req);
  };

  const startCustomizing = (model: AdminModel) => {
    setCustomizingWidgetsModel(model);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('customizing', model.slug);
      window.history.pushState({}, '', url.toString());
    }
  };

  const stopCustomizing = () => {
    setCustomizingWidgetsModel(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('customizing');
      window.history.pushState({}, '', url.toString());
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncStateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const customizingSlug = params.get('customizing');
      if (customizingSlug && models.length > 0) {
        const matchingModel = models.find(m => m.slug === customizingSlug || m._id === customizingSlug);
        if (matchingModel) {
          setCustomizingWidgetsModel(matchingModel);
          return;
        }
      }
      setCustomizingWidgetsModel(null);
    };

    syncStateFromUrl();

    window.addEventListener('popstate', syncStateFromUrl);
    return () => window.removeEventListener('popstate', syncStateFromUrl);
  }, [models]);

  useEffect(() => {
    if (customizingWidgetsModel) {
      const sanitizedWidgets = (customizingWidgetsModel.widgets || []).map((w: any) => {
        if ((w.id === 'room-type' || (w.label && w.label.toLowerCase().includes('room type'))) && (!w.dataSource || w.dataSource === '')) {
          return {
            ...w,
            dataSource: 'room-types',
            options: ['Living Room', 'Open Kitchen Living Room', 'Bedroom', 'Guest Bedroom', 'Kids Room', 'Nursery', 'Bathroom', 'Dining Room', 'Kitchen', 'Home Office', 'Outdoor Patio']
          };
        }
        if ((w.id === 'design-style' || (w.label && w.label.toLowerCase().includes('design style'))) && (!w.dataSource || w.dataSource === '')) {
          return {
            ...w,
            dataSource: 'design-styles',
            options: ['Modern', 'Scandinavian', 'Bohemian', 'Japandi', 'Minimalist', 'Industrial', 'Luxury', 'Traditional']
          };
        }
        return w;
      });
      setWidgets(sanitizedWidgets);
      setWidgetToolName(customizingWidgetsModel.name);
      setWidgetToolDesc(customizingWidgetsModel.description || '');
      setWidgetToolCategory(customizingWidgetsModel.category);
    }
  }, [customizingWidgetsModel]);

  // Load database options dynamically
  useEffect(() => {
    const loadDbOptions = async () => {
      const newDbOpts = { ...dbOptions };
      let changed = false;
      for (const w of widgets) {
        if (w.dataSource && !newDbOpts[w.dataSource]) {
          const opts = await fetchDataSourceOptions(w.dataSource);
          newDbOpts[w.dataSource] = opts;
          changed = true;
        }
      }
      if (changed) {
        setDbOptions(newDbOpts);
      }
    };
    loadDbOptions();
  }, [widgets]);

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
          : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5001'}${uploadRes.url}`;

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

  // Save customized widgets back to backend database schema
  const handleSaveWidgets = async () => {
    if (!customizingWidgetsModel) return;
    try {
      const updated = await adminService.updateModel(
        customizingWidgetsModel._id || customizingWidgetsModel.slug,
        { widgets: widgets }
      );

      setModels((prev) =>
        prev.map((m) => (m._id === updated._id || m.slug === updated.slug ? updated : m))
      );

      setSuccessMsg(`Form fields schema for "${widgetToolName}" updated successfully in MongoDB!`);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err: any) {
      alert(`Failed to save widgets schema: ${err.message}`);
    }
  };

  // Widget management functions
  const addWidget = (type: string, defaultLabel: string) => {
    const newWidget: Widget = {
      id: `widget_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      type,
      label: defaultLabel,
      required: false,
      planRequirement: 'free'
    };

    if (['Select Dropdown', 'Option Grid', 'Check Grid', 'Color Swatch'].includes(type)) {
      newWidget.options = ['Option A', 'Option B', 'Option C'];
    }

    if (type === 'Range Slider') {
      newWidget.min = 0;
      newWidget.max = 1.0;
      newWidget.step = 0.05;
      newWidget.defaultValue = 0.8;
    }

    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const updateWidgetField = (widgetId: string, field: keyof Widget, val: any) => {
    setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, [field]: val } : w));
  };



  return (
    <div className="space-y-6">
      
      {/* ==============================================
          1. WIDGET FORM CUSTOMIZER VIEW
          ============================================== */}
      {customizingWidgetsModel ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Back Navigation bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={stopCustomizing}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-700 bg-white border border-slate-200 hover:border-purple-100 px-4 py-2 rounded-[10px] transition-all duration-200 cursor-pointer shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Back to AI Models
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Customizing inputs for:</span>
              <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-[10px]">
                {customizingWidgetsModel.name}
              </span>
              <a
                href={`/generate?tool=${customizingWidgetsModel?.slug || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Page</span>
              </a>
            </div>
          </div>

          {/* Tools Core Config Header */}
          <div className="bg-white border border-slate-200 rounded-[10px] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-600" /> Configure Dynamic Input Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">Specify parameters, configure credit weights, and append fields dynamically.</p>
            </div>
            
            <button
              onClick={handleSaveWidgets}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-[10px] transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>
          </div>

          {/* Success Notification Banner */}
          {successMsg && (
            <div className="p-4 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Widget Configurations Drawer (Col-span 8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[10px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>🎛️ {t('admin.models.activeInputs') || 'Active Form Inputs'} ({widgets.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">{t('admin.models.parametersList') || 'Parameters List'}</span>
              </h3>

              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                {widgets.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[10px] text-slate-400 text-xs italic bg-slate-50/30">
                    Form inputs are empty. Click a component from the Widget Shelf on the right to start building.
                  </div>
                ) : (
                  widgets.map((widget, index) => (
                    <div key={widget.id} className="border border-slate-200 bg-slate-50/50 rounded-[10px] p-4 flex flex-col gap-3 relative">
                      
                      {/* Widget Header & Required Toggle */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">
                          #{index + 1} {widget.type}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!widget.required}
                              onChange={e => updateWidgetField(widget.id, 'required', e.target.checked)}
                              className="rounded border-slate-300 accent-purple-600 cursor-pointer"
                            />
                            <span className="text-[9px] text-slate-500 tracking-wider uppercase font-bold">Required</span>
                          </label>
                          <button 
                            onClick={() => removeWidget(widget.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-all duration-200 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Widget input detail fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Field Label</label>
                          <input 
                            type="text"
                            value={widget.label}
                            onChange={e => updateWidgetField(widget.id, 'label', e.target.value)}
                            className="bg-white border border-slate-200 rounded-[10px] px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">System ID</label>
                          <input 
                            type="text"
                            value={widget.id}
                            onChange={e => updateWidgetField(widget.id, 'id', e.target.value.trim().toLowerCase().replace(/\s+/g, '-'))}
                            className="bg-white border border-slate-200 rounded-[10px] px-3 py-1.5 text-xs font-mono text-slate-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Width Sizing (%)</label>
                          <input 
                            type="text"
                            placeholder="e.g. 50 or 33.3 or 100"
                            value={widget.width || '100'}
                            onChange={e => updateWidgetField(widget.id, 'width', e.target.value)}
                            className="bg-white border border-slate-200 rounded-[10px] px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Plan Tier Access</label>
                          <select
                            value={widget.planRequirement || 'free'}
                            onChange={e => updateWidgetField(widget.id, 'planRequirement', e.target.value)}
                            className="bg-white border border-slate-200 rounded-[10px] px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                          >
                            <option value="free">Free Tier & up</option>
                            <option value="starter">Starter Tier & up</option>
                            <option value="standard">Standard Pro & up</option>
                            <option value="professional">Professional Only</option>
                          </select>
                        </div>
                      </div>

                      {/* Options input */}
                      {['Select Dropdown', 'Option Grid', 'Check Grid', 'Color Swatch'].includes(widget.type) && (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Data Source (MongoDB)</label>
                            <select
                              value={widget.dataSource || ''}
                              onChange={e => updateWidgetField(widget.id, 'dataSource', e.target.value || undefined)}
                              className="bg-white border border-slate-200 rounded-[10px] px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                            >
                              <option value="">Static Options List (Defined Below)</option>
                              <option value="room-types">Room Types collection</option>
                              <option value="design-styles">Design Styles collection</option>
                              <option value="color-palettes">Color Palettes collection</option>
                              <option value="lighting">Lighting collection</option>
                              <option value="moods">Moods collection</option>
                              <option value="budget-levels">Budget Levels collection</option>
                              <option value="products">Products collection</option>
                              <option value="roof-types">Roof Types collection</option>
                              <option value="environment">Environment Settings collection</option>
                              <option value="time-of-day">Time of Day collection</option>
                            </select>
                          </div>

                          {!widget.dataSource && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] text-slate-400 font-bold uppercase">Options (separated by comma)</label>
                                <span className="text-[9px] text-slate-400">Total: {widget.options?.length || 0}</span>
                              </div>
                              <input 
                                type="text"
                                value={widget.options ? widget.options.join(', ') : ''}
                                onChange={e => {
                                  const optionsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  updateWidgetField(widget.id, 'options', optionsArray);
                                }}
                                placeholder="Value 1, Value 2, Value 3"
                                className="w-full bg-white border border-slate-200 rounded-[10px] px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Range slider values */}
                      {widget.type === 'Range Slider' && (
                        <div className="grid grid-cols-4 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Min</label>
                            <input 
                              type="number"
                              value={widget.min || 0}
                              onChange={e => updateWidgetField(widget.id, 'min', parseFloat(e.target.value))}
                              className="bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Max</label>
                            <input 
                              type="number"
                              value={widget.max || 1.0}
                              onChange={e => updateWidgetField(widget.id, 'max', parseFloat(e.target.value))}
                              className="bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Step</label>
                            <input 
                              type="number"
                              value={widget.step || 0.05}
                              onChange={e => updateWidgetField(widget.id, 'step', parseFloat(e.target.value))}
                              className="bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Default</label>
                            <input 
                              type="number"
                              value={widget.defaultValue || 0.8}
                              onChange={e => updateWidgetField(widget.id, 'defaultValue', parseFloat(e.target.value))}
                              className="bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Widget Shelf Library (Col-span 4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[10px] p-6 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold text-purple-700 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-purple-600" /> Widget Shelf
              </h3>
              
              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">Click any widget below to append it to this dynamic form.</p>

              <div className="flex flex-col gap-2">
                {WIDGET_TEMPLATES.map(w => (
                  <button
                    key={w.type}
                    type="button"
                    onClick={() => addWidget(w.type, w.defaultLabel)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-purple-50/40 border border-slate-200 hover:border-purple-200 rounded-[10px] transition-all duration-150 text-left group cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-purple-700 transition-colors duration-150">{w.type}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">add field widget</span>
                    </div>
                    <PlusCircle className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors duration-150 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>


        </div>
      ) : (
        
        // ==============================================
        // 2. MAIN TABLE LIST VIEW
        // ==============================================
        <>
          {successMsg && (
            <div className="p-4 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {[
                { id: 'all', label: `${t('admin.models.allModels') || 'All Models'} (${models.length})` },
                { id: 'interior', label: t('admin.models.interior') || 'Interior' },
                { id: 'exterior', label: t('admin.models.exterior') || 'Exterior' },
                { id: 'floorplan', label: t('admin.models.floorplan') || 'Floor Plan' },
                { id: 'editing', label: t('admin.models.editing') || 'Editing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-[10px] whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-800 font-sans">
                    <th className="py-3.5 px-4">{t('admin.models.modelSlug') || 'Model & Slug'}</th>
                    <th className="py-3.5 px-4">{t('admin.models.categoryBadge') || 'Category & Badge'}</th>
                    <th className="py-3.5 px-4">{t('admin.models.credits') || 'Credits'}</th>
                    <th className="py-3.5 px-4 text-center">{t('admin.models.originalImage') || 'Original Image (Before)'}</th>
                    <th className="py-3.5 px-4 text-center">{t('admin.models.convertedImage') || 'Converted Image (After)'}</th>
                    <th className="py-3.5 px-4">{t('admin.models.description') || 'Description'}</th>
                    <th className="py-3.5 px-4 text-right rtl:text-left">{t('admin.models.actions') || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <tr key={model._id || model.slug} className="hover:bg-slate-50/80 transition-colors">
                        {/* Model & Slug */}
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-slate-900 font-heading text-sm">
                            {model.name}
                          </div>
                          <code className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 mt-1 inline-block">
                            {model.slug}
                          </code>
                        </td>

                        {/* Category & Badge */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="capitalize font-bold px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700">
                              {model.category}
                            </span>
                            {model.badge && (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                                {model.badge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Credits */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-900 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-[10px] text-xs">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {model.creditCost}
                          </span>
                        </td>

                        {/* Original Image thumbnail */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-14 rounded-[10px] overflow-hidden border border-slate-200 bg-slate-900 relative shadow-xs group">
                              <img
                                src={
                                  model.originalImage
                                    ? (model.originalImage.startsWith('/uploads/') ? `http://localhost:5001${model.originalImage}` : model.originalImage)
                                    : 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop'
                                }
                                alt={`${model.name} Original`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop';
                                }}
                              />
                              <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 bg-slate-900/80 text-[7px] font-black text-white rounded-md">
                                Original
                              </span>
                            </div>

                            <label className="px-2.5 py-1 rounded-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors">
                              {uploadingToolId === `${model._id || model.slug}-originalImage` ? (
                                <span className="animate-pulse">{t('admin.models.uploading') || 'Uploading...'}</span>
                              ) : (
                                <>
                                  <Upload className="w-2.5 h-2.5 text-purple-600" />
                                  <span>{t('admin.models.upload') || 'Upload'}</span>
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

                        {/* Converted Image thumbnail */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-14 rounded-[10px] overflow-hidden border border-slate-200 bg-slate-900 relative shadow-xs group">
                              <img
                                src={
                                  model.convertedImage
                                    ? (model.convertedImage.startsWith('/uploads/') ? `http://localhost:5001${model.convertedImage}` : model.convertedImage)
                                    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'
                                }
                                alt={`${model.name} Converted`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';
                                }}
                              />
                              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-purple-600 text-[7px] font-black text-white rounded-md flex items-center gap-0.5">
                                <Sparkles className="w-1.5 h-1.5 text-amber-300 fill-amber-300" />
                                <span>AI Render</span>
                              </span>
                            </div>

                            <label className="px-2.5 py-1 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs">
                              {uploadingToolId === `${model._id || model.slug}-convertedImage` ? (
                                <span className="animate-pulse">{t('admin.models.uploading') || 'Uploading...'}</span>
                              ) : (
                                <>
                                  <Upload className="w-2.5 h-2.5 text-white" />
                                  <span>{t('admin.models.upload') || 'Upload'}</span>
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

                        {/* Description */}
                        <td className="py-4 px-4 max-w-xs text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                          {model.description || 'No description configured.'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingModel(model)}
                              className="px-3 py-1.5 rounded-[10px] bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-extrabold inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {/* Dynamic Form Customizer button link */}
                            <button
                              onClick={() => startCustomizing(model)}
                              className="px-3 py-1.5 rounded-[10px] bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 hover:border-purple-600 text-xs font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer border border-purple-100"
                              title="Customize input fields & options"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Form</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold leading-relaxed">
                        {searchQuery ? `No AI models found matching "${searchQuery}"` : 'No models available.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Model Details Modal Popup */}
      {editingModel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Edit AI Model: {editingModel.name}
              </h3>
              <button
                onClick={() => setEditingModel(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="w-full p-2.5 border border-slate-200 rounded-[10px] text-xs font-semibold text-slate-900 mt-1"
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
                    className="w-full p-2.5 border border-slate-200 rounded-[10px] text-xs font-semibold text-slate-900 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Credit Cost</label>
                  <input
                    type="number"
                    value={editingModel.creditCost}
                    onChange={(e) => setEditingModel({ ...editingModel, creditCost: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-[10px] text-xs font-semibold text-slate-900 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={editingModel.description || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-[10px] text-xs text-slate-900 mt-1 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Original Image URL</label>
                <input
                  type="text"
                  value={editingModel.originalImage || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, originalImage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-[10px] text-xs text-slate-900 font-mono mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Converted Image URL</label>
                <input
                  type="text"
                  value={editingModel.convertedImage || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, convertedImage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-[10px] text-xs text-slate-900 font-mono mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingModel(null)}
                className="px-4 py-2 rounded-[10px] text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveModelEdit}
                className="px-5 py-2 rounded-[10px] text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 shadow-md cursor-pointer"
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
