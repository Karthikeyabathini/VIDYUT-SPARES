import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCustomerOrders } from '@/lib/actions/orderActions';
import { getActiveUser } from '@/lib/actions/authActions';
import { Package, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export const revalidate = 0;

export default async function CustomerOrdersPage() {
  const user = await getActiveUser();
  if (!user) {
    redirect('/login?redirectTo=/account/orders');
  }

  const orders = await getCustomerOrders();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="h-7 w-7 text-[#0F2C59]" /> My Orders & Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          View past order history, check payment verification status, and track delivery
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCancelled = order.order_status === 'CANCELLED';
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-colors ${
                  isCancelled ? 'border-red-200 hover:border-red-300 bg-red-50/20' : 'border-slate-200 hover:border-blue-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-extrabold text-sm text-[#0F2C59]">
                      Order #{order.order_number}
                    </span>
                    <span className="text-xs text-slate-400 block sm:inline sm:ml-3">
                      Placed on: {new Date(order.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    {order.payment_status === 'PAID' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" /> Payment PAID
                      </span>
                    ) : order.payment_status === 'AWAITING_VERIFICATION' ? (
                      <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded flex items-center gap-1 border border-amber-200">
                        <Clock className="h-3.5 w-3.5" /> Awaiting Verification
                      </span>
                    ) : order.payment_status === 'REJECTED' ? (
                      <span className="bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded flex items-center gap-1 border border-red-200">
                        <XCircle className="h-3.5 w-3.5" /> Payment Rejected
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded border border-slate-200">
                        {order.payment_status}
                      </span>
                    )}

                    {isCancelled ? (
                      <span className="bg-red-100 text-red-800 font-extrabold px-2.5 py-0.5 rounded border border-red-300 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-red-600" /> CUSTOMER CANCELLED
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-[#0F2C59] font-extrabold px-2.5 py-0.5 rounded border border-blue-100">
                        Status: {order.order_status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8 space-y-1">
                    <p className="text-xs text-slate-600 font-medium">
                      Items Snapshot: {order.items?.map((i) => `${i.product_name_snapshot} (${i.quantity})`).join(', ')}
                    </p>
                    <p className="text-xs text-slate-400">
                      Payment Method: <span className="font-semibold text-slate-700">{order.payment_method}</span>
                    </p>
                    {isCancelled && order.cancellation_reason && (
                      <p className="text-xs text-red-700 pt-1 font-medium italic">
                        Reason: "{order.cancellation_reason}"
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4 text-right space-y-2">
                    <div className="text-base font-extrabold text-[#0F2C59]">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2C59] hover:underline"
                    >
                      View Order & Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <Package className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not placed any electrical spare orders yet.
          </p>
          <Link
            href="/products"
            className="inline-block text-xs font-bold bg-[#0F2C59] text-white px-6 py-3 rounded-xl shadow-sm"
          >
            Start Shopping Now
          </Link>
        </div>
      )}
    </div>
  );
}
