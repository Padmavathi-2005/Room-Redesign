import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { Sparkles, CheckCircle2, ArrowRight, HelpCircle, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchCmsPage(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${apiUrl}/cms/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await fetchCmsPage(resolvedParams.slug);

  if (!page) {
    return {
      title: 'Page Not Found - RoomAI',
    };
  }

  return {
    title: `${page.title} - RoomAI`,
    description: page.description || `Official ${page.title} page for RoomAI platform.`,
    openGraph: {
      title: `${page.title} - RoomAI`,
      description: page.description || `Official ${page.title} page for RoomAI platform.`,
      images: page.ogImage ? [{ url: page.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} - RoomAI`,
      description: page.description || `Official ${page.title} page for RoomAI platform.`,
      images: page.ogImage ? [page.ogImage] : [],
    },
  };
}

export default async function PublicCmsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const page = await fetchCmsPage(resolvedParams.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Blueprint background grid */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none opacity-30 dark:opacity-15 z-0" />

      {/* Main Navigation Header */}
      <Header />

      <main className="flex-1 relative z-10 pt-24 pb-20">
        {page.customHtml ? (
          /* Custom Raw HTML Mode Rendering */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div dangerouslySetInnerHTML={{ __html: page.customHtml }} />
          </div>
        ) : (
          /* Component Blocks Renderer */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {page.blocks && page.blocks.length > 0 ? (
              page.blocks.map((block: any, idx: number) => {
                // 1. HERO BLOCK
                if (block.type === 'hero') {
                  return (
                    <section
                      key={block.id || idx}
                      className="text-center space-y-6 py-16 px-6 sm:px-14 rounded-[14px] bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50 dark:border-indigo-700/40"
                    >
                      {/* Ambient background accent glows */}
                      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                      {block.content?.badge && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-black uppercase tracking-widest backdrop-blur-md shadow-inner">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                          <span>{block.content.badge}</span>
                        </div>
                      )}

                      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
                        {block.content?.title || page.title}
                      </h1>

                      {block.content?.subtitle && (
                        <p className="text-sm sm:text-base lg:text-lg text-indigo-200/90 font-medium max-w-3xl mx-auto leading-relaxed">
                          {block.content.subtitle}
                        </p>
                      )}

                      {block.content?.ctaText && (
                        <div className="pt-3">
                          <Link
                            href={block.content.ctaUrl || '/generate'}
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          >
                            <span>{block.content.ctaText}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </section>
                  );
                }

                // 2. RICH TEXT BLOCK
                if (block.type === 'text') {
                  return (
                    <section key={block.id || idx} className="bg-white dark:bg-slate-900/80 p-8 sm:p-12 rounded-[14px] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
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
                  );
                }

                // 3. FEATURES GRID BLOCK
                if (block.type === 'features') {
                  return (
                    <section key={block.id || idx} className="space-y-8 text-center">
                      {block.content?.title && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
                            Key Features & Capabilities
                          </span>
                          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {block.content.title}
                          </h2>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {block.content?.items?.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="p-7 rounded-[14px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-left space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group"
                          >
                            <div className="w-11 h-11 rounded-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">{item.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                // 4. CALL TO ACTION BANNER BLOCK
                if (block.type === 'cta') {
                  return (
                    <section
                      key={block.id || idx}
                      className="p-8 sm:p-12 rounded-[16px] bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl border border-indigo-700/40 hover:border-indigo-500/60 transition-all duration-500 relative overflow-hidden group/cta"
                    >
                      <div className="space-y-2 relative z-10">
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">{block.content?.headline || 'Ready to Get Started?'}</h3>
                        <p className="text-xs sm:text-sm text-indigo-200/90 font-medium max-w-xl leading-relaxed">{block.content?.subhead || 'Transform floor plans and rooms in seconds.'}</p>
                      </div>
                      <Link
                        href={block.content?.buttonUrl || '/generate'}
                        className="cta-banner-primary-btn px-8 py-4 rounded-[10px] text-xs uppercase tracking-wider shrink-0 cursor-pointer relative z-10 group"
                      >
                        <span>{block.content?.buttonText || 'Get Started Now'}</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </section>
                  );
                }

                // 5. FAQ ACCORDION BLOCK
                if (block.type === 'faq') {
                  return (
                    <section key={block.id || idx} className="space-y-6">
                      {block.content?.title && (
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white text-center tracking-tight">
                          {block.content.title}
                        </h2>
                      )}
                      <div className="space-y-3.5 max-w-4xl mx-auto">
                        {block.content?.items?.map((item: any, i: number) => (
                          <details
                            key={i}
                            className="group p-5 sm:p-6 rounded-[14px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs font-semibold text-xs text-slate-900 dark:text-white [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all"
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
                  );
                }

                // 6. IMAGE SHOWCASE BLOCK
                if (block.type === 'image') {
                  return (
                    <section key={block.id || idx} className="space-y-3 text-center">
                      <div className="overflow-hidden rounded-[14px] border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-slate-950">
                        <img
                          src={block.content?.imageUrl}
                          alt={block.content?.caption || 'RoomAI Showcase'}
                          className="w-full max-h-[580px] object-cover hover:scale-[1.01] transition-transform duration-500"
                        />
                      </div>
                      {block.content?.caption && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{block.content.caption}</span>
                        </div>
                      )}
                    </section>
                  );
                }

                // 7. INLINE HTML CODE BLOCK
                if (block.type === 'html') {
                  return (
                    <section key={block.id || idx}>
                      <div dangerouslySetInnerHTML={{ __html: block.content?.rawHtml || '' }} />
                    </section>
                  );
                }

                return null;
              })
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{page.title}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">This custom page is currently empty.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Main Platform Footer */}
      <Footer />
    </div>
  );
}
