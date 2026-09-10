'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Coins,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Globe,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Star,
  Check,
  X,
  Calculator,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminSearch } from '@/context/AdminSearchContext';

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number | string;
  isDefault: boolean;
  isActive: boolean;
  position: 'prefix' | 'suffix';
  decimalPlaces: number;
}

const INITIAL_FORM: CurrencyFormData = {
  code: '',
  name: '',
  symbol: '',
  exchangeRate: 1.0,
  isDefault: false,
  isActive: true,
  position: 'prefix',
  decimalPlaces: 2,
};

export default function AdminCurrenciesPage() {
  const { toast } = useToast();
  const { refreshCurrencies } = useCurrency();
  const { t } = useLanguage();
  const { searchQuery } = useAdminSearch();

  const [mounted, setMounted] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState<CurrencyFormData>(INITIAL_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminCurrencies();
      const list: Currency[] = res?.currencies || [];
      setCurrencies(list);
      const def = res?.defaultCurrency || list.find((c) => c.isDefault) || null;
      setDefaultCurrency(def);
    } catch (err: any) {
      toast.error(err.message || 'Could not fetch currencies from server', 'Error Loading Currencies');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const openAddModal = () => {
    setEditingCurrency(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (curr: Currency) => {
    setEditingCurrency(curr);
    setFormData({
      code: curr.code,
      name: curr.name,
      symbol: curr.symbol,
      exchangeRate: curr.exchangeRate,
      isDefault: curr.isDefault,
      isActive: curr.isActive,
      position: curr.position,
      decimalPlaces: curr.decimalPlaces ?? 2,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.symbol) {
      toast.error('Please provide code, name, and symbol.', 'Validation Error');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        symbol: formData.symbol.trim(),
        exchangeRate: Number(formData.exchangeRate),
        isDefault: Boolean(formData.isDefault),
        isActive: Boolean(formData.isActive),
        position: formData.position,
        decimalPlaces: Number(formData.decimalPlaces),
      };

      if (editingCurrency && editingCurrency._id) {
        await adminService.updateCurrency(editingCurrency._id, payload);
        toast.success(`${payload.code} has been successfully updated.`, 'Currency Updated');
      } else {
        await adminService.createCurrency(payload);
        toast.success(`${payload.code} has been added to available currencies.`, 'Currency Created');
      }

      setIsModalOpen(false);
      await fetchCurrencies();
      await refreshCurrencies();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save currency', 'Error Saving Currency');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSetDefault = async (curr: Currency) => {
    if (!curr._id || curr.isDefault) return;
    try {
      await adminService.setDefaultCurrency(curr._id);
      toast.success(`${curr.code} (${curr.symbol}) is now the platform's default base currency.`, 'Base Currency Updated');
      await fetchCurrencies();
      await refreshCurrencies();
    } catch (err: any) {
      toast.error(err.message || 'Could not set default currency', 'Failed to Set Default');
    }
  };

  const handleToggleActive = async (curr: Currency) => {
    if (!curr._id) return;
    if (curr.isDefault) {
      toast.warning('The default base currency must remain active.', 'Cannot Deactivate');
      return;
    }

    try {
      await adminService.updateCurrency(curr._id, { isActive: !curr.isActive });
      toast.success(`${curr.code} is now ${!curr.isActive ? 'Active' : 'Inactive'}.`, 'Status Updated');
      await fetchCurrencies();
      await refreshCurrencies();
    } catch (err: any) {
      toast.error(err.message, 'Update Failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !deleteTarget._id) return;
    setIsDeleting(true);
    try {
      await adminService.deleteCurrency(deleteTarget._id);
      toast.success(`${deleteTarget.code} has been deleted.`, 'Currency Deleted');
      setDeleteTarget(null);
      await fetchCurrencies();
      await refreshCurrencies();
    } catch (err: any) {
      toast.error(err.message, 'Deletion Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCurrencies = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return currencies.filter((c) => {
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q);

      const matchStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'active'
          ? c.isActive
          : !c.isActive;

      return matchSearch && matchStatus;
    });
  }, [currencies, searchQuery, filterStatus]);

  const activeCount = currencies.filter((c) => c.isActive).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* TOP CONTROLS TOOLBAR: FILTER TABS & SEARCH INDICATOR ON LEFT, REFRESH & ADD ON RIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {(
            [
              { id: 'all', label: 'All Currencies', count: currencies.length },
              { id: 'active', label: t('admin.currencies.activeOnly') || 'Active Only', count: activeCount },
              { id: 'inactive', label: 'Inactive', count: currencies.length - activeCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer font-heading whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-primary text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  filterStatus === tab.id
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
              <span>{t('admin.currencies.filtering') || 'Filtering'}: "{searchQuery}"</span>
            </span>
          )}
        </div>

        {/* Actions: Refresh & Add Currency */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={fetchCurrencies}
            disabled={loading}
            className="p-2.5 rounded-[10px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
            title={t('admin.currencies.refresh') || 'Refresh Currencies'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.currencies.addCurrency') || 'Add Currency'}</span>
          </button>
        </div>
      </div>

      {/* CURRENCIES TABLE */}
      <div className="rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-heading">
                <th className="py-3.5 px-4 sm:px-6">{t('admin.currencies.currency') || 'Currency'}</th>
                <th className="py-3.5 px-4">{t('admin.currencies.symbolPosition') || 'Symbol & Position'}</th>
                <th className="py-3.5 px-4">{t('admin.currencies.exchangeRate') || 'Exchange Rate'}</th>
                <th className="py-3.5 px-4">{t('admin.currencies.ratePreview') || 'Rate Preview ($100 Base)'}</th>
                <th className="py-3.5 px-4">{t('admin.currencies.status') || 'Status'}</th>
                <th className="py-3.5 px-4 sm:px-6 text-right rtl:text-left">{t('admin.currencies.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading currency rates...</span>
                  </td>
                </tr>
              ) : filteredCurrencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No currencies match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCurrencies.map((curr) => {
                  const baseSymbol = defaultCurrency?.symbol || '$';
                  const baseCode = defaultCurrency?.code || 'USD';
                  const convertedPreview = (100 * curr.exchangeRate).toFixed(curr.decimalPlaces ?? 2);

                  return (
                    <tr
                      key={curr._id || curr.code}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Code & Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-[10px] bg-primary/10 dark:bg-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0">
                            {curr.symbol}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white font-heading">
                                {curr.code}
                              </span>
                              {curr.isDefault && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  Default Base
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium truncate">
                              {curr.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Symbol & Position */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {curr.symbol}
                          </code>
                          <span className="text-[11px] text-slate-500 capitalize">
                            ({curr.position === 'suffix' ? (t('admin.currencies.suffix') || 'Suffix') : (t('admin.currencies.prefix') || 'Prefix')})
                          </span>
                        </div>
                      </td>

                      {/* Exchange Rate */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white font-heading">
                            1 {baseCode} = {curr.exchangeRate} {curr.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {curr.isDefault ? 'Base Currency (1.00)' : `Relative to ${baseCode}`}
                          </span>
                        </div>
                      </td>

                      {/* Rate Preview */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="text-slate-400 font-medium">$100 → </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {curr.position === 'suffix'
                            ? `${convertedPreview} ${curr.symbol}`
                            : `${curr.symbol}${convertedPreview}`}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(curr)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            curr.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Click to toggle active status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${curr.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{curr.isActive ? (t('admin.currencies.activeOnly') || 'Active') : (t('admin.currencies.inactive') || 'Inactive')}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!curr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(curr)}
                              className="px-2.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 text-[11px] font-bold transition-all cursor-pointer font-heading"
                              title={t('admin.languages.setDefault') || 'Set as Default Base Currency'}
                            >
                              {t('admin.languages.setDefault') || 'Set Default'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(curr)}
                            className="p-1.5 rounded-[10px] text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title={t('admin.currencies.editCurrency') || 'Edit Currency'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(curr)}
                            disabled={curr.isDefault}
                            className={`p-1.5 rounded-[10px] transition-all ${
                              curr.isDefault
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                            }`}
                            title={curr.isDefault ? 'Cannot delete default base currency' : (t('admin.currencies.deleteTitle') || 'Delete Currency')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CURRENCY MODAL - Portaled to document.body */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  {editingCurrency ? `Edit Currency (${editingCurrency.code})` : 'Add New Currency'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-[10px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
                    Currency Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. USD, EUR, INR"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold tracking-wider"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. $, €, ₹, £"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
                  Currency Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US Dollar, Euro, Indian Rupee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
                    Exchange Rate * (Rel. to {defaultCurrency?.code || 'Base'})
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    required
                    disabled={editingCurrency?.isDefault}
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
                    {t('admin.currencies.symbolPlacement') || 'Symbol Placement'}
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="prefix">{t('admin.currencies.prefix') || 'Prefix (e.g. $29.00)'}</option>
                    <option value="suffix">{t('admin.currencies.suffix') || 'Suffix (e.g. 29.00 €)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
                    {t('admin.currencies.decimalPlaces') || 'Decimal Places'}
                  </label>
                  <select
                    value={formData.decimalPlaces}
                    onChange={(e) => setFormData({ ...formData, decimalPlaces: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value={2}>2 Decimals (Standard - $29.00)</option>
                    <option value={0}>0 Decimals (JPY/KRW - ¥3,500)</option>
                    <option value={3}>3 Decimals (BHD/KWD - 10.500)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      disabled={editingCurrency?.isDefault}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded-[4px] text-primary focus:ring-primary"
                    />
                    <span>Active in Header</span>
                  </label>
                </div>
              </div>

              {/* LIVE PREVIEW BOX */}
              <div className="p-3 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">{t('admin.currencies.displayPreview') || 'Display Preview'}:</span>
                <span className="font-black text-primary font-mono">
                  {formData.position === 'suffix'
                    ? `${(100 * Number(formData.exchangeRate || 1)).toFixed(formData.decimalPlaces)} ${formData.symbol || '$'}`
                    : `${formData.symbol || '$'}${(100 * Number(formData.exchangeRate || 1)).toFixed(formData.decimalPlaces)}`}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer font-heading"
                >
                  {t('admin.currencies.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-[10px] bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50 font-heading"
                >
                  {formSubmitting ? 'Saving...' : editingCurrency ? 'Save Changes' : 'Create Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL - Portaled to document.body */}
      {mounted && deleteTarget && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                Delete {deleteTarget.name} ({deleteTarget.code})?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Are you sure you want to permanently delete this currency? Users will no longer be able to select it in the currency switcher.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer font-heading"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 font-heading"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
