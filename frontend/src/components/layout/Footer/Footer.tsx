'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Send, Mail, Phone, MapPin, Twitter, Linkedin, Github, MessageSquare } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [isModalActive, setIsModalActive] = useState(false);

  // Observe modal status on body & DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkModalState = () => {
      const modalOpen = Boolean(
        document.body.getAttribute('data-modal-open') === 'true' ||
        document.documentElement.getAttribute('data-modal-open') === 'true' ||
        document.body.classList.contains('modal-open') ||
        document.querySelector('[data-modal-open="true"]')
      );
      setIsModalActive(modalOpen);
    };

    checkModalState();

    const interval = setInterval(checkModalState, 100);
    window.addEventListener('click', checkModalState, { capture: true });
    window.addEventListener('keydown', checkModalState, { capture: true });

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', checkModalState);
      window.removeEventListener('keydown', checkModalState);
      observer.disconnect();
    };
  }, []);

  // Hide global footer on Auth and Admin pages or when Modal is open
  if (
    isModalActive ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0B0F17] border-t border-slate-700/80 text-slate-200 selection:bg-blue-600 selection:text-white pt-16 pb-12 relative z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Main 4-Column Spaced Out Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-slate-700/80">

          {/* Col 1: Brand Info (4 cols wide) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 inline-flex">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20 border border-white/20">
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white font-heading">
                Room<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-normal">
              The premier AI Construction Management & Digital Craftsmanship platform. Uniting field teams, engineers, and office logistics on one intelligent interface.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@roomai.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+1 (800) 555-ROOM</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>San Francisco, CA & Mumbai, India</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 text-slate-200 hover:text-white hover:bg-blue-600 border border-slate-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 text-slate-200 hover:text-white hover:bg-blue-600 border border-slate-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 text-slate-200 hover:text-white hover:bg-blue-600 border border-slate-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 text-slate-200 hover:text-white hover:bg-blue-600 border border-slate-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: ERP Modules (3 cols wide) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">ERP Modules</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#features" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Site Progress Tracking</Link></li>
              <li><Link href="/#solutions" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Labour & Attendance</Link></li>
              <li><Link href="/#modules" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Budget & Invoice Management</Link></li>
              <li><Link href="/#modules" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Material Stock Control</Link></li>
              <li><Link href="/#modules" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Engineer Dispatch</Link></li>
            </ul>
          </div>

          {/* Col 3: Company (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">About Us</Link></li>
              <li><Link href="/pricing" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Pricing & Plans</Link></li>
              <li><Link href="/blog" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">AI Architecture Blog</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Contact Sales</Link></li>
              <li><Link href="/careers" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">Careers</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter (3 cols wide) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">Stay Updated</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe to get the latest AI construction and interior design tools delivered straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 text-xs bg-slate-900 border-2 border-slate-600 rounded-2xl focus:outline-none focus:border-blue-500 text-white placeholder-slate-400 shadow-sm"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all flex items-center justify-center shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-medium">
          <p>© 2026 RoomAI Inc. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
