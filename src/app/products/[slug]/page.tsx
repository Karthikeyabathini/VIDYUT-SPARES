import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/productActions';
import ProductDetailActions from './ProductDetailActions';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/products" className="hover:text-[#0F2C59] flex items-center gap-1 font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* PRODUCT IMAGE */}
        <div className="lg:col-span-5 bg-slate-50 rounded-xl p-8 border border-slate-200 flex items-center justify-center min-h-[350px] relative">
          {product.image_url ? (
            <div className="relative w-full h-80">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 py-12">
              <Zap className="h-16 w-16 mb-2 text-slate-300" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                VIDYUT SPARES
              </span>
            </div>
          )}
        </div>

        {/* DETAILS & ACTIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                {product.brand}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* STOCK STATUS */}
            <div className="pt-1">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-md border border-red-200">
                  <XCircle className="h-4 w-4" /> Out of Stock (Currently Unavailable)
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-md border border-amber-200">
                  <AlertTriangle className="h-4 w-4" /> Limited Availability: Only {product.stock_quantity} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-md border border-emerald-200">
                  <CheckCircle className="h-4 w-4" /> In Stock ({product.stock_quantity} units available)
                </span>
              )}
            </div>
          </div>

          {/* PRICE DISPLAY */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-baseline gap-3">
            <span className="text-sm font-semibold text-slate-500">Unit Price:</span>
            <span className="text-3xl font-extrabold text-[#0F2C59]">
              ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">Inclusive of all local taxes</span>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-slate-900 text-sm">Product Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || 'Heavy-duty electrical spare part certified for safety and high conductivity. Manufactured according to industrial standards.'}
            </p>
          </div>

          {/* QUANTITY & ADD TO CART CLIENT COMPONENT */}
          <ProductDetailActions product={product} />

          {/* TRUST BADGES */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Official Warranty & Genuine Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#0F2C59]" />
              <span>Fast Shipping from Vijayawada Hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
