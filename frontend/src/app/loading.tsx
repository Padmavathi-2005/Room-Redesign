import React from 'react';
import PremiumAppLoader from '@/components/ui/PremiumAppLoader';

/**
 * Global App Suspense & Loading State Placeholder
 */
export default function GlobalLoading() {
  return <PremiumAppLoader size="lg" fullScreen label="Loading RoomAI..." />;
}
