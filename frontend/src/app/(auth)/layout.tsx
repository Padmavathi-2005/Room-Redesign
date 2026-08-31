import React from 'react';

/**
 * Auth Layout Wrapper
 * Applies mesh-bg exclusively to login, signup, and auth pages without affecting the landing page.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full mesh-bg overflow-hidden flex items-start justify-center pt-24 lg:pt-28 pb-12 selection:bg-indigo-500 selection:text-white">
      {/* Subtle Noise Texture Overlay */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />

      {/* Floating Ambient Glowing Orbs */}
      <div className="fixed top-10 left-10 w-[30rem] h-[30rem] bg-indigo-400/05 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-float-slow z-0" />
      <div className="fixed bottom-10 right-10 w-[32rem] h-[32rem] bg-purple-400/05 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-float-delayed z-0" />

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
