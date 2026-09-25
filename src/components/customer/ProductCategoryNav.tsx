'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import { LayoutGrid } from 'lucide-react';

interface ProductCategoryNavProps {
  categories: Category[];
  activeCategorySlug?: string;
}

export default function ProductCategoryNav({ categories, activeCategorySlug }: ProductCategoryNavProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy');

  const buildCategoryUrl = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) {
      params.set('category', slug);
    }
    if (search) {
      params.set('search', search);
    }
    if (sortBy && sortBy !== 'newest') {
      params.set('sortBy', sortBy);
    }
    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
  };

  const isAllActive = !activeCategorySlug || activeCategorySlug === 'all';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <LayoutGrid className="h-4 w-4 text-[#0F2C59]" />
        <h2 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
          Categories
        </h2>
      </div>

      {/* HORIZONTAL CATEGORIES BAR (SCROLLABLE ON MOBILE, WRAPS ON DESKTOP) */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
        {/* ALL CATEGORIES BUTTON */}
        <Link
          href={buildCategoryUrl()}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
            isAllActive
              ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm ring-1 ring-[#0F2C59]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          All Categories
        </Link>

        {/* DYNAMIC CATEGORIES FROM DATABASE */}
        {categories.map((cat) => {
          const isActive = activeCategorySlug === cat.slug;
          return (
            <Link
              key={cat.id}
              href={buildCategoryUrl(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm ring-1 ring-[#0F2C59]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
