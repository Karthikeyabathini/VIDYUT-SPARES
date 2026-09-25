import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/actions/orderActions';
import DownloadInvoiceButton from '@/components/invoice/DownloadInvoiceButton';
import AdminOrderStatusSelect from '../AdminOrderStatusSelect';
import { ShoppingBag, ArrowLeft, MapPin, CreditCard, XCircle, Clock, CheckCircle2 } from 'lucide-react';

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const isCancelled = order.order_status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link href="/admin/orders" className="text-xs font-semibold text-slate-500 hover:text-[#0F2C59] flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#0F2C59]" /> Order #{order.order_number}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <DownloadInvoiceButton
            invoiceOrOrderId={order.id}
            orderStatus={order.order_status}
            isAdmin={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ORDERED ITEMS */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
            Ordered Spares
          </h2>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
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

          <div className="border-t border-slate-100 pt-3 text-right space-y-1">
            <p className="text-slate-500">Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}</p>
            <p className="text-slate-500">Delivery Charge: ₹{order.delivery_charge}</p>
            <p className="text-base font-extrabold text-[#0F2C59] pt-1">
              Grand Total: ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DELIVERY, PAYMENT, & CANCELLATION DETAILS */}
        <div className="lg:col-span-4 space-y-6">
          {/* DELIVERY ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-3">
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#0F2C59]" /> Delivery Address
            </h2>
            <p className="font-bold text-slate-900">{order.address_snapshot?.full_name}</p>
            <p className="font-semibold text-slate-600">{order.address_snapshot?.phone}</p>
            <p className="text-slate-600">
              {order.address_snapshot?.address_line_1}, {order.address_snapshot?.address_line_2}
            </p>
            <p className="text-slate-600">
              {order.address_snapshot?.city}, {order.address_snapshot?.state} - <span className="font-bold">{order.address_snapshot?.pincode}</span>
            </p>
          </div>

          {/* PAYMENT & ORDER STATUS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-3">
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-amber-600" /> Payment & Status
            </h2>
            <p className="font-bold text-slate-900">Method: {order.payment_method}</p>
            <p className="font-bold text-amber-800">Payment Status: {order.payment_status}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-[#0F2C59]">Order Status:</span>
              <AdminOrderStatusSelect orderId={order.id} currentStatus={order.order_status} />
            </div>
          </div>

          {/* DEDICATED CANCELLATION DETAILS SECTION */}
          <div
            className={`p-6 rounded-2xl border shadow-sm text-xs space-y-3 ${
              isCancelled
                ? 'bg-red-50/50 border-red-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-1.5">
              <XCircle className={`h-4 w-4 ${isCancelled ? 'text-red-600' : 'text-slate-400'}`} /> CANCELLATION DETAILS
            </h2>

            {isCancelled ? (
              <div className="space-y-2 text-slate-800">
                <div>
                  <span className="font-semibold text-slate-500 block">Cancellation Status:</span>
                  <span className="font-extrabold text-red-700 text-xs">
                    {order.cancellation_status === 'CUSTOMER_CANCELLED' || order.cancelled_by === 'CUSTOMER'
                      ? 'Customer Cancelled'
                      : 'Store Admin Cancelled'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Reason:</span>
                  <p className="font-bold text-slate-900 italic bg-white p-2 rounded-lg border border-red-200 mt-0.5">
                    "{order.cancellation_reason || 'No reason specified'}"
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Cancelled By:</span>
                  <span className="font-bold text-slate-900">
                    {order.cancelled_by || 'Customer'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Cancelled At:</span>
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
              </div>
            ) : (
              <div>
                <span className="font-semibold text-slate-500 block">Cancellation Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Not Cancelled
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
