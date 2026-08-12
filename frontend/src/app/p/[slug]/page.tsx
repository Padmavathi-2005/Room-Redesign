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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
  };
}

export default async function PublicCmsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const page = await fetchCmsPage(resolvedParams.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-slate-900 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* Blueprint background grid */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none opacity-30 z-0" />

      {/* Main Navigation Header */}
      <Header />

      <main className="flex-1 relative z-10 pt-28 pb-20">
        {page.customHtml ? (
          /* Custom Raw HTML Mode Rendering */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div dangerouslySetInnerHTML={{ __html: page.customHtml }} />
          </div>
        ) : (
          /* Component Blocks Renderer */
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {page.blocks && page.blocks.length > 0 ? (
              page.blocks.map((block: any, idx: number) => {
                // 1. HERO BLOCK
                if (block.type === 'hero') {
                  return (
                    <section
                      key={block.id || idx}
                      className="text-center space-y-6 py-12 px-6 sm:px-12 rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                      {block.content?.badge && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{block.content.badge}</span>
                        </div>
                      )}

                      <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
                        {block.content?.title || page.title}
                      </h1>

                      {block.content?.subtitle && (
                        <p className="text-sm sm:text-base text-indigo-200 font-medium max-w-2xl mx-auto leading-relaxed">
                          {block.content.subtitle}
                        </p>
                      )}

                      {block.content?.ctaText && (
                        <div className="pt-2">
                          <Link
                            href={block.content.ctaUrl || '/generate'}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-900 font-black text-xs shadow-lg hover:bg-slate-100 transition-all"
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
                    <section key={block.id || idx} className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                      {block.content?.title && (
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          {block.content.title}
                        </h2>
                      )}
                      <div
                        className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-650 font-normal leading-relaxed space-y-3"
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
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          {block.content.title}
                        </h2>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {block.content?.items?.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs text-left space-y-3 hover:border-indigo-200 transition-all"
                          >
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</p>
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
                      className="p-8 sm:p-10 rounded-3xl bg-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl"
                    >
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-black">{block.content?.headline || 'Ready to Get Started?'}</h3>
                        <p className="text-xs text-indigo-100 font-medium">{block.content?.subhead || 'Transform floor plans and rooms in seconds.'}</p>
                      </div>
                      <Link
                        href={block.content?.buttonUrl || '/generate'}
                        className="px-6 py-3 rounded-2xl bg-white text-indigo-600 font-black text-xs shadow hover:bg-slate-100 transition-all text-center shrink-0"
                      >
                        {block.content?.buttonText || 'Get Started Now'}
                      </Link>
                    </section>
                  );
                }

                // 5. FAQ ACCORDION BLOCK
                if (block.type === 'faq') {
                  return (
                    <section key={block.id || idx} className="space-y-6">
                      {block.content?.title && (
                        <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight">
                          {block.content.title}
                        </h2>
                      )}
                      <div className="space-y-3">
                        {block.content?.items?.map((item: any, i: number) => (
                          <details
                            key={i}
                            className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs font-semibold text-xs text-slate-900 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                          >
                            <summary className="flex items-center justify-between font-extrabold text-slate-900">
                              <span>{item.question}</span>
                              <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <p className="mt-3 text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
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
                    <section key={block.id || idx} className="space-y-2 text-center">
                      <img
                        src={block.content?.imageUrl}
                        alt="Showcase"
                        className="w-full max-h-[500px] object-cover rounded-3xl border border-slate-200 shadow-xl"
                      />
                      {block.content?.caption && (
                        <p className="text-xs text-slate-500 font-semibold">{block.content.caption}</p>
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
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-500">
                <h1 className="text-2xl font-black text-slate-900">{page.title}</h1>
                <p className="text-xs text-slate-500 mt-2 font-medium">This custom page is currently empty.</p>
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
