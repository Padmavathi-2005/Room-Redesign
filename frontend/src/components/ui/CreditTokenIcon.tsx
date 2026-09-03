'use client';

import React from 'react';

interface CreditTokenIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function CreditTokenIcon({
  className = '',
  size = 'sm',
  animated = false,
}: CreditTokenIconProps) {
  let sizeClass = 'w-4.5 h-4.5';
  let pxSize = 18;

  if (size === 'xs') {
    sizeClass = 'w-3.5 h-3.5';
    pxSize = 14;
  } else if (size === 'sm') {
    sizeClass = 'w-4.5 h-4.5';
    pxSize = 18;
  } else if (size === 'md') {
    sizeClass = 'w-5.5 h-5.5';
    pxSize = 22;
  } else if (size === 'lg') {
    sizeClass = 'w-7 h-7';
    pxSize = 28;
  }

  const finalClass = className ? `${sizeClass} ${className}` : sizeClass;

  return (
    <svg
      width={pxSize}
      height={pxSize}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${finalClass} inline-block shrink-0 align-middle ${animated ? 'animate-pulse' : ''}`}
    >
      <defs>
        {/* Bright Vibrant Gold Metallic Gradient */}
        <linearGradient id="goldBrightGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="20%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="80%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>

        {/* Rich Dark Golden Shadow Gradient */}
        <linearGradient id="goldDarkGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="40%" stopColor="#FF8F00" />
          <stop offset="80%" stopColor="#C07D02" />
          <stop offset="100%" stopColor="#7F5200" />
        </linearGradient>

        {/* 3D Highlight Bevel Gradient */}
        <linearGradient id="goldBevel" x1="100" y1="80" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#FFF176" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7F5200" stopOpacity="0.4" />
        </linearGradient>

        {/* Outer Glow Filter */}
        <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#FFB300" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Dark Gold Stroke Layer for High-Contrast Outline */}
      <path
        d="M264.4 95.01c-35.6-.06-80.2 11.19-124.2 34.09C96.27 152 61.45 182 41.01 211.3c-20.45 29.2-25.98 56.4-15.92 75.8c10.07 19.3 35.53 30.4 71.22 30.4c35.69.1 80.29-11.2 124.19-34c44-22.9 78.8-53 99.2-82.2c20.5-29.2 25.9-56.4 15.9-75.8c-10.1-19.3-35.5-30.49-71.2-30.49m91.9 70.29c-3.5 15.3-11.1 31-21.8 46.3c-22.6 32.3-59.5 63.8-105.7 87.8c-46.2 24.1-93.1 36.2-132.5 36.2c-18.6 0-35.84-2.8-50.37-8.7l10.59 20.4c10.08 19.4 35.47 30.5 71.18 30.5c35.7 0 80.3-11.2 124.2-34.1c44-22.8 78.8-52.9 99.2-82.2c20.4-29.2 26-56.4 15.9-75.7zm28.8 16.8c11.2 26.7 2.2 59.2-19.2 89.7c-18.9 27.1-47.8 53.4-83.6 75.4c11.1 1.2 22.7 1.8 34.5 1.8c49.5 0 94.3-10.6 125.9-27.1c31.7-16.5 49.1-38.1 49.1-59.9s-17.4-43.4-49.1-59.9c-16.1-8.4-35.7-15.3-57.6-20m106.7 124.8c-10.2 11.9-24.2 22.4-40.7 31c-35 18.2-82.2 29.1-134.3 29.1c-21.2 0-41.6-1.8-60.7-5.2c-23.2 11.7-46.5 20.4-68.9 26.1c1.2.7 2.4 1.3 3.7 2c31.6 16.5 76.4 27.1 125.9 27.1s94.3-10.6 125.9-27.1c31.7-16.5 49.1-38.1 49.1-59.9z"
        fill="url(#goldDarkGrad)"
        stroke="#5D3A00"
        strokeWidth="12"
        strokeLinejoin="round"
        filter="url(#goldGlow)"
      />

      {/* Main Bright Metallic Golden Fill Layer */}
      <path
        d="M264.4 95.01c-35.6-.06-80.2 11.19-124.2 34.09C96.27 152 61.45 182 41.01 211.3c-20.45 29.2-25.98 56.4-15.92 75.8c10.07 19.3 35.53 30.4 71.22 30.4c35.69.1 80.29-11.2 124.19-34c44-22.9 78.8-53 99.2-82.2c20.5-29.2 25.9-56.4 15.9-75.8c-10.1-19.3-35.5-30.49-71.2-30.49m91.9 70.29c-3.5 15.3-11.1 31-21.8 46.3c-22.6 32.3-59.5 63.8-105.7 87.8c-46.2 24.1-93.1 36.2-132.5 36.2c-18.6 0-35.84-2.8-50.37-8.7l10.59 20.4c10.08 19.4 35.47 30.5 71.18 30.5c35.7 0 80.3-11.2 124.2-34.1c44-22.8 78.8-52.9 99.2-82.2c20.4-29.2 26-56.4 15.9-75.7zm28.8 16.8c11.2 26.7 2.2 59.2-19.2 89.7c-18.9 27.1-47.8 53.4-83.6 75.4c11.1 1.2 22.7 1.8 34.5 1.8c49.5 0 94.3-10.6 125.9-27.1c31.7-16.5 49.1-38.1 49.1-59.9s-17.4-43.4-49.1-59.9c-16.1-8.4-35.7-15.3-57.6-20m106.7 124.8c-10.2 11.9-24.2 22.4-40.7 31c-35 18.2-82.2 29.1-134.3 29.1c-21.2 0-41.6-1.8-60.7-5.2c-23.2 11.7-46.5 20.4-68.9 26.1c1.2.7 2.4 1.3 3.7 2c31.6 16.5 76.4 27.1 125.9 27.1s94.3-10.6 125.9-27.1c31.7-16.5 49.1-38.1 49.1-59.9z"
        fill="url(#goldBrightGrad)"
      />

      {/* Top 3D Bevel Lighting Highlight Layer */}
      <path
        d="M264.4 95.01c-35.6-.06-80.2 11.19-124.2 34.09C96.27 152 61.45 182 41.01 211.3c-20.45 29.2-25.98 56.4-15.92 75.8c10.07 19.3 35.53 30.4 71.22 30.4c35.69.1 80.29-11.2 124.19-34c44-22.9 78.8-53 99.2-82.2c20.5-29.2 25.9-56.4 15.9-75.8c-10.1-19.3-35.5-30.49-71.2-30.49"
        stroke="url(#goldBevel)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default CreditTokenIcon;
