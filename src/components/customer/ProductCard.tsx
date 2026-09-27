'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { addToCart } from '@/lib/actions/cartActions';
import { ShoppingCart, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock_quantity <= 0) return;

    setLoading(true);
    const res = await addToCart(product.id, 1);
    setLoading(false);

    if (res.success) {
      setAddedMessage(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      setTimeout(() => setAddedMessage(false), 2000);
    } else {
      if (res.error?.toLowerCase().includes('login') || res.error?.toLowerCase().includes('auth')) {
        router.push(`/login?redirectTo=/products`);
        return;
      }
      alert(res.error || 'Could not add to cart');
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-700 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <Link href={`/products/${product.slug}`} className="block relative">
        {/* IMAGE CONTAINER */}
        <div className="relative w-full h-48 bg-slate-100 p-4 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Zap className="h-10 w-10 mb-1 text-slate-300" />
              <span className="text-[10px] uppercase font-bold tracking-wider">VIDYUT SPARES</span>
            </div>
          )}

          {/* STOCK STATUS BADGE */}
          <div className="absolute top-2 left-2 z-10">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200">
                <XCircle className="h-3 w-3" /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                <AlertTriangle className="h-3 w-3" /> Only {product.stock_quantity} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle className="h-3 w-3" /> In Stock
              </span>
            )}
          </div>
        </div>

        {/* DETAILS CONTAINER */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span className="text-amber-700 font-bold uppercase">{product.brand}</span>
            <span className="font-mono text-slate-400">{product.sku}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0F2C59] line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

          <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium">Price: </span>
              <span className="text-lg font-extrabold text-[#0F2C59]">
                ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ACTIONS */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
            addedMessage
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#0F2C59] hover:bg-blue-900 text-white shadow-sm'
          }`}
        >
          {addedMessage ? (
            <>
              <CheckCircle className="h-4 w-4" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
