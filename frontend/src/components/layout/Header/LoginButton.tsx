'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginButton() {
  return (
    <Link
      href="/login"
      className="relative text-sm font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2 py-1 group"
    >
      <span>Sign In</span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#2563EB] rounded-full transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
