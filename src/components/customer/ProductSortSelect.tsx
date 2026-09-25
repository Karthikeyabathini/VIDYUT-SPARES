'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export default function ProductSortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <label htmlFor="product-sort-select" className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
        <ArrowUpDown className="h-3.5 w-3.5 text-[#0F2C59]" /> Sort By:
      </label>
      <select
        id="product-sort-select"
        value={currentSort}
        onChange={handleSortChange}
        className="bg-white border border-slate-200 text-slate-900 font-bold px-3 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59] cursor-pointer text-xs"
      >
        <option value="newest">Newest Arrivals</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name A - Z</option>
      </select>
    </div>
  );
}
