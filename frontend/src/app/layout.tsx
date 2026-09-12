import type { Metadata } from 'next';
import './globals.css';
import './dark-theme.css';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { SettingsProvider } from '@/context/SettingsContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import ChunkErrorListener from '@/components/layout/ChunkErrorListener';
import ScrollToTop from '@/components/layout/ScrollToTop';

export const metadata: Metadata = {
  title: 'RoomAI - Digital Craftsmanship & Construction ERP',
  description: 'The only digital craftsmanship platform designed to unite your field and office.',
  keywords: ['Construction ERP', 'digital craftsmanship', 'project management', 'labour attendance', 'material tracking'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-x-clip max-w-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full antialiased selection:bg-primary selection:text-white relative bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 overflow-x-clip max-w-full" suppressHydrationWarning>
        <SettingsProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <ToastProvider>
                <ChunkErrorListener />
                <ScrollToTop />
                {/* Faint Blueprint Grid */}
                <div className="fixed inset-0 blueprint-grid pointer-events-none z-0" />

                {/* Fixed Floating White Navbar */}
                <Header />

                {/* Main Page Content */}
                <div className="relative w-full max-w-full min-w-0 overflow-x-clip">{children}</div>

                {/* Light/Dark Theme Footer */}
                <Footer />
              </ToastProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
