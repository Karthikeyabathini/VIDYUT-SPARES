import React from 'react';
import Link from 'next/link';
import { getAdminDashboardStats } from '@/lib/actions/adminActions';
import {
  IndianRupee,
  ShoppingBag,
  CheckSquare,
  Package,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time business performance, order counts, and stock alert indicators
          </p>
        </div>

        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <CheckSquare className="h-4 w-4" /> View Payment Verification Queue (
          {stats.pendingPaymentApprovals})
        </Link>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL SALES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Total Sales Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0F2C59]">
            ₹{stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">
            From {stats.paidOrdersCount} verified paid orders
          </p>
        </div>

        {/* PENDING VERIFICATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Pending Payment Approvals</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">
            {stats.pendingPaymentApprovals}
          </p>
          <p className="text-[11px] text-amber-700 font-bold">
            Awaiting manual UTR & screenshot check
          </p>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Total Orders Placed</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {stats.processingOrders} processing • {stats.deliveredOrders} delivered
          </p>
        </div>

        {/* LOW STOCK ALERT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Low Stock / Out of Stock</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-600">
            {stats.outOfStock + stats.lowStock}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {stats.outOfStock} out of stock • {stats.lowStock} low stock
          </p>
        </div>
      </div>

      {/* QUICK SHORTCUTS & SYSTEM SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0F2C59]" /> Quick Management Shortcuts
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/payments"
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white transition-all space-y-1 block"
            >
              <h4 className="font-bold text-xs text-slate-900">Payment Verification</h4>
              <p className="text-[11px] text-slate-500">Approve or reject customer online receipts</p>
            </Link>

            <Link
              href="/admin/products/add"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-700 bg-slate-50 hover:bg-white transition-all space-y-1 block"
            >
              <h4 className="font-bold text-xs text-slate-900">Add New Electrical Product</h4>
              <p className="text-[11px] text-slate-500">Add switches, copper wires, or breakers</p>
            </Link>

            <Link
              href="/admin/history"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-white transition-all space-y-1 block"
            >
              <h4 className="font-bold text-xs text-slate-900">Date Range History</h4>
              <p className="text-[11px] text-slate-500">Filter sales activity & export CSV</p>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">
            System Information
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Total Catalog Products:</span>
              <span className="font-bold text-slate-900">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span>Registered Customers:</span>
              <span className="font-bold text-slate-900">{stats.customerCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Timezone:</span>
              <span className="font-bold text-amber-700">Asia/Kolkata (IST)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
