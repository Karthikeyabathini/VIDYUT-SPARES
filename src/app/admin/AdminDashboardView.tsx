'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  CheckSquare,
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import RevenueAuditModal from '@/components/admin/RevenueAuditModal';

interface AdminDashboardViewProps {
  stats: any;
}

export default function AdminDashboardView({ stats }: AdminDashboardViewProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    totalAmount: number;
    orders: any[];
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    totalAmount: 0,
    orders: [],
  });

  const openTotalSalesAudit = () => {
    setModalState({
      isOpen: true,
      title: 'Total Lifetime Sales Revenue Audit',
      subtitle: 'Complete list of all orders with DELIVERED status contributing to total sales revenue',
      totalAmount: stats.totalSales,
      orders: stats.deliveredOrdersList || [],
    });
  };

  const openCurrentMonthAudit = () => {
    setModalState({
      isOpen: true,
      title: `Current Month Sales Audit (${stats.currentMonthName})`,
      subtitle: `All DELIVERED orders placed during ${stats.currentMonthName} (1st of month to present)`,
      totalAmount: stats.currentMonthSales,
      orders: stats.currentMonthDeliveredList || [],
    });
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business revenue analytics, payment approval queue, and inventory alerts
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
        {/* TOTAL SALES REVENUE */}
        <div
          onClick={openTotalSalesAudit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Total Sales Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0F2C59]">
            ₹{stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-semibold">
              From {stats.deliveredOrders} delivered orders
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white">
              Audit Proof <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* THIS MONTH SALES */}
        <div
          onClick={openCurrentMonthAudit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>This Month ({stats.currentMonthName})</span>
            <div className="p-2 bg-blue-50 text-[#0F2C59] rounded-lg group-hover:bg-[#0F2C59] group-hover:text-white transition-colors">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0F2C59]">
            ₹{stats.currentMonthSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-semibold">
              1st {stats.currentMonthName.split(' ')[0]} - Present
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-[#0F2C59] group-hover:text-white">
              Month Breakdown <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* PENDING VERIFICATION */}
        <Link
          href="/admin/payments"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 block hover:border-amber-400 hover:shadow-md transition-all"
        >
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
        </Link>

        {/* LOW STOCK ALERT */}
        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 block hover:border-red-400 hover:shadow-md transition-all"
        >
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
        </Link>
      </div>

      {/* SYSTEM SUMMARY & SHORTCUTS */}
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
              <h4 className="font-bold text-xs text-slate-900">Add New Product</h4>
              <p className="text-[11px] text-slate-500">Add switches, copper wires, or breakers</p>
            </Link>

            <Link
              href="/admin/history"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-white transition-all space-y-1 block"
            >
              <h4 className="font-bold text-xs text-slate-900">Business History</h4>
              <p className="text-[11px] text-slate-500">Filter sales activity & view trend graph</p>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> System Metrics
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Total Orders Placed:</span>
              <span className="font-bold text-slate-900">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivered Orders:</span>
              <span className="font-bold text-emerald-700">{stats.deliveredOrders}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Catalog Products:</span>
              <span className="font-bold text-slate-900">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue Rule:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                DELIVERED ONLY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE AUDIT BREAKDOWN MODAL */}
      <RevenueAuditModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        subtitle={modalState.subtitle}
        totalAmount={modalState.totalAmount}
        orders={modalState.orders}
      />
    </div>
  );
}
