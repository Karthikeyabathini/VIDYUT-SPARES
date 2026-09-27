'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { addToCart } from '@/lib/actions/cartActions';
import { ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';

export default function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;

  const handleQuantityChange = (delta: number) => {
    const nextQty = quantity + delta;
    if (nextQty >= 1 && nextQty <= product.stock_quantity) {
      setQuantity(nextQty);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setLoading(true);
    const res = await addToCart(product.id, quantity);
    setLoading(false);

    if (res.success) {
      setAdded(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      setTimeout(() => setAdded(false), 2500);
    } else {
      alert(res.error || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    setLoading(true);
    const res = await addToCart(product.id, quantity);
    setLoading(false);
    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      router.push('/cart');
    } else {
      alert(res.error || 'Failed to proceed to checkout');
    }
  };

  return (
    <div className="space-y-4 border-t border-slate-100 pt-6">
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Quantity:
          </label>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || loading}
              className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <Minus className="h-4 w-4 text-slate-700" />
            </button>
            <span className="w-12 text-center text-sm font-extrabold text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock_quantity || loading}
              className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <Plus className="h-4 w-4 text-slate-700" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors ${
            added
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#0F2C59] hover:bg-blue-900 text-white'
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="h-4 w-4" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>

        {!isOutOfStock && (
          <button
            onClick={handleBuyNow}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors"
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
