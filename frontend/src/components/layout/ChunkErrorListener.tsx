'use client';

import { useEffect } from 'react';

export default function ChunkErrorListener() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'reason' in event ? (event as PromiseRejectionEvent).reason : (event as ErrorEvent).error;
      const message = error?.message || String(error) || '';
      
      if (
        error?.name === 'ChunkLoadError' ||
        message.includes('Loading chunk') ||
        message.includes('failed to load')
      ) {
        console.warn('ChunkLoadError detected due to dev server hot reload. Auto-refreshing...');
        // Perform a single page refresh to grab fresh chunks
        if (!window.sessionStorage.getItem('chunk_reloaded')) {
          window.sessionStorage.setItem('chunk_reloaded', 'true');
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  return null;
}
