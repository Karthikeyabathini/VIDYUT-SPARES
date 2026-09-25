import React from 'react';
import Link from 'next/link';
import { getAllAdminOrders } from '@/lib/actions/orderActions';
import AdminOrderStatusSelect from './AdminOrderStatusSelect';
import { ShoppingBag, ArrowRight, Filter, AlertCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';

export const revalidate = 0;

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const STATUS_FILTERS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status: activeFilter = 'ALL' } = await searchParams;
  const allOrders = await getAllAdminOrders();

  const filteredOrders = allOrders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    return order.order_status === activeFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#0F2C59]" /> Order Processing & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process received customer orders, track cancellation requests, and manage dispatch status
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter.toUpperCase() === filter;
            const count = filter === 'ALL' 
              ? allOrders.length 
              : allOrders.filter((o) => o.order_status === filter).length;

            return (
              <Link
                key={filter}
                href={filter === 'ALL' ? '/admin/orders' : `/admin/orders?status=${filter}`}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-white text-[#0F2C59] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {filter}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-100 text-[#0F2C59]' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0F2C59] text-white font-bold uppercase text-[11px] tracking-wider">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer & Contact</th>
                  <th className="p-4">Placed Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Status & Cancellation</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order, idx) => {
                  const isCancelled = order.order_status === 'CANCELLED';
                  const customerName = order.user?.name || order.address_snapshot?.full_name || 'Valued Customer';
                  const customerPhone = order.user?.phone || order.address_snapshot?.phone || order.user?.email || 'N/A';

                  return (
                    <tr
                      key={`${order.id}-${idx}`}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCancelled ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-[#0F2C59]">
                        {order.order_number}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{customerName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{customerPhone}</p>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(order.placed_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 font-medium text-slate-700">{order.payment_method}</td>
                      <td className="p-4 font-bold text-amber-800">{order.payment_status}</td>
                      <td className="p-4 text-right font-extrabold text-slate-900">
                        ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        {isCancelled ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-extrabold px-2.5 py-1 rounded border border-red-300">
                              <XCircle className="h-3.5 w-3.5 text-red-600" /> CUSTOMER CANCELLED
                            </span>
                            {order.cancellation_reason && (
                              <p className="text-[11px] text-red-700 italic font-medium max-w-xs truncate">
                                "{order.cancellation_reason}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <AdminOrderStatusSelect orderId={order.id} currentStatus={order.order_status} />
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2C59] hover:underline"
                        >
                          Inspect Details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No orders found for filter "{activeFilter}".</p>
            <p className="text-xs text-slate-400">Try selecting "ALL" to view the full order history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
