'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Link as LinkIcon,
  ImageIcon,
  Wand2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function Generate2Page() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg('Please enter a custom prompt.');
      return;
    }
    setErrorMsg(null);
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${baseUrl}/rooms/generate-2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl.trim() || undefined,
          prompt: prompt.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Generation failed.');
      }

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error('No image URL returned from server.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please verify backend server and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Flux Direct Studio 2.0
            </h1>
            <p className="text-xs text-slate-400 font-medium">URL-to-Image Generation (Flux Only)</p>
          </div>
        </div>

        <Link
          href="/generate"
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          Back to standard generate
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid md:grid-cols-12 gap-8 items-start">
        {/* Left Control Panel */}
        <section className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Configure Inputs
            </h2>
            <p className="text-xs text-slate-400">
              Provide a custom prompt and public image link to trigger Flux redesign. No disk saving or DB tracking occurs.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">
            {/* Image URL Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Image URL (Optional for Image-to-Image)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 transition-all font-mono"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Must be an absolute HTTP/HTTPS address accessible publicly on the internet (e.g. Unsplash, Imgur).
              </p>
            </div>

            {/* Custom Prompt Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                Custom Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="A high quality photorealistic modern scandinavian living room redesign with clean oak details, neutral gray sofa, warm sunset lighting, highly detailed..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 transition-all leading-relaxed"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-4.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-95 transition-all ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Redesign
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Preview Section */}
        <section className="md:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Input Image Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-h-[300px]">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                Original Image Preview
              </span>
              <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[250px]">
                {imageUrl.trim() ? (
                  <img
                    src={imageUrl}
                    alt="Original Upload Link"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 text-slate-700" />
                    <span className="text-xs text-slate-600">Provide an image URL to preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Image Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-h-[300px]">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Generated Redesign
              </span>
              <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[250px]">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-3 p-6 text-center"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <div>
                        <p className="text-xs text-slate-300 font-bold">Calling Pollinations Flux...</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                          Generating the redesigned space using your custom prompt parameter.
                        </p>
                      </div>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.img
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={generatedImage}
                      alt="AI Redesigned Result"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center gap-2">
                      <Sparkles className="w-8 h-8 text-slate-700" />
                      <span className="text-xs text-slate-600">Generated result will display here</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
