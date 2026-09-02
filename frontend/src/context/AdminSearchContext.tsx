'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdminSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AdminSearchContext = createContext<AdminSearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export function AdminSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Reset search query when navigating between admin routes
  useEffect(() => {
    setSearchQuery('');
  }, [pathname]);

  return (
    <AdminSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  return useContext(AdminSearchContext);
}
