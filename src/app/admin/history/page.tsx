import React from 'react';
import { getFilteredBusinessHistory } from '@/lib/actions/adminActions';
import HistoryReportFilter from './HistoryReportFilter';
import RevenueAnalyticsChart from '@/components/admin/RevenueAnalyticsChart';
import { FileSpreadsheet, IndianRupee, ShoppingBag, CheckSquare, Package, TrendingUp } from 'lucide-react';

interface HistoryPageProps {
  searchParams: Promise<{
    fromDate?: string;
    toDate?: string;
    orderStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }>;
}

export const revalidate = 0;

export default async function AdminHistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;

  const { orders, summary, chartData } = await getFilteredBusinessHistory({
    fromDate: params.fromDate,
    toDate: params.toDate,
    orderStatus: params.orderStatus,
    paymentStatus: params.paymentStatus,
    paymentMethod: params.paymentMethod,
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-[#0F2C59]" /> Business History & Revenue Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive sales performance, delivered revenue calculation, and historical trend analysis in IST
        </p>
      </div>

      {/* GRAPH ANALYTICS TREND CHART */}
      <RevenueAnalyticsChart
        chartData={chartData}
        totalDeliveredRevenue={summary.totalSales}
        totalDeliveredCount={summary.deliveredCount}
        growthPercentage={summary.growthPercentage}
      />

      {/* FILTER BAR & CSV EXPORT (NO SEARCH KEYWORD) */}
      <HistoryReportFilter currentParams={params} filteredOrders={orders} />

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Total Filtered Orders</span>
          <p className="text-2xl font-extrabold text-slate-900">{summary.totalOrders}</p>
          <span className="text-[10px] text-slate-500">{summary.deliveredCount} delivered orders</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1 border-l-4 border-l-emerald-600">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Delivered Sales Revenue</span>
          <p className="text-2xl font-extrabold text-[#0F2C59]">
            ₹{summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] font-bold text-emerald-700">Strictly DELIVERED orders</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Delivered Units Sold</span>
          <p className="text-2xl font-extrabold text-emerald-700">{summary.totalItemsSold} units</p>
          <span className="text-[10px] text-slate-500">From delivered order items</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase block text-[10px]">Pending Verifications</span>
          <p className="text-2xl font-extrabold text-amber-600">{summary.pendingVerification}</p>
          <span className="text-[10px] text-amber-800 font-semibold">Awaiting admin check</span>
        </div>
      </div>

      {/* FILTERED ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Filtered Orders Log ({orders.length} Records)
          </h3>
          <span className="text-[11px] text-slate-500">Showing filtered database results</span>
        </div>

        {orders.length > 0 ? (
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="bg-[#0F2C59] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-4">Order #</th>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Placed Date</th>
                <th className="p-4">Method</th>
                <th className="p-4">UTR Number</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0F2C59]">{o.order_number}</td>
                  <td className="p-4 font-mono text-slate-600">{o.invoice?.invoice_number || 'N/A'}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{o.user?.name || 'Customer'}</span>
                    <span className="text-[11px] text-slate-500">{o.user?.phone || o.address_snapshot?.phone}</span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {new Date(o.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{o.payment_method}</td>
                  <td className="p-4 font-mono text-amber-800 font-bold">{o.payment?.utr_number || 'N/A'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.order_status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : o.order_status === 'CANCELLED'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {o.order_status}
                    </span>
                  </td>
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
