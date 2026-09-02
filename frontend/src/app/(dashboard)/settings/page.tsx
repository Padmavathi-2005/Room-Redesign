'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Palette, Sun, Moon, Sparkles, Check, RefreshCw, ShieldAlert, Sliders, CreditCard, Key, Eye, EyeOff, Lock, Plus, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [formState, setFormState] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFormState(settings);
    }
  }, [settings, isLoading]);

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const currentTaxes = Array.isArray(formState.taxes)
    ? formState.taxes
    : [{ id: 'tax-vat', name: 'VAT (Sales Tax)', rate: 0, enabled: false }];

  const handleAddTaxRow = () => {
    const updated = [
      ...currentTaxes,
      { id: `tax-${Date.now()}`, name: 'New Tax / Fee', rate: 5, enabled: true },
    ];
    handleChange('taxes', updated);
  };

  const handleUpdateTax = (index: number, field: string, value: any) => {
    const updated = [...currentTaxes];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('taxes', updated);
  };

  const handleDeleteTax = (index: number) => {
    const updated = currentTaxes.filter((_, i) => i !== index);
    handleChange('taxes', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateSettings(formState);
    setIsSubmitting(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white flex items-center gap-3">
            <Palette className="w-8 h-8 text-indigo-600" />
            <span>Theme & System Settings</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Customize the dynamic database-driven theme engine, colors, glassmorphism, and brand assets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Active Theme Mode */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Active Theme Mode</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => handleChange('theme', 'light')}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-medium transition-all ${
                formState.theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span>Light Theme</span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('theme', 'dark')}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-medium transition-all ${
                formState.theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Dynamic Palette Color Controls */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Brand & Palette Colors</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.primaryColor || '#6366F1'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={formState.primaryColor || '#6366F1'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.secondaryColor || '#8B5CF6'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={formState.secondaryColor || '#8B5CF6'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.accentColor || '#06B6D4'}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={formState.accentColor || '#06B6D4'}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Light Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.backgroundColor || '#FFFFFF'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={formState.backgroundColor || '#FFFFFF'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Light Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formState.textColor || '#111827'}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={formState.textColor || '#111827'}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Glassmorphism & Radius Sliders */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <span>Glassmorphism & Border Radius Sliders</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Border Radius */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>BORDER RADIUS</span>
                <span className="text-indigo-600 font-bold">{formState.borderRadius || 16}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={formState.borderRadius || 16}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Glass Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>GLASS OPACITY</span>
                <span className="text-indigo-600 font-bold">{formState.glassOpacity || 0.7}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={formState.glassOpacity || 0.7}
                onChange={(e) => handleChange('glassOpacity', parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Blur Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>BLUR STRENGTH</span>
                <span className="text-indigo-600 font-bold">{formState.blurStrength || 20}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={formState.blurStrength || 20}
                onChange={(e) => handleChange('blurStrength', parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Application Meta & Maintenance Mode */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            <span>Platform Metadata</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Application Name
              </label>
              <input
                type="text"
                value={formState.applicationName || 'RoomAI'}
                onChange={(e) => handleChange('applicationName', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={formState.maintenanceMode || false}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Enable Maintenance Mode
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION: Payment Gateway Keys & Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span>Payment Keys & Settings</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enable or disable payment methods and configure live API keys. Only enabled gateways will be presented to users on the checkout page.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* STRIPE CARD */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                      Stripe Gateway
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">Credit / Debit Card Checkout</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.stripeEnabled ?? true}
                    onChange={(e) => handleChange('stripeEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {formState.stripeEnabled !== false ? (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                      Stripe Publishable Key
                    </label>
                    <input
                      type="text"
                      placeholder="pk_live_••••••••••••••••"
                      value={formState.stripePublishableKey || ''}
                      onChange={(e) => handleChange('stripePublishableKey', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                      Stripe Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk_live_••••••••••••••••"
                      value={formState.stripeSecretKey || ''}
                      onChange={(e) => handleChange('stripeSecretKey', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-500 dark:text-rose-400 italic py-2 font-medium">
                  ✕ Stripe Gateway is currently disabled. Users will not see Credit Card options on checkout.
                </p>
              )}
            </div>

            {/* PAYPAL CARD */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600">
                    <span className="font-extrabold italic text-sm text-blue-600">PP</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                      PayPal Express
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">PayPal One-Click Checkout</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.paypalEnabled ?? true}
                    onChange={(e) => handleChange('paypalEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formState.paypalEnabled !== false ? (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                      PayPal Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="client_id_••••••••••••••••"
                      value={formState.paypalClientId || ''}
                      onChange={(e) => handleChange('paypalClientId', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                      PayPal Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="secret_key_••••••••••••••••"
                      value={formState.paypalSecretKey || ''}
                      onChange={(e) => handleChange('paypalSecretKey', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-500 dark:text-rose-400 italic py-2 font-medium">
                  ✕ PayPal Gateway is currently disabled. Users will not see PayPal options on checkout.
                </p>
              )}
            </div>
          </div>

          {/* TAXES & CUSTOM FEES MANAGEMENT CARD */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Dynamic Taxes & Custom Fees Configuration
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure tax names, rates, and enable/disable states. Enabled taxes apply automatically to checkout totals.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTaxRow}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Tax Rule
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse bg-slate-50/50 dark:bg-slate-800/40">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <th className="py-3 px-4">Tax / Fee Name</th>
                    <th className="py-3 px-4">Tax Rate (%)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {currentTaxes.map((tax: any, idx: number) => (
                    <tr key={tax.id || idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/80">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={tax.name}
                          onChange={(e) => handleUpdateTax(idx, 'name', e.target.value)}
                          placeholder="e.g. VAT (Sales Tax)"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                        />
                      </td>
                      <td className="py-3 px-4 w-36">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={tax.rate}
                            onChange={(e) => handleUpdateTax(idx, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 pr-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                          <span className="absolute right-3 text-xs font-extrabold text-slate-400">%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 w-36">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className={`text-xs font-extrabold ${tax.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {tax.enabled ? '✓ Enabled' : '✕ Disabled'}
                          </span>
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={tax.enabled}
                              onChange={(e) => handleUpdateTax(idx, 'enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </div>
                        </label>
                      </td>
                      <td className="py-3 px-4 text-right w-16">
                        <button
                          type="button"
                          onClick={() => handleDeleteTax(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title="Remove Tax Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-4 pt-4">
          {isSaved && (
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              Settings Saved to Database!
            </span>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>Save Theme Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
