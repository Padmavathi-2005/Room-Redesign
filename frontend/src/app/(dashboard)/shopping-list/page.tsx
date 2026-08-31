'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle,
  Tag,
  DollarSign,
  Download,
  Share2,
} from 'lucide-react';
import CommonPagination from '@/components/ui/CommonPagination';
import { useSettings } from '@/context/SettingsContext';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  roomProject: string;
  status: 'In Wishlist' | 'Purchased' | 'Pending Order';
  url: string;
  image: string;
}

const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Bouclé Curved Accent Sofa',
    category: 'Seating',
    vendor: 'Design Within Reach',
    price: 1850,
    roomProject: 'Biophilic Living Room',
    status: 'In Wishlist',
    url: 'https://example.com',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  },
  {
    id: 'shop-2',
    name: 'Solid Walnut Fluted Coffee Table',
    category: 'Tables',
    vendor: 'West Elm',
    price: 640,
    roomProject: 'Biophilic Living Room',
    status: 'Purchased',
    url: 'https://example.com',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
  },
  {
    id: 'shop-3',
    name: 'Acoustic Wood Slat Wall Panels (Pack of 4)',
    category: 'Building Materials',
    vendor: 'The Home Depot',
    price: 320,
    roomProject: 'Warm Japandi Bedroom',
    status: 'Pending Order',
    url: 'https://example.com',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
  },
  {
    id: 'shop-4',
    name: 'Brushed Brass Arc Floor Lamp',
    category: 'Lighting',
    vendor: 'CB2',
    price: 490,
    roomProject: 'Executive Loft Office',
    status: 'In Wishlist',
    url: 'https://example.com',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  },
];

export default function ShoppingListPage() {
  const { settings } = useSettings();
  const [items, setItems] = useState<ShoppingItem[]>(INITIAL_SHOPPING_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.roomProject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageSize = settings.tablePaginationLimit || 10;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Room Shopping List ({items.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, organize, and purchase furniture, fixtures, and decor sourced directly from your room redesigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span>Total Budget: ${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search items, vendors, or rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
        />
      </div>

      {/* Sleek Admin-Style Data Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Category & Vendor</th>
                <th className="py-3.5 px-4">Est. Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white font-heading line-clamp-1 max-w-[220px]">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                          {item.roomProject}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.vendor}</p>
                      <p className="text-slate-400 font-medium text-[11px]">{item.category}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">
                    ${item.price.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] inline-block ${
                        item.status === 'Purchased'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                          : item.status === 'Pending Order'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.name + ' ' + item.vendor)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all"
                        title={`Search & Buy ${item.name} on ${item.vendor}`}
                      >
                        <span>Buy on {item.vendor}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-2xs cursor-pointer"
                        title="Remove from Shopping List"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CommonPagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
