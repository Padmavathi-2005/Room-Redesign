'use client';

import React, { useState, useEffect } from 'react';
import LeftHeroSection from '@/components/auth/LeftHeroSection';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 45;
      const moveY = (clientY - window.innerHeight / 2) / 45;
      setMousePos({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2">
      <div
        className="w-full transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
      >
        <LeftHeroSection />
      </div>

      <div
        className="w-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{ transform: `translate(${-mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px)` }}
      >
        <SignupForm />
      </div>
    </div>
  );
}
