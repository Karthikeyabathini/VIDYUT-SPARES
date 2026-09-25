import React from 'react';
import { redirect } from 'next/navigation';
import { getAddresses } from '@/lib/actions/orderActions';
import { getCart } from '@/lib/actions/cartActions';
import { getActivePaymentMethods } from '@/lib/actions/paymentActions';
import { getActiveUser } from '@/lib/actions/authActions';
import CheckoutForm from './CheckoutForm';
import { ShieldCheck, Truck, Lock } from 'lucide-react';

export const revalidate = 0;

export default async function CheckoutPage() {
  const user = await getActiveUser();
  if (!user || (user.role !== 'CUSTOMER' && user.role !== 'ADMIN')) {
    redirect('/login?redirectTo=/checkout');
  }

  const addresses = await getAddresses();
  const { items, subtotal } = await getCart();
  const paymentMethods = await getActivePaymentMethods();

  if (items.length === 0) {
    redirect('/cart');
  }

  const deliveryCharge = subtotal >= 2000 ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Lock className="h-6 w-6 text-amber-500" /> Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete delivery address and select payment method to place your order
        </p>
      </div>

      <CheckoutForm
        addresses={addresses}
        cartItems={items}
        subtotal={subtotal}
        deliveryCharge={deliveryCharge}
        grandTotal={grandTotal}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
