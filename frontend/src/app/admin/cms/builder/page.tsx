'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Globe,
  Sparkles,
  Code,
  Layout,
  Eye,
  CheckCircle2,
  AlertCircle,
  Wand2,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Zap,
} from 'lucide-react';

interface BlockItem {
  id: string;
  type: 'hero' | 'text' | 'features' | 'cta' | 'faq' | 'image' | 'html';
  content: Record<string, any>;
}

export default function AdminCmsBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor Settings
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [isSystemPage, setIsSystemPage] = useState(false);
  const [editMode, setEditMode] = useState<'blocks' | 'html'>('blocks');

  // Content State
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [customHtml, setCustomHtml] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Load Page Data if editing an existing page
  useEffect(() => {
    if (pageId) {
      fetchPageData(pageId);
    } else {
      // Default initial blocks for a fresh page
      setBlocks([
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Welcome to Our Platform',
            subtitle: 'Build and customize pages instantly with RoomAI CMS Builder.',
            badge: 'NEW PAGE',
          },
        },
        {
          id: 'text-1',
          type: 'text',
          content: {
            title: 'Overview',
            body: 'This is a customizable content section. You can format text, add headers, or modify component blocks in real-time.',
          },
        },
      ]);
    }
  }, [pageId]);

  const fetchPageData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/cms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const p = data.data;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setDescription(p.description || '');
        setStatus(p.status || 'published');
        setIsSystemPage(p.isSystemPage ?? false);
        setBlocks(p.blocks || []);
        setCustomHtml(p.customHtml || '');
        if (p.customHtml && (!p.blocks || p.blocks.length === 0)) {
          setEditMode('html');
        }
      } else {
        throw new Error(data.message || 'Failed to load CMS page data.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching page data.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title if slug is empty or user is typing title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!pageId && !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Block Manipulation Methods
  const addBlock = (type: BlockItem['type']) => {
    const newId = `${type}-${Date.now()}`;
    let defaultContent: Record<string, any> = {};

    switch (type) {
      case 'hero':
        defaultContent = {
          title: 'Hero Headline',
          subtitle: 'Subheadline describing page purpose and key call to action.',
          badge: 'FEATURED',
          ctaText: 'Get Started',
          ctaUrl: '/generate',
        };
        break;
      case 'text':
        defaultContent = {
          title: 'Section Title',
          body: 'Detailed text content goes here. Supports standard formatting.',
        };
        break;
      case 'features':
        defaultContent = {
          title: 'Key Platform Features',
          items: [
            { title: 'Feature 1', description: 'Description of the first feature' },
            { title: 'Feature 2', description: 'Description of the second feature' },
            { title: 'Feature 3', description: 'Description of the third feature' },
          ],
        };
        break;
      case 'cta':
        defaultContent = {
          headline: 'Ready to Transform Your Space?',
          subhead: 'Start creating architectural renders in seconds.',
          buttonText: 'Start Free Trial',
          buttonUrl: '/generate',
        };
        break;
      case 'faq':
        defaultContent = {
          title: 'Frequently Asked Questions',
          items: [
            { question: 'What is RoomAI?', answer: 'RoomAI is a generative AI design platform for floor plans, interiors, and exteriors.' },
            { question: 'How do credits work?', answer: 'Each render costs credits which refill with your subscription.' },
          ],
        };
        break;
      case 'image':
        defaultContent = {
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
          caption: 'Modern Waterfront Estate Facade',
        };
        break;
      case 'html':
        defaultContent = {
          rawHtml: '<div style="padding: 20px; text-align: center; background: #e0e7ff; border-radius: 12px; font-weight: bold; color: #4338ca;">Custom HTML Content Block</div>',
        };
        break;
    }

    setBlocks((prev) => [...prev, { id: newId, type, content: defaultContent }]);
  };

  const updateBlockContent = (id: string, newContent: Record<string, any>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBlocks(updated);
  };

  // Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      setError('Please provide both Page Title and URL Slug.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title,
      slug: slug.toLowerCase().trim(),
      description,
      status,
      isSystemPage,
      blocks: editMode === 'blocks' ? blocks : [],
      customHtml: editMode === 'html' ? customHtml : '',
    };

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const url = pageId ? `${apiUrl}/cms/${pageId}` : `${apiUrl}/cms`;
      const method = pageId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('CMS Page saved successfully!');
        if (!pageId && data.data?._id) {
          setTimeout(() => {
            router.push(`/admin/cms/builder?id=${data.data._id}`);
          }, 1200);
        }
      } else {
        throw new Error(data.message || 'Failed to save CMS Page.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving CMS Page.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/cms')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900">
              {pageId ? `Edit: ${title || 'CMS Page'}` : 'Create Custom CMS Page'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Design using visual component blocks or write custom raw HTML code.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Live Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 text-xs font-black shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Page...' : 'Save Page'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Configuration Form Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Page Metadata & SEO Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-800 block">Page Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Terms of Service"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-800 block">URL Slug (`/p/your-slug`)</label>
            <input
              type="text"
              required
              placeholder="e.g. terms-of-service"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-xl font-mono text-xs"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-800 block">Publish Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-xl font-bold"
            >
              <option value="published">Published (Live Public)</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-800 block">SEO Meta Description</label>
          <input
            type="text"
            placeholder="Search engine meta description for Google indexing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-xl font-medium"
          />
        </div>

        {/* Mode Switcher: Blocks vs Custom HTML */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-150 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Editor Mode:</span>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setEditMode('blocks')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  editMode === 'blocks' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Visual Component Blocks</span>
              </button>
              <button
                type="button"
                onClick={() => setEditMode('html')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  editMode === 'html' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Custom Raw HTML</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
            <input
              type="checkbox"
              checked={isSystemPage}
              onChange={(e) => setIsSystemPage(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <span>Core System Page</span>
          </label>
        </div>
      </div>

      {/* Main Workspace: Editor or Live Preview */}
      {activeTab === 'editor' ? (
        editMode === 'blocks' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Col: Component Blocks Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Page Component Canvas</h3>
                <span className="text-xs font-bold text-slate-500">{blocks.length} Blocks Added</span>
              </div>

              {blocks.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-400 space-y-3">
                  <Layout className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No Component Blocks Added</p>
                  <p className="text-xs">Click a block button on the right palette to add it to your page canvas.</p>
                </div>
              ) : (
                blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-4 relative group"
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                          Block #{idx + 1}: {block.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveBlock(idx, 'up')}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === blocks.length - 1}
                          onClick={() => moveBlock(idx, 'down')}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Block Fields Editor */}
                    {block.type === 'hero' && (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Hero Title</label>
                            <input
                              type="text"
                              value={block.content.title || ''}
                              onChange={(e) => updateBlockContent(block.id, { ...block.content, title: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Badge Text</label>
                            <input
                              type="text"
                              value={block.content.badge || ''}
                              onChange={(e) => updateBlockContent(block.id, { ...block.content, badge: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Hero Subtitle</label>
                          <textarea
                            rows={2}
                            value={block.content.subtitle || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 resize-none font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'text' && (
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Section Header Title</label>
                          <input
                            type="text"
                            value={block.content.title || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, title: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Body Content (HTML / Text)</label>
                          <textarea
                            rows={5}
                            value={block.content.body || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, body: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-normal leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'cta' && (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">CTA Headline</label>
                            <input
                              type="text"
                              value={block.content.headline || ''}
                              onChange={(e) => updateBlockContent(block.id, { ...block.content, headline: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Button Label</label>
                            <input
                              type="text"
                              value={block.content.buttonText || ''}
                              onChange={(e) => updateBlockContent(block.id, { ...block.content, buttonText: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Image URL</label>
                          <input
                            type="text"
                            value={block.content.imageUrl || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Caption</label>
                          <input
                            type="text"
                            value={block.content.caption || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, caption: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'html' && (
                      <div className="space-y-2 text-xs">
                        <label className="font-bold text-slate-700 block">Inline Raw HTML Code</label>
                        <textarea
                          rows={4}
                          value={block.content.rawHtml || ''}
                          onChange={(e) => updateBlockContent(block.id, { ...block.content, rawHtml: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right Col: Component Palette Sidebar */}
            <div className="lg:col-span-1 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Add Component Block</h3>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => addBlock('hero')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-100 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Hero Header Block</span>
                  </div>
                  <Plus className="w-4 h-4 text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('text')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    <span>Rich Text Article</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('features')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Features Grid</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('cta')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-emerald-600" />
                    <span>Call To Action Banner</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('faq')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>FAQ Accordion</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-600" />
                    <span>Image Showcase</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('html')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-rose-600" />
                    <span>Inline Custom HTML</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Custom Raw HTML Editor Mode */
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-2xs space-y-3 text-xs font-bold text-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900">Custom Full-Page HTML & CSS</label>
              <span className="text-[11px] font-mono text-indigo-600">Raw HTML Mode Active</span>
            </div>
            <textarea
              rows={16}
              placeholder="<html>...</html>"
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl focus:outline-none leading-relaxed"
            />
          </div>
        )
      ) : (
        /* Live Render Preview Pane */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xs space-y-8 min-h-[500px]">
          <div className="border-b border-slate-150 pb-4 flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>PUBLIC PAGE PREVIEW</span>
            <span>/p/{slug || 'your-slug'}</span>
          </div>

          {editMode === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: customHtml }} />
          ) : (
            <div className="space-y-12 max-w-4xl mx-auto">
              {blocks.map((block) => {
                if (block.type === 'hero') {
                  return (
                    <div key={block.id} className="text-center space-y-4 py-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 p-8">
                      {block.content.badge && (
                        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
                          {block.content.badge}
                        </span>
                      )}
                      <h1 className="text-3xl font-black text-slate-900">{block.content.title}</h1>
                      <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">{block.content.subtitle}</p>
                    </div>
                  );
                }

                if (block.type === 'text') {
                  return (
                    <div key={block.id} className="space-y-3">
                      {block.content.title && <h2 className="text-xl font-black text-slate-900">{block.content.title}</h2>}
                      <div className="text-xs text-slate-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: block.content.body || '' }} />
                    </div>
                  );
                }

                if (block.type === 'image') {
                  return (
                    <div key={block.id} className="space-y-2 text-center">
                      <img src={block.content.imageUrl} alt="CMS Showcase" className="w-full max-h-96 object-cover rounded-3xl border border-slate-200" />
                      {block.content.caption && <p className="text-xs text-slate-400 font-semibold">{block.content.caption}</p>}
                    </div>
                  );
                }

                if (block.type === 'html') {
                  return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.content.rawHtml || '' }} />;
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
