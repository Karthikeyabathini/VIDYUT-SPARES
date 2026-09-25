import React from 'react';
import { getFilteredBusinessHistory } from '@/lib/actions/adminActions';
import HistoryReportFilter from './HistoryReportFilter';
import { FileSpreadsheet, IndianRupee, ShoppingBag, CheckSquare, XCircle } from 'lucide-react';

interface HistoryPageProps {
  searchParams: Promise<{
    fromDate?: string;
    toDate?: string;
    orderStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    search?: string;
  }>;
}

export const revalidate = 0;

export default async function AdminHistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;

  const { orders, summary } = await getFilteredBusinessHistory({
    fromDate: params.fromDate,
    toDate: params.toDate,
    orderStatus: params.orderStatus,
    paymentStatus: params.paymentStatus,
    paymentMethod: params.paymentMethod,
  });

  // Client-side search filtering on orders array if search is provided
  const searchLower = params.search?.toLowerCase().trim() || '';
  const filteredOrders = searchLower
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(searchLower) ||
          o.user?.name?.toLowerCase().includes(searchLower) ||
          o.user?.phone?.includes(searchLower) ||
          o.payment?.utr_number?.toLowerCase().includes(searchLower) ||
          o.invoice?.invoice_number?.toLowerCase().includes(searchLower)
      )
    : orders;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-[#0F2C59]" /> Business History & Date-Range Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Filter business sales, orders, and payment verification records by custom date range in IST (Asia/Kolkata)
        </p>
      </div>

      {/* FILTER BAR & CSV EXPORT */}
      <HistoryReportFilter currentParams={params} filteredOrders={filteredOrders} />

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Filtered Orders</span>
          <p className="text-xl font-extrabold text-slate-900">{summary.totalOrders}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Verified Sales Value</span>
          <p className="text-xl font-extrabold text-[#0F2C59]">
            ₹{summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Items Sold</span>
          <p className="text-xl font-extrabold text-emerald-700">{summary.totalItemsSold} units</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Pending Verifications</span>
          <p className="text-xl font-extrabold text-amber-600">{summary.pendingVerification}</p>
        </div>
      </div>

      {/* FILTERED ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F2C59] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-4">Order #</th>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Placed Date</th>
                <th className="p-4">Method</th>
                <th className="p-4">UTR Number</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-[#0F2C59]">{o.order_number}</td>
                  <td className="p-4 font-mono text-slate-600">{o.invoice?.invoice_number || 'N/A'}</td>
                  <td className="p-4 font-bold text-slate-900">{o.user?.name}</td>
                  <td className="p-4 text-slate-500">
                    {new Date(o.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{o.payment_method}</td>
                  <td className="p-4 font-mono text-amber-800 font-bold">{o.payment?.utr_number || 'N/A'}</td>
                  <td className="p-4 font-bold text-emerald-800">{o.payment_status}</td>
                  <td className="p-4 text-right font-extrabold text-slate-900">
                    ₹{o.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No orders match the selected date range and filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
