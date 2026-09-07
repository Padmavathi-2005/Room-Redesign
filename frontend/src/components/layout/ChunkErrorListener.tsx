'use client';

import { useEffect } from 'react';

export default function ChunkErrorListener() {
  useEffect(() => {
    const autoReloadOnChunkError = () => {
      const lastReload = sessionStorage.getItem('chunk_error_reload_ts');
      const now = Date.now();
      // Rate limit reloads to avoid infinite loop if server is completely offline (max once per 10s)
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_error_reload_ts', String(now));
        console.warn('ChunkLoadError detected. Automatically refreshing page for fresh build assets...');
        window.location.reload();
      }
    };

    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent | Event) => {
      // 1. Check script or link element failures (e.g. <script src="/_next/static/chunks/..."> failed)
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'SCRIPT' || target.tagName === 'LINK')
      ) {
        const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || '';
        if (src.includes('/_next/static/chunks/') || src.includes('/_next/static/css/')) {
          autoReloadOnChunkError();
          return;
        }
      }

      // 2. Check error object & rejection messages
      const error = 'reason' in event 
        ? (event as PromiseRejectionEvent).reason 
        : (event as ErrorEvent).error;
      
      const message = (error?.message || (event as ErrorEvent).message || String(error) || '').toLowerCase();
      
      // Target genuine chunk load failures, ignoring images, dev stack traces, or general static 404s
      if (
        error?.name === 'ChunkLoadError' ||
        message.includes('loading chunk') ||
        message.includes('loading css chunk') ||
        message.includes('chunkloaderror') ||
        message.includes('failed to fetch dynamically imported module')
      ) {
        autoReloadOnChunkError();
      }
    };

    // Use capture phase (true) so script load errors are intercepted before overlay crash
    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError, true);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  return null;
}


