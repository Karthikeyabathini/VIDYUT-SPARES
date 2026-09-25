import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/actions/orderActions';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface OrderSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    paymentStatus?: string;
  }>;
}

export const revalidate = 0;

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { orderId, paymentStatus } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const isOnlineVerification = order.payment_method !== 'COD' || paymentStatus === 'submitted';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank You! Order #{order.order_number} Received
        </h1>

        {/* VERIFICATION NOTICE */}
        {isOnlineVerification ? (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left max-w-xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock className="h-5 w-5 text-amber-600" /> Payment Awaiting Admin Verification
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Payment proof submitted. Your payment is awaiting verification by VIDYUT SPARES. Once our admin verifies your UTR number, your payment status will change to <span className="font-bold">PAID</span> and your official invoice will become available for download.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-left max-w-xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-[#0F2C59] font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Cash on Delivery Order Confirmed
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Your Cash on Delivery order has been registered. Our warehouse team in Vijayawada is preparing your electrical spare parts for shipment.
            </p>
          </div>
        )}

        {/* ORDER DETAILS SUMMARY */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left text-xs space-y-3 max-w-xl mx-auto">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">Order Placed Date:</span>
            <span className="font-bold text-slate-900">
              {new Date(order.placed_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">Payment Mode:</span>
            <span className="font-bold text-slate-900">{order.payment_method}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">Current Payment Status:</span>
            <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              {order.payment_status}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-extrabold text-[#0F2C59]">
            <span>Total Amount:</span>
            <span>₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href={`/account/orders/${order.order_number}`}
            className="inline-flex items-center justify-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-colors"
          >
            Track Order Details <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-6 py-3.5 rounded-xl border border-slate-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
