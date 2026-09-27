'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartItem } from '@/types';
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cartActions';
import { Plus, Minus, Trash2, Zap } from 'lucide-react';

export default function CartItemRow({ item }: { item: CartItem }) {
  const [loading, setLoading] = useState(false);

  const product = item.product;
  if (!product) return null;

  const handleUpdate = async (newQty: number) => {
    setLoading(true);
    const res = await updateCartQuantity(item.id, newQty);
    setLoading(false);
    if (!res.success) {
      alert(res.error || 'Could not update quantity');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    const res = await removeFromCart(item.id);
    setLoading(false);
    if (res.success && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const itemSubtotal = product.price * item.quantity;

  return (
    <div className="py-4 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
      {/* PRODUCT DETAILS */}
      <div className="sm:col-span-6 flex items-center gap-3 w-full">
        <div className="relative w-16 h-16 bg-slate-100 rounded-lg p-2 border border-slate-200 shrink-0 flex items-center justify-center">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-contain" />
          ) : (
            <Zap className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#0F2C59] line-clamp-2"
          >
            {product.name}
          </Link>
          <p className="text-[11px] text-slate-500 font-mono">SKU: {product.sku}</p>
        </div>
      </div>

      {/* UNIT PRICE */}
      <div className="sm:col-span-2 text-center text-xs font-semibold text-slate-700">
        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>

      {/* QUANTITY CONTROLS */}
      <div className="sm:col-span-2 flex items-center justify-center gap-1">
        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
          <button
            onClick={() => handleUpdate(item.quantity - 1)}
            disabled={loading || item.quantity <= 1}
            className="p-1 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-900">
            {item.quantity}
          </span>
          <button
            onClick={() => handleUpdate(item.quantity + 1)}
            disabled={loading || item.quantity >= product.stock_quantity}
            className="p-1 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors ml-1"
          title="Remove Item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ITEM SUBTOTAL */}
      <div className="sm:col-span-2 text-right font-extrabold text-xs sm:text-sm text-[#0F2C59]">
        ₹{itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}
