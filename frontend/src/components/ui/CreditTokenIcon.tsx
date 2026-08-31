'use client';

import React from 'react';

interface CreditTokenIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function CreditTokenIcon({
  className = 'w-4 h-4',
  size,
  animated = false,
}: CreditTokenIconProps) {
  let sizeClass = className;
  if (size === 'xs') sizeClass = 'w-3 h-3';
  if (size === 'sm') sizeClass = 'w-4 h-4';
  if (size === 'md') sizeClass = 'w-5 h-5';
  if (size === 'lg') sizeClass = 'w-7 h-7';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} inline-block shrink-0 ${animated ? 'animate-pulse' : ''}`}
    >
      <defs>
        {/* Outer Glow Gradient */}
        <linearGradient id="tokenOuterGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Inner Spark Gradient */}
        <linearGradient id="tokenInnerGrad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Metallic Bevel Gradient */}
        <linearGradient id="tokenBevel" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7E22CE" stopOpacity="0.2" />
        </linearGradient>

        <filter id="tokenGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Coin Circle with Shadow */}
      <circle cx="16" cy="16" r="14" fill="url(#tokenOuterGrad)" />
      <circle cx="16" cy="16" r="13" stroke="url(#tokenBevel)" strokeWidth="1.5" />

      {/* Inner Energy Core */}
      <circle cx="16" cy="16" r="9.5" fill="#1E1B4B" opacity="0.6" />

      {/* Central 3D Lightning Energy Spark */}
      <path
        d="M17.5 4.5L8.5 16.5H16L14.5 27.5L23.5 15.5H16L17.5 4.5Z"
        fill="url(#tokenInnerGrad)"
        filter="url(#tokenGlow)"
      />
    </svg>
  );
}

export default CreditTokenIcon;
