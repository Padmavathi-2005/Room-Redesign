'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Upload,
  Link as LinkIcon,
  X,
  ExternalLink,
} from 'lucide-react';

interface BlockItem {
  id: string;
  type: 'hero' | 'text' | 'features' | 'cta' | 'faq' | 'image' | 'html';
  content: Record<string, any>;
}

export default function AdminCmsBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams ? searchParams.get('id') : null;

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor Settings
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [isSystemPage, setIsSystemPage] = useState(false);
  const [editMode, setEditMode] = useState<'blocks' | 'html'>('blocks');

  // Content State
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [customHtml, setCustomHtml] = useState('');

  const handleImageFileUpload = (blockId: string, file: File) => {
    if (!file) return;

    // 1. Instant preview using FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      if (base64Url) {
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId ? { ...b, content: { ...b.content, imageUrl: base64Url } } : b,
          ),
        );
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to server asynchronously if API is running
    (async () => {
      try {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${apiUrl}/admin/tools/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.url) {
            const fullUrl = data.data.url.startsWith('http')
              ? data.data.url
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${data.data.url}`;
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === blockId ? { ...b, content: { ...b.content, imageUrl: fullUrl } } : b,
              ),
            );
          }
        }
      } catch (err) {
        // Base64 fallback remains intact
      }
    })();
  };

  const handleOgFileUpload = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      if (base64Url) {
        setOgImage(base64Url);
      }
    };
    reader.readAsDataURL(file);

    (async () => {
      try {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${apiUrl}/admin/tools/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.url) {
            const fullUrl = data.data.url.startsWith('http')
              ? data.data.url
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${data.data.url}`;
            setOgImage(fullUrl);
          }
        }
      } catch (err) {
        // Base64 fallback remains intact
      }
    })();
  };

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await fetch(`${apiUrl}/cms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const p = data.data;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setDescription(p.description || '');
        setOgImage(p.ogImage || '');
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
      ogImage,
      status,
      isSystemPage,
      blocks: editMode === 'blocks' ? blocks : [],
      customHtml: editMode === 'html' ? customHtml : '',
    };

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/cms')}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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
          {/* Open Live Page Button */}
          {slug && (
            <Link
              href={`/${slug}`}
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-2 text-xs font-black transition-all cursor-pointer border border-indigo-100"
              title="Open live page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Page</span>
            </Link>
          )}

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl font-bold"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-800 block">URL Slug (`/{slug}`)</label>
            <input
              type="text"
              required
              placeholder="e.g. terms-of-service"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl font-mono text-xs"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-800 block">Publish Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl font-bold"
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
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl font-medium"
          />
        </div>

        {/* SEO OpenGraph Social Share Image */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-slate-800 flex items-center justify-between">
            <span>SEO & OpenGraph Social Share Image (OG Image)</span>
            <span className="text-[10px] text-slate-400 font-normal">Displayed on Twitter/X, Facebook, LinkedIn</span>
          </label>

          {ogImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-36 flex items-center justify-center p-2">
              <img src={ogImage} alt="SEO Preview" className="max-h-32 object-contain rounded-xl" />
              <button
                type="button"
                onClick={() => setOgImage('')}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                title="Remove SEO Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-indigo-600" />
                <span>Paste Web Image URL</span>
              </span>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Upload className="w-3 h-3 text-indigo-600" />
                <span>Upload Image File</span>
              </span>
              <label className="flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-2xl font-bold text-xs cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Social Image...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleOgFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Blocks vs Custom HTML */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-150 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Editor Mode:</span>
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setEditMode('blocks')}
                className={`px-3 py-1 rounded-2xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  editMode === 'blocks' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Visual Component Blocks</span>
              </button>
              <button
                type="button"
                onClick={() => setEditMode('html')}
                className={`px-3 py-1 rounded-2xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
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

      {/* Main Workspace */}
      {editMode === 'blocks' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Col: Component Blocks Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Page Component Canvas</h3>
                <span className="text-xs font-bold text-slate-500">{blocks.length} Blocks Added</span>
              </div>

              {blocks.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-400 space-y-3">
                  <Layout className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No Component Blocks Added</p>
                  <p className="text-xs">Click a block button on the right palette to add it to your page canvas.</p>
                </div>
              ) : (
                blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4 relative group"
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
                          className="p-1 rounded-2xl hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === blocks.length - 1}
                          onClick={() => moveBlock(idx, 'down')}
                          className="p-1 rounded-2xl hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Badge Text</label>
                            <input
                              type="text"
                              value={block.content.badge || ''}
                              onChange={(e) => updateBlockContent(block.id, { ...block.content, badge: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Hero Subtitle</label>
                          <textarea
                            rows={2}
                            value={block.content.subtitle || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 resize-none font-medium"
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Body Content (HTML / Text)</label>
                          <textarea
                            rows={5}
                            value={block.content.body || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, body: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-normal leading-relaxed"
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
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Button Label</label>
                            <input
                              type="text"
                              value={block.content.buttonText || ''}
                              onChange={(e) => updateBlockContent(block.id, { ...block.content, buttonText: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-4 text-xs">
                        <div className="space-y-2">
                          <label className="font-bold text-slate-700 flex items-center justify-between">
                            <span>Image Source (URL or File Upload)</span>
                            <span className="text-[10px] text-slate-400 font-normal">Supports JPG, PNG, WEBP, GIF</span>
                          </label>

                          {/* Preview thumbnail if image exists */}
                          {block.content.imageUrl ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-48 flex items-center justify-center p-2">
                              <img
                                src={block.content.imageUrl}
                                alt="Block Preview"
                                className="max-h-44 object-contain rounded-xl"
                              />
                              <button
                                type="button"
                                onClick={() => updateBlockContent(block.id, { ...block.content, imageUrl: '' })}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                                title="Remove Image"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Option A: Direct Web Image URL */}
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                <LinkIcon className="w-3 h-3 text-indigo-600" />
                                <span>Paste Image Web URL</span>
                              </span>
                              <input
                                type="text"
                                placeholder="https://images.unsplash.com/..."
                                value={block.content.imageUrl || ''}
                                onChange={(e) => updateBlockContent(block.id, { ...block.content, imageUrl: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-500"
                              />
                            </div>

                            {/* Option B: Local File Upload */}
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                <Upload className="w-3 h-3 text-indigo-600" />
                                <span>Upload File From Computer</span>
                              </span>
                              <label className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-2xl font-bold text-xs cursor-pointer transition-all">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Choose Image File...</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleImageFileUpload(block.id, e.target.files[0]);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Caption</label>
                          <input
                            type="text"
                            placeholder="e.g. Modern Living Room Render Showcase"
                            value={block.content.caption || ''}
                            onChange={(e) => updateBlockContent(block.id, { ...block.content, caption: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900"
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
                          className="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right Col: Component Palette Sidebar */}
            <div className="lg:col-span-1 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
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
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs space-y-3 text-xs font-bold text-slate-700">
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
      }
    </div>
  );
}
