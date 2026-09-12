import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Globe2,
  Users,
  Compass,
  Cpu,
  Palette,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - RoomAI | Redefining Architectural Visualization',
  description:
    'Discover RoomAI, the leading AI architectural rendering and interior redesign platform empowering interior designers, architects, real estate agents, and homeowners with instant generative AI renders.',
  openGraph: {
    title: 'About Us - RoomAI',
    description:
      'Discover RoomAI, the leading AI architectural rendering and interior redesign platform.',
  },
};

async function fetchAboutCmsPage() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${apiUrl}/cms/slug/about`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    return null;
  }
}

export default async function AboutPage() {
  const cmsPage = await fetchAboutCmsPage();

  // Find blocks if seeded in CMS
  const heroBlock = cmsPage?.blocks?.find((b: any) => b.type === 'hero');
  const imageBlock = cmsPage?.blocks?.find((b: any) => b.type === 'image');
  const featuresBlock = cmsPage?.blocks?.find((b: any) => b.type === 'features');
  const ctaBlock = cmsPage?.blocks?.find((b: any) => b.type === 'cta');
  const textBlocks = cmsPage?.blocks?.filter((b: any) => b.type === 'text') || [];
  const faqBlock = cmsPage?.blocks?.find((b: any) => b.type === 'faq');

  const stats = [
    { value: '2.4M+', label: 'Renders Generated', sub: 'Across 140+ countries worldwide' },
    { value: '< 1.4s', label: 'Average Generation Speed', sub: 'Sub-second GPU acceleration' },
    { value: '18+', label: 'Specialized AI Models', sub: 'From Japandi to Modern Minimalist' },
    { value: '99.4%', label: 'Designer Approval Rate', sub: 'Trusted by top architectural firms' },
  ];

  const coreValues = [
    {
      icon: Zap,
      title: 'Sub-Second AI Renders',
      description:
        'Transform raw floor plans, CAD drawings, and room photos into high-definition photorealistic 8K renders in less than 2 seconds.',
      tag: 'Speed',
    },
    {
      icon: Cpu,
      title: '18 Specialized AI Models',
      description:
        'Custom fine-tuned architectures tailored for interior decorating, exterior facades, sketch-to-render, landscape, and color visualization.',
      tag: 'Intelligence',
    },
    {
      icon: Shield,
      title: 'Commercial Licensing',
      description:
        'Full commercial copyright ownership rights to every render generated, ready for client pitches, MLS listings, and marketing campaigns.',
      tag: 'Ownership',
    },
    {
      icon: Palette,
      title: 'Photorealistic Material Fidelity',
      description:
        'Accurate lighting propagation, realistic wood grains, marble reflections, and textile textures that reflect true architectural quality.',
      tag: 'Fidelity',
    },
    {
      icon: Globe2,
      title: 'Real Estate Virtual Staging',
      description:
        'Virtually furnish vacant homes and perform day-to-dusk exterior twilight conversions that help properties sell up to 50% faster.',
      tag: 'Staging',
    },
    {
      icon: Users,
      title: 'Built for Teams & Pro Studios',
      description:
        'Collaborative team workspaces, shared design palettes, instant client sharing links, and enterprise REST/WebSocket APIs.',
      tag: 'Collaboration',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Blueprint background grid */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none opacity-30 dark:opacity-15 z-0" />

      {/* Main Global Header */}
      <Header />

      <main className="flex-1 relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* 1. HERO SECTION */}
          <section className="text-center space-y-6 py-16 sm:py-24 px-6 sm:px-14 rounded-[16px] bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 text-white shadow-2xl relative overflow-hidden border border-indigo-900/50 dark:border-indigo-700/40 hover:border-indigo-500/50 transition-all duration-500 group/hero">
            {/* Ambient background glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover/hero:bg-indigo-500/30 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none group-hover/hero:bg-purple-500/30 transition-all duration-700" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 hover:border-white/40 hover:bg-white/15 text-white text-[11px] font-black uppercase tracking-widest backdrop-blur-md shadow-inner transition-all hover:scale-105 cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>{heroBlock?.content?.badge || 'OUR MISSION & VISION'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
              {heroBlock?.content?.title || 'Redefining Architectural Visualization'}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-indigo-200/90 font-medium max-w-3xl mx-auto leading-relaxed">
              {heroBlock?.content?.subtitle ||
                'RoomAI empowers interior designers, architects, real estate professionals, and homeowners with instant generative AI renders. Turn simple sketches and photos into breathtaking, photorealistic living spaces in seconds.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={heroBlock?.content?.ctaUrl || '/generate'}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.7)] transition-all hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30 group"
              >
                <span>{heroBlock?.content?.ctaText || 'Explore AI Studio'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/for-real-estate"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/25 hover:border-white/60 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
              >
                <span>Virtual Staging</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            </div>
          </section>

          {/* 2. LIVE METRICS & STATS BAR */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-[14px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center space-y-1.5 hover:border-indigo-400 dark:hover:border-indigo-400/80 hover:shadow-[0_12px_30px_rgba(99,102,241,0.2)] hover:-translate-y-1.5 transition-all duration-300 group cursor-default"
              >
                <div className="text-2xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-300">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {s.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {s.sub}
                </div>
              </div>
            ))}
          </section>

          {/* 3. SHOWCASE IMAGE SECTION */}
          <section className="space-y-4 text-center">
            <div className="overflow-hidden rounded-[16px] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-400/60 shadow-2xl hover:shadow-[0_0_40px_rgba(99,102,241,0.25)] transition-all duration-500 bg-slate-950 relative group">
              <img
                src={
                  imageBlock?.content?.imageUrl ||
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85'
                }
                alt={imageBlock?.content?.caption || 'Photorealistic Architectural AI Render'}
                className="w-full max-h-[620px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-cyan-200 text-[10px] font-black uppercase tracking-wider backdrop-blur-md mb-2">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    Ultra-High Definition AI Generation
                  </span>
                  <h3 className="text-white font-black text-base sm:text-lg">
                    Japandi Living Room Architectural Redesign
                  </h3>
                </div>
                <div className="text-xs text-indigo-200/80 font-mono bg-black/40 px-3.5 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                  Render Latency: 1.2s • Model: Japandi-v4-Pro
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-650 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {imageBlock?.content?.caption ||
                  'Photorealistic AI Render Generated in 1.4 seconds with RoomAI Japandi Model'}
              </span>
            </div>
          </section>

          {/* 4. WHY DESIGNERS CHOOSE ROOMAI - FEATURE GRID */}
          <section className="space-y-10 text-center">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/60">
                Architectural Innovation
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {featuresBlock?.content?.title || 'Why Designers & Architects Choose RoomAI'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                Engineered specifically for architectural precision, spatial awareness, and realistic lighting rather than generic image generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuresBlock?.content?.items && featuresBlock.content.items.length > 0
                ? featuresBlock.content.items
                : coreValues
              ).map((item: any, i: number) => {
                const IconComponent = coreValues[i % coreValues.length].icon;
                return (
                  <div
                    key={i}
                    className="p-8 rounded-[14px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-left space-y-4 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-[0_16px_40px_rgba(99,102,241,0.22)] hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Ambient card accent glow on hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/0 group-hover:bg-indigo-500/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-12 h-12 rounded-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xs">
                        <IconComponent className="w-6 h-6 transition-transform group-hover:scale-105" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 uppercase tracking-wider transition-colors">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. DYNAMIC CMS TEXT BLOCKS (IF SEEDED) */}
          {textBlocks.length > 0 && (
            <div className="space-y-8">
              {textBlocks.map((block: any, idx: number) => (
                <section
                  key={block.id || idx}
                  className="bg-white dark:bg-slate-900/80 p-8 sm:p-12 rounded-[14px] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 shadow-2xs space-y-4"
                >
                  {block.content?.title && (
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                      <span className="w-1.5 h-6 rounded-full bg-indigo-600 inline-block" />
                      <span>{block.content.title}</span>
                    </h2>
                  )}
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-650 dark:text-slate-300 font-normal leading-relaxed space-y-3"
                    dangerouslySetInnerHTML={{ __html: block.content?.body || '' }}
                  />
                </section>
              ))}
            </div>
          )}

          {/* 6. FAQ ACCORDION SECTION (IF PRESENT) */}
          {faqBlock && faqBlock.content?.items?.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white text-center tracking-tight">
                {faqBlock.content?.title || 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-3.5 max-w-4xl mx-auto">
                {faqBlock.content.items.map((item: any, i: number) => (
                  <details
                    key={i}
                    className="group p-5 sm:p-6 rounded-[14px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs font-semibold text-xs text-slate-900 dark:text-white [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-md transition-all"
                  >
                    <summary className="flex items-center justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                      <span>{item.question}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                    </summary>
                    <p className="mt-4 text-xs sm:text-sm text-slate-650 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* 7. CALL TO ACTION BANNER */}
          <section className="p-8 sm:py-14 sm:px-12 rounded-[16px] bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-8 shadow-2xl border border-indigo-800/50 dark:border-indigo-700/40 hover:border-indigo-500/60 transition-all duration-500 relative overflow-hidden group/cta">
            {/* Ambient glows */}
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover/cta:bg-indigo-500/35 transition-all duration-700" />
            <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none group-hover/cta:bg-purple-500/35 transition-all duration-700" />

            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-200 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                START YOUR FREE TRIAL
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {ctaBlock?.content?.headline || 'Experience Next-Gen Architectural Rendering'}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium max-w-xl leading-relaxed">
                {ctaBlock?.content?.subhead ||
                  'Join thousands of professional interior designers and architects already creating stunning spaces with RoomAI.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10 w-full sm:w-auto">
              <Link
                href={ctaBlock?.content?.buttonUrl || '/generate'}
                className="cta-banner-primary-btn w-full sm:w-auto px-8 py-4 rounded-[10px] text-xs uppercase tracking-wider group cursor-pointer"
              >
                <span>{ctaBlock?.content?.buttonText || 'Start Free Trial'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="cta-banner-secondary-btn w-full sm:w-auto px-7 py-4 rounded-[10px] text-xs uppercase tracking-wider group cursor-pointer"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-4 h-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Main Global Footer */}
      <Footer />
    </div>
  );
}
