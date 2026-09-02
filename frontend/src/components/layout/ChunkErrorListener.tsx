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
        message.includes('failed to load') ||
        message.includes('ChunkLoadError')
      ) {
        console.warn('ChunkLoadError detected. Auto-refreshing page for fresh assets...');
        window.location.reload();
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
