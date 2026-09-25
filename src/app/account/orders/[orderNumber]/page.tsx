import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByNumber } from '@/lib/actions/orderActions';
import DownloadInvoiceButton from '@/components/invoice/DownloadInvoiceButton';
import CancelOrderButton from '@/components/orders/CancelOrderButton';
import { Package, Clock, ArrowLeft, AlertCircle, Truck, MapPin, XCircle, CheckCircle2 } from 'lucide-react';

interface OrderTrackingPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export const revalidate = 0;

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const isCancelled = order.order_status === 'CANCELLED';
  const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.order_status);

  // Determine stage before cancellation if available
  let cancelledTimelineSteps = ['PENDING', 'CANCELLED'];
  if (order.confirmed_at) {
    cancelledTimelineSteps = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link href="/account/orders" className="text-xs font-semibold text-slate-500 hover:text-[#0F2C59] flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-[#0F2C59]" /> Order #{order.order_number}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* CANCEL ORDER BUTTON (only appears when eligible) */}
          <CancelOrderButton
            orderId={order.id}
            orderNumber={order.order_number}
            orderStatus={order.order_status}
          />

          <DownloadInvoiceButton
            invoiceOrOrderId={order.id}
            orderStatus={order.order_status}
            isAdmin={false}
          />
        </div>
      </div>

      {/* TRACKING TIMELINE BAR OR CANCELLED NOTICE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <Truck className="h-5 w-5 text-[#0F2C59]" /> Delivery Status Timeline
        </h2>

        {isCancelled ? (
          <div className="space-y-6">
            {/* CANCELLED TIMELINE */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 py-2 text-xs">
              {cancelledTimelineSteps.map((step, idx) => {
                const isLast = idx === cancelledTimelineSteps.length - 1;
                return (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isLast
                            ? 'bg-red-600 text-white shadow-md ring-2 ring-red-200'
                            : 'bg-[#0F2C59] text-white'
                        }`}
                      >
                        {isLast ? '✕' : '✓'}
                      </div>
                      <span
                        className={`font-bold uppercase tracking-wide ${
                          isLast ? 'text-red-600 text-sm' : 'text-slate-700'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {idx < cancelledTimelineSteps.length - 1 && (
                      <div className="h-0.5 w-12 sm:w-20 bg-slate-300"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* DETAILED CANCELLATION INFORMATION CARD */}
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 border-b border-red-200/60 pb-2">
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                <h3 className="font-extrabold text-sm uppercase text-red-800">
                  ORDER CANCELLED
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-600 block">Cancellation Type:</span>
                  <span className="font-bold text-red-700">
                    {order.cancelled_by === 'CUSTOMER' || order.cancellation_status === 'CUSTOMER_CANCELLED'
                      ? 'Customer Cancelled'
                      : 'Store Admin Cancelled'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 block">Cancelled On:</span>
                  <span className="font-bold text-slate-900">
                    {order.cancelled_at
                      ? new Date(order.cancelled_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : new Date(order.updated_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                  </span>
                </div>
                <div className="sm:col-span-2 bg-white/80 p-3 rounded-xl border border-red-200">
                  <span className="font-semibold text-slate-600 block mb-0.5">
                    Customer cancellation reason:
                  </span>
                  <p className="font-bold text-slate-900 text-xs italic">
                    "{order.cancellation_reason || 'No reason specified'}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {steps.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="space-y-2">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      isPassed ? 'bg-[#0F2C59]' : 'bg-slate-200'
                    }`}
                  ></div>
                  <span
                    className={`font-bold block text-[11px] ${
                      isCurrent ? 'text-amber-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAYMENT STATUS NOTICE */}
      {!isCancelled && order.payment_status === 'AWAITING_VERIFICATION' && (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex items-start gap-4">
          <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <h3 className="font-bold text-sm">Payment Awaiting Verification</h3>
            <p>
              Your submitted UTR ({order.payment?.utr_number || 'Under Review'}) is being verified by VIDYUT SPARES admins against bank records. Your invoice will be unlocked once approved.
            </p>
          </div>
        </div>
      )}

      {!isCancelled && order.payment_status === 'REJECTED' && (
        <div className="bg-red-50 p-5 rounded-2xl border border-red-200 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 space-y-2 flex-1">
            <h3 className="font-bold text-sm">Payment Verification Rejected</h3>
            <p>Reason: {order.payment?.rejection_reason || 'UTR could not be matched.'}</p>
            <Link
              href={`/checkout/payment?orderId=${order.id}`}
              className="inline-block text-xs font-bold bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Re-submit Correct Payment Proof
            </Link>
          </div>
        </div>
      )}

      {/* ITEMS TABLE & ADDRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ITEMS */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
            Ordered Spares
          </h2>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.product_name_snapshot}</p>
                  <p className="text-slate-500 font-mono">SKU: {item.sku_snapshot} | Qty: {item.quantity}</p>
                </div>
                <span className="font-extrabold text-slate-900">
                  ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 text-xs space-y-1 text-right">
            <p className="text-slate-500">Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}</p>
            <p className="text-slate-500">Delivery Charge: ₹{order.delivery_charge}</p>
            <p className="text-base font-extrabold text-[#0F2C59] pt-1">
              Grand Total: ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* DELIVERY ADDRESS SNAPSHOT */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs h-fit">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#0F2C59]" /> Delivery Address
          </h2>
          <div className="space-y-1 text-slate-700">
            <p className="font-bold text-slate-900 text-sm">{order.address_snapshot?.full_name}</p>
            <p className="font-semibold text-slate-600">{order.address_snapshot?.phone}</p>
            <p className="pt-2">
              {order.address_snapshot?.address_line_1}, {order.address_snapshot?.address_line_2}
            </p>
            <p>
              {order.address_snapshot?.city}, {order.address_snapshot?.state} - <span className="font-bold">{order.address_snapshot?.pincode}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
