'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';

const SAMPLE_ROOMS = [
  {
    name: 'Living Room',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    prompt: 'Photorealistic 8K UHD architectural interior redesign of a Living Room in Modern Japandi style. Lock 1:1 camera angle and structural walls.',
  },
  {
    name: 'Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
    prompt: 'Ultra-realistic interior design transformation of a Bedroom into a Luxury Minimalist style with warm ambient lighting.',
  },
  {
    name: 'Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
    prompt: 'Modern Scandinavian kitchen redesign with marble countertops and matte black fixtures.',
  },
];

export default function GenerateTestPage() {
  const [imageUrl, setImageUrl] = useState(SAMPLE_ROOMS[0].url);
  const [prompt, setPrompt] = useState(SAMPLE_ROOMS[0].prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPreset = (room: typeof SAMPLE_ROOMS[0]) => {
    setImageUrl(room.url);
    setPrompt(room.prompt);
    setResult(null);
    setErrorMsg('');
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setResult(null);
    setErrorMsg('');
    setLogs(['🚀 Submitting test request to backend RoomWhiz AI controller...']);

    try {
      let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      if (backendUrl.endsWith('/api')) {
        backendUrl = `${backendUrl}/v1`;
      }
      const endpoint = `${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/rooms/test-manus`;

      setLogs((prev) => [...prev, `📡 Calling POST ${endpoint}...`]);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || `HTTP ${res.status} Error`);
      }

      setLogs((prev) => [
        ...prev,
        `✅ RoomWhiz Task Completed!`,
        `🕒 Time Taken: ${(data.timeTakenMs / 1000).toFixed(1)}s`,
        `🖼️ Image URL Received: ${data.outputImageUrl}`,
      ]);

      setResult(data);
    } catch (err: any) {
      console.error('Test error:', err);
      setErrorMsg(err.message || 'RoomWhiz test request failed.');
      setLogs((prev) => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RoomWhiz AI Direct API Tester</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight sm:text-4xl">
            Test RoomWhiz AI Integration
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Test sending prompts and image URLs directly to RoomWhiz AI API to inspect task payloads, polling logs, and generated image renders.
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          <span className="text-xs font-semibold text-slate-400 self-center mr-2">Sample Presets:</span>
          {SAMPLE_ROOMS.map((room) => (
            <button
              key={room.name}
              type="button"
              onClick={() => handleSelectPreset(room)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                imageUrl === room.url
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Inputs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>Input Parameters</span>
            </h2>

            <form onSubmit={handleRunTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source Image URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={imageUrl}
                    alt="Source preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-2xl bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-slate-300">
                    Source Image
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  RoomWhiz AI Prompt
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter prompt for RoomWhiz AI..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing RoomWhiz AI Task...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Prompt to RoomWhiz AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Output & Logs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Generation Output & Logs</span>
            </h2>

            {/* Log Output Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-slate-500 font-semibold mb-1">=== Execution Log Stream ===</div>
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Click "Send Prompt to RoomWhiz AI" to start test execution...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-slate-300">
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 bg-red-950/40 border border-red-800 rounded-2xl flex items-start gap-3 text-red-300 text-xs">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-200">RoomWhiz AI Request Error</div>
                  <div className="mt-1 font-mono">{errorMsg}</div>
                </div>
              </div>
            )}

            {/* Successful Result Display */}
            {result && result.success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RoomWhiz AI Render Generated Successfully in {(result.timeTakenMs / 1000).toFixed(1)}s!</span>
                </div>

                {/* Generated Image Output */}
                <div className="relative h-64 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl">
                  <img
                    src={result.outputImageUrl}
                    alt="RoomWhiz Generated Redesign"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-2xl bg-black/70 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RoomWhiz AI Render</span>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provider:</span>
                    <span className="font-bold text-white">{result.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model:</span>
                    <span className="font-mono text-blue-400">{result.modelName}</span>
                  </div>
                  {result.chatId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Task / Session ID:</span>
                      <span className="font-mono text-indigo-400">{result.chatId}</span>
                    </div>
                  )}
                </div>

                <a
                  href={result.outputImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Open Full Resolution Image</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
