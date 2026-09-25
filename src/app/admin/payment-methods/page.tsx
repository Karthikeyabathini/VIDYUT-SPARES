import React from 'react';
import { getAllPaymentMethods } from '@/lib/actions/adminActions';
import PaymentMethodManager from './PaymentMethodManager';
import { CreditCard } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPaymentMethodsPage() {
  const methods = await getAllPaymentMethods();

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-[#0F2C59]" /> Payment Receiving Methods Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure active PhonePe/GooglePay numbers, UPI handles, QR codes, and bank account channels shown during customer checkout
        </p>
      </div>

      <PaymentMethodManager initialMethods={methods} />
    </div>
  );
}
