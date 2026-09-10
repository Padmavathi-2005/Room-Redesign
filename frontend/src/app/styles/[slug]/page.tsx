import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Star } from 'lucide-react';

interface StylePageProps {
  params: {
    slug: string;
  };
}

const STYLE_DETAILS: Record<string, { title: string; subtitle: string; description: string; badge: string; features: string[] }> = {
  'classic-traditional': {
    title: 'Classic Traditional AI Interior Redesign',
    subtitle: 'Timeless elegance, ornate woodwork, warm color palettes, and rich architectural details.',
    description: 'Transform any living space or bedroom into a refined classic traditional sanctuary using RoomAI advanced 8K architectural render engine.',
    badge: 'CLASSIC LUXURY',
    features: ['Custom Chandelier & Molding Previews', 'Rich Mahogany & Oak Texture Match', '8K UHD Architectural Quality', '1-Click Room Transformation'],
  },
  'modern-luxury': {
    title: 'Modern Luxury Interior Design Engine',
    subtitle: 'Sleek marble surfaces, ambient recessed LED lighting, geometric brass accents, and opulent space planning.',
    description: 'Reimagine high-end residential interiors with photorealistic modern luxury aesthetics, metallic accents, and high-contrast lighting.',
    badge: 'MODERN LUXURY',
    features: ['Italian Marble & Granite Finishes', 'Custom Ambient Lighting Controls', 'Ultra High Definition Renders', 'Instant Spatial Real Estate Staging'],
  },
  'minimalist-japandi': {
    title: 'Minimalist Japandi & Nordic Room Redesign',
    subtitle: 'Harmony of Japanese wabi-sabi aesthetics and Scandinavian functionality.',
    description: 'Create calm, decluttered spaces with natural light, organic bamboo wood, neutral earthy linen tones, and clean lines.',
    badge: 'JAPANDI MINIMALIST',
    features: ['Organic Bamboo & Birch Textures', 'Natural Sunlit Lighting Simulation', 'Minimalist Declutter Optimization', 'Zen Spatial Balance'],
  },
};

export async function generateMetadata({ params }: StylePageProps): Promise<Metadata> {
  const style = STYLE_DETAILS[params.slug] || {
    title: 'AI Room Redesign & Interior Staging | RoomAI',
    subtitle: 'Redesign living rooms, bedrooms, and kitchens in seconds with AI.',
    description: 'RoomAI transforms photos into photorealistic 8K interior renders.',
    badge: 'AI REDESIGN',
    features: [],
  };

  return {
    title: `${style.title} | RoomAI`,
    description: style.description,
    openGraph: {
      title: style.title,
      description: style.description,
    },
  };
}

export default function ProgrammaticStylePage({ params }: StylePageProps) {
  const style = STYLE_DETAILS[params.slug] || {
    title: `${params.slug.replace(/-/g, ' ').toUpperCase()} AI Room Redesign`,
    subtitle: 'Transform your interior space with state-of-the-art 8K AI render engine.',
    description: 'Upload a photo of your room and generate instant 8K interior redesigns.',
    badge: 'AI STYLE STAGING',
    features: ['Instant AI Transformation', '8K UHD Render Quality', 'All Room Types Supported', 'Commercial Staging Ready'],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `RoomAI - ${style.title}`,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1280',
    },
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white p-6 sm:p-10 lg:p-16 space-y-12 font-sans selection:bg-purple-500/30">
      
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-400/20 font-mono backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{style.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-tight">
          {style.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          {style.subtitle}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/generate"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer font-heading"
          >
            <span>Start Redesigning Now ⚡</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {style.features.map((feat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-3 shadow-xl hover:border-amber-400/30 transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold font-heading text-white">{feat}</h3>
          </div>
        ))}
      </div>

      {/* Proof / Rating Banner */}
      <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-[#0D111D] border border-slate-800 text-center flex flex-col sm:flex-row items-center justify-around gap-4 shadow-lg">
        <div className="flex items-center gap-1.5 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400" />
          ))}
          <span className="text-sm font-black font-mono text-white ml-2">4.9 / 5.0</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Over 1,280+ Interior Redesigns Generated This Week</span>
      </div>

    </div>
  );
}
