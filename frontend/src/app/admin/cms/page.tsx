'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Globe,
  Lock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CmsPageItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'published';
  isSystemPage: boolean;
  views: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCmsListPage() {
  const router = useRouter();

  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/cms?includeDrafts=true`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPages(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load CMS pages');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch CMS pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string, title: string, isSystemPage: boolean) => {
    if (isSystemPage) {
      alert('Core system pages (Terms of Service, Privacy Policy) cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete the page "${title}"?`)) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/cms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Page "${title}" deleted successfully.`);
        fetchPages();
      } else {
        throw new Error(data.message || 'Failed to delete CMS page.');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting page.');
    }
  };

  const copyPageUrl = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/p/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalViews = pages.reduce((acc, p) => acc + (p.views || 0), 0);
  const publishedCount = pages.filter((p) => p.status === 'published').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">CMS & Custom Pages Manager</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Create, design, and manage custom HTML or component-based landing pages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/admin/cms/builder')}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Page</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Custom Pages</p>
            <p className="text-xl font-black text-slate-900">{pages.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published Live</p>
            <p className="text-xl font-black text-slate-900">{publishedCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Page Views</p>
            <p className="text-xl font-black text-slate-900">{totalViews}</p>
          </div>
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

      {/* Controls Bar: Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pages ({pages.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Drafts ({pages.length - publishedCount})
          </button>
        </div>
      </div>

      {/* CMS Pages Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Custom Pages...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No CMS Pages Found</p>
            <p className="text-xs text-slate-400">Click "Create Custom Page" to add a new page or template.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="py-3.5 px-5">Page Title & Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                {filteredPages.map((page) => (
                  <tr key={page._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs leading-tight">{page.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-400">/p/{page.slug}</span>
                            <button
                              onClick={() => copyPageUrl(page.slug)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Copy URL"
                            >
                              {copiedSlug === page.slug ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {page.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {page.isSystemPage ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          Core System Page
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Custom Page
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {page.views.toLocaleString()}
                    </td>

                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit in Builder */}
                        <button
                          onClick={() => router.push(`/admin/cms/builder?id=${page._id}`)}
                          className="px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Builder</span>
                        </button>

                        {/* View Public Page */}
                        <Link
                          href={`/p/${page.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Open Public Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        {!page.isSystemPage && (
                          <button
                            onClick={() => handleDelete(page._id, page.title, page.isSystemPage)}
                            className="p-1.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
