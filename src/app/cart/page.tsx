import React from 'react';
import Link from 'next/link';
import { getCart } from '@/lib/actions/cartActions';
import CartItemRow from './CartItemRow';
import { ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function CartPage() {
  const { items, subtotal } = await getCart();
  const deliveryCharge = subtotal >= 2000 ? 0 : subtotal > 0 ? 50 : 0;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-[#0F2C59]" /> Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected electrical spare parts before proceeding to checkout
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ITEMS LIST */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="hidden sm:grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              <span className="col-span-6">Product Details</span>
              <span className="col-span-2 text-center">Unit Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Subtotal</span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 h-fit">
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-bold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-bold text-emerald-700">
                  {deliveryCharge === 0 ? 'FREE (Orders above ₹2000)' : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-[#0F2C59]">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Stock reserved in database during checkout submission</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Your Shopping Cart is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore our electrical products catalog to add switches, wires, breakers, or lighting to your cart.
          </p>
          <Link
            href="/products"
            className="inline-block text-xs font-bold bg-[#0F2C59] text-white px-6 py-3 rounded-xl shadow-sm hover:bg-blue-900 transition-colors"
          >
            Browse Products Now
          </Link>
        </div>
      )}
    </div>
  );
}
