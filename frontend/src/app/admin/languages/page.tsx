'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Globe,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  AlignLeft,
  AlignRight,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminSearch } from '@/context/AdminSearchContext';
import { LanguageInfo } from '@/locales';

export interface AdminLanguageItem extends LanguageInfo {
  isActive: boolean;
  isDefault: boolean;
}

const STORAGE_KEY = 'roomai_admin_languages';

const INITIAL_LANGUAGES: AdminLanguageItem[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    direction: 'Left-to-Right',
    isRtl: false,
    isActive: true,
    isDefault: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    direction: 'Left-to-Right',
    isRtl: false,
    isActive: true,
    isDefault: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    direction: 'Right-to-Left',
    isRtl: true,
    isActive: true,
    isDefault: false,
  },
];

interface FormData {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  isDefault: boolean;
  isActive: boolean;
}

const EMPTY_FORM: FormData = {
  code: '',
  name: '',
  nativeName: '',
  flag: '🌐',
  dir: 'ltr',
  isDefault: false,
  isActive: true,
};

export default function AdminLanguagesPage() {
  const { toast } = useToast();
  const { setLanguage, t } = useLanguage();
  const { searchQuery } = useAdminSearch();

  const [mounted, setMounted] = useState(false);
  const [languages, setLanguages] = useState<AdminLanguageItem[]>(INITIAL_LANGUAGES);
  const [filterDir, setFilterDir] = useState<'all' | 'ltr' | 'rtl'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<AdminLanguageItem | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminLanguageItem | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLanguages(parsed);
          return;
        }
      }
    } catch {}
    setLanguages(INITIAL_LANGUAGES);
  }, []);

  const saveLanguages = (updated: AdminLanguageItem[]) => {
    setLanguages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleOpenAdd = () => {
    setEditingLang(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lang: AdminLanguageItem) => {
    setEditingLang(lang);
    setFormData({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      dir: lang.dir,
      isDefault: lang.isDefault,
      isActive: lang.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toLowerCase();
    const cleanName = formData.name.trim();

    if (!cleanCode || !cleanName) {
      toast.error('Please enter a language code and name', 'Validation Error');
      return;
    }

    const directionLabel = formData.dir === 'rtl' ? 'Right-to-Left' : 'Left-to-Right';
    const isRtl = formData.dir === 'rtl';

    let updated: AdminLanguageItem[];

    if (editingLang) {
      updated = languages.map((item) => {
        if (item.code === editingLang.code) {
          return {
            ...item,
            code: cleanCode,
            name: cleanName,
            nativeName: formData.nativeName.trim() || cleanName,
            flag: formData.flag.trim() || '🌐',
            dir: formData.dir,
            direction: directionLabel,
            isRtl,
            isActive: formData.isActive,
            isDefault: formData.isDefault,
          };
        }
        if (formData.isDefault) {
          return { ...item, isDefault: false };
        }
        return item;
      });
      toast.success(t('admin.languages.languageUpdated') || `${cleanName} updated successfully`, 'Language Updated');
    } else {
      if (languages.some((l) => l.code === cleanCode)) {
        toast.error(`Language with code "${cleanCode}" already exists`, 'Duplicate Code');
        return;
      }

      const newItem: AdminLanguageItem = {
        code: cleanCode,
        name: cleanName,
        nativeName: formData.nativeName.trim() || cleanName,
        flag: formData.flag.trim() || '🌐',
        dir: formData.dir,
        direction: directionLabel,
        isRtl,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
      };

      if (formData.isDefault) {
        updated = [...languages.map((l) => ({ ...l, isDefault: false })), newItem];
      } else {
        updated = [...languages, newItem];
      }
      toast.success(t('admin.languages.languageCreated') || `${cleanName} has been added`, 'Language Created');
    }

    saveLanguages(updated);
    setIsModalOpen(false);
  };

  const handleSetDefault = (lang: AdminLanguageItem) => {
    if (lang.isDefault) return;
    const updated = languages.map((item) => ({
      ...item,
      isDefault: item.code === lang.code,
      isActive: item.code === lang.code ? true : item.isActive,
    }));
    saveLanguages(updated);
    setLanguage(lang.code);
    toast.success(`${lang.name} (${lang.nativeName}) is now default`, t('admin.languages.defaultUpdated') || 'Default Language Updated');
  };

  const handleToggleActive = (lang: AdminLanguageItem) => {
    if (lang.isDefault) {
      toast.warning('Default language cannot be disabled', 'Protected Language');
      return;
    }
    const updated = languages.map((item) =>
      item.code === lang.code ? { ...item, isActive: !item.isActive } : item
    );
    saveLanguages(updated);
    toast.success(`${lang.name} is now ${!lang.isActive ? (t('admin.languages.active') || 'Active') : (t('admin.languages.disabled') || 'Disabled')}`, t('admin.languages.status') || 'Status Updated');
  };

  const handleDelete = (lang: AdminLanguageItem) => {
    if (lang.isDefault) {
      toast.error('You cannot delete the default language', 'Action Prohibited');
      return;
    }
    const updated = languages.filter((l) => l.code !== lang.code);
    saveLanguages(updated);
    setDeleteTarget(null);
    toast.success(t('admin.languages.languageDeleted') || `${lang.name} has been removed`, 'Language Deleted');
  };

  const filtered = useMemo(() => {
    return languages.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nativeName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q);

      const matchesDir =
        filterDir === 'all' ||
        (filterDir === 'rtl' && item.isRtl) ||
        (filterDir === 'ltr' && !item.isRtl);

      return matchesSearch && matchesDir;
    });
  }, [languages, searchQuery, filterDir]);

  const totalCount = languages.length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* FILTER TABS & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        {/* TABS & SEARCH QUERY BADGE */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: 'all', label: t('admin.languages.all') || 'All Languages', count: totalCount },
            { id: 'ltr', label: t('admin.languages.ltrOnly') || 'LTR Only', count: languages.filter((l) => !l.isRtl).length },
            { id: 'rtl', label: t('admin.languages.rtlArabic') || 'RTL (Arabic)', count: languages.filter((l) => l.isRtl).length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterDir(tab.id as any)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap flex items-center gap-1.5 ${
                filterDir === tab.id
                  ? 'bg-primary text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-[6px] font-mono font-bold ${
                  filterDir === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          {searchQuery && (
            <span className="ml-2 px-2.5 py-1 rounded-[10px] bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              <span>{t('admin.languages.filtering') || 'Filtering'}: "{searchQuery}"</span>
            </span>
          )}
        </div>

        {/* ACTIONS: REFRESH & ADD LANGUAGE */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) setLanguages(JSON.parse(saved));
                else setLanguages(INITIAL_LANGUAGES);
              } catch {}
              toast.success(t('admin.languages.languagesRefreshed') || 'Languages refreshed', 'Refreshed');
            }}
            className="p-2.5 rounded-[10px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
            title={t('admin.languages.refresh') || 'Refresh Languages'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.languages.addLanguage') || 'Add Language'}</span>
          </button>
        </div>
      </div>

      {/* LANGUAGES DATA TABLE */}
      <div className="rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-heading">
                <th className="py-3.5 px-4 sm:px-6">{t('admin.languages.language') || 'Language'}</th>
                <th className="py-3.5 px-4">{t('admin.languages.code') || 'Code'}</th>
                <th className="py-3.5 px-4">{t('admin.languages.nativeName') || 'Native Name'}</th>
                <th className="py-3.5 px-4">{t('admin.languages.direction') || 'Direction'}</th>
                <th className="py-3.5 px-4">{t('admin.languages.default') || 'Default'}</th>
                <th className="py-3.5 px-4">{t('admin.languages.status') || 'Status'}</th>
                <th className="py-3.5 px-4 sm:px-6 text-right rtl:text-left">{t('admin.languages.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((lang) => (
                <tr
                  key={lang.code}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Language Name & Flag */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-slate-200/60 dark:border-slate-700">
                        {lang.flag}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white font-heading text-sm">
                        {lang.name}
                      </span>
                    </div>
                  </td>

                  {/* ISO Code */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                      {lang.code}
                    </span>
                  </td>

                  {/* Native Name */}
                  <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-200">
                    {lang.nativeName}
                  </td>

                  {/* Direction Field: LTR vs RTL */}
                  <td className="py-4 px-4">
                    {lang.isRtl ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800">
                        <AlignRight className="w-3.5 h-3.5" />
                        <span>{t('admin.languages.rtl') || 'Right-to-Left (RTL)'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] border border-blue-200 dark:border-blue-800">
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>{t('admin.languages.ltr') || 'Left-to-Right (LTR)'}</span>
                      </span>
                    )}
                  </td>

                  {/* Default Indicator */}
                  <td className="py-4 px-4">
                    {lang.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[11px] border border-amber-200/70 dark:border-amber-900/50">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{t('admin.languages.default') || 'Default'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(lang)}
                        className="text-slate-400 hover:text-amber-600 text-[11px] font-semibold hover:underline cursor-pointer"
                      >
                        {t('admin.languages.setDefault') || 'Set Default'}
                      </button>
                    )}
                  </td>

                  {/* Active Status Badge */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(lang)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] font-bold text-[11px] transition-all cursor-pointer ${
                        lang.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                      title={lang.isActive ? 'Click to disable' : 'Click to activate'}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          lang.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{lang.isActive ? (t('admin.languages.active') || 'Active') : (t('admin.languages.disabled') || 'Disabled')}</span>
                    </button>
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(lang)}
                        className="p-1.5 rounded-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                        title={t('admin.languages.editLanguage') || 'Edit Language'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!lang.isDefault && (
                        <button
                          onClick={() => setDeleteTarget(lang)}
                          className="p-1.5 rounded-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title={t('admin.languages.deleteTitle') || 'Delete Language'}
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
      </div>

      {/* Add / Edit Language Modal - Portaled to document.body so it overlays everything including header */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                  {editingLang ? (t('admin.languages.editLanguage') || 'Edit Language') : (t('admin.languages.addLanguage') || 'Add New Language')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('admin.languages.nameLabel') || 'Language Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arabic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('admin.languages.flagEmoji') || 'Flag Emoji'}
                  </label>
                  <input
                    type="text"
                    placeholder="🇸🇦"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-3 py-2 text-center rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('admin.languages.codeLabel') || 'Code (ISO)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. ar"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('admin.languages.nativeNameLabel') || 'Native Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. العربية"
                    value={formData.nativeName}
                    onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Direction selector: LTR vs RTL */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('admin.languages.textDirectionLabel') || 'Text Direction (RTL Support)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dir: 'ltr' })}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-[10px] border text-xs font-extrabold transition-all cursor-pointer ${
                      formData.dir === 'ltr'
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Left-to-Right (LTR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dir: 'rtl' })}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-[10px] border text-xs font-extrabold transition-all cursor-pointer ${
                      formData.dir === 'rtl'
                        ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                    <span>Right-to-Left (RTL)</span>
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded-[4px] text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t('admin.languages.defaultCheckbox') || 'Set as Platform Default Language'}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded-[4px] text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t('admin.languages.activeCheckbox') || 'Active & Available in Switcher'}</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('admin.languages.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[10px] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md transition-colors cursor-pointer"
                >
                  {editingLang ? (t('admin.languages.saveChanges') || 'Save Changes') : (t('admin.languages.createLanguage') || 'Create Language')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal - Portaled to document.body */}
      {mounted && deleteTarget && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                {t('admin.languages.deleteTitle') || 'Delete Language?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('admin.languages.deleteDesc') || 'Are you sure you want to remove this language? Users will no longer be able to select this locale.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-5 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md transition-colors cursor-pointer"
              >
                {t('admin.languages.confirmDelete') || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
