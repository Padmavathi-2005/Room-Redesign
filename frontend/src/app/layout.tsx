import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { SettingsProvider } from '@/context/SettingsContext';
import ChunkErrorListener from '@/components/layout/ChunkErrorListener';

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
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full antialiased selection:bg-blue-600 selection:text-white relative bg-[#FCFCFD] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
        <SettingsProvider>
          <ChunkErrorListener />
          {/* Faint Blueprint Grid */}
          <div className="fixed inset-0 blueprint-grid pointer-events-none z-0" />

          {/* Fixed Floating White Navbar */}
          <Header />

          {/* Main Page Content */}
          <div className="relative z-10">{children}</div>

          {/* Light/Dark Theme Footer */}
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
