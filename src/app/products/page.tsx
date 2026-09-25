import React, { Suspense } from 'react';
import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/actions/productActions';
import ProductCard from '@/components/customer/ProductCard';
import ProductCategoryNav from '@/components/customer/ProductCategoryNav';
import ProductSortSelect from '@/components/customer/ProductSortSelect';
import { Search, RefreshCw, Zap } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
    inStock?: string;
  }>;
}

export const revalidate = 0; // Dynamic on request

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  const products = await getProducts({
    search: params.search,
    categorySlug: params.category,
    sortBy: params.sortBy || 'newest',
    inStockOnly: params.inStock === 'true',
  });

  const activeCategory = categories.find((c) => c.slug === params.category);
  const currentSort = params.sortBy || 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500 fill-amber-500" /> Electrical Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse genuine electrical spares, switches, cables, circuit breakers, and tools from top manufacturers
          </p>
        </div>
      </div>

      {/* DYNAMIC TOP CATEGORIES NAVIGATION BAR */}
      <Suspense fallback={<div className="h-20 bg-slate-100 animate-pulse rounded-2xl" />}>
        <ProductCategoryNav
          categories={categories}
          activeCategorySlug={params.category}
        />
      </Suspense>

      {/* RESULT INFO AND COMPACT SORT CONTROL BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>
            {activeCategory
              ? `Showing ${products.length} product${products.length === 1 ? '' : 's'} in ${activeCategory.name}`
              : `Showing ${products.length} product${products.length === 1 ? '' : 's'}`}
          </span>
          {params.search && (
            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              matching &quot;{params.search}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {(params.search || params.category || (params.sortBy && params.sortBy !== 'newest')) && (
            <Link
              href="/products"
              className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="h-3 w-3" /> Reset Filters
            </Link>
          )}

          <Suspense fallback={<div className="h-8 w-32 bg-slate-100 rounded-xl" />}>
            <ProductSortSelect currentSort={currentSort} />
          </Suspense>
        </div>
      </div>

      {/* FULL-WIDTH RESPONSIVE PRODUCT GRID */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No products found in this category.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try another category or select All Categories.
          </p>
          <Link
            href="/products"
            className="inline-block text-xs font-bold bg-[#0F2C59] text-white px-6 py-3 rounded-xl shadow-sm hover:bg-blue-900 transition-colors"
          >
            Select All Categories
          </Link>
        </div>
      )}
    </div>
  );
}
