'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Palette, Sun, Moon, Sparkles, Check, RefreshCw, ShieldAlert, Sliders } from 'lucide-react';

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

        {/* SECTION: Table Pagination & System Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-600" />
            <span>Table & Data Pagination Settings</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure the default row limit and pagination size for all tables across the application (My Designs, Dashboard, Admin Tables).
          </p>

          <div className="max-w-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Default Table Rows Per Page
            </label>
            <select
              value={formState.tablePaginationLimit || 10}
              onChange={(e) => handleChange('tablePaginationLimit', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              <option value={5}>5 Rows Per Page</option>
              <option value={10}>10 Rows Per Page</option>
              <option value={15}>15 Rows Per Page</option>
              <option value={25}>25 Rows Per Page</option>
              <option value={50}>50 Rows Per Page</option>
            </select>
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
