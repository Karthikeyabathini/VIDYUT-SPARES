'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Filter, RefreshCw, Calendar } from 'lucide-react';

export default function HistoryReportFilter({
  currentParams,
  filteredOrders,
}: {
  currentParams: any;
  filteredOrders: any[];
}) {
  const router = useRouter();

  const [fromDate, setFromDate] = useState(currentParams.fromDate || '');
  const [toDate, setToDate] = useState(currentParams.toDate || '');
  const [orderStatus, setOrderStatus] = useState(currentParams.orderStatus || 'ALL');
  const [paymentStatus, setPaymentStatus] = useState(currentParams.paymentStatus || 'ALL');
  const [paymentMethod, setPaymentMethod] = useState(currentParams.paymentMethod || 'ALL');

  const applyFilters = () => {
    // DATE CONSTRAINT VALIDATION: fromDate <= toDate
    if (fromDate && toDate && fromDate > toDate) {
      alert('Invalid Date Range: "From Date" cannot be after "To Date". Please adjust your date selection.');
      return;
    }

    const query = new URLSearchParams();
    if (fromDate) query.set('fromDate', fromDate);
    if (toDate) query.set('toDate', toDate);
    if (orderStatus !== 'ALL') query.set('orderStatus', orderStatus);
    if (paymentStatus !== 'ALL') query.set('paymentStatus', paymentStatus);
    if (paymentMethod !== 'ALL') query.set('paymentMethod', paymentMethod);

    router.push(`/admin/history?${query.toString()}`);
  };

  const setPreset = (preset: 'today' | 'yesterday' | 'month' | 'year') => {
    const now = new Date();
    let from = '';
    let to = now.toISOString().split('T')[0];

    if (preset === 'today') {
      from = to;
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      from = y.toISOString().split('T')[0];
      to = from;
    } else if (preset === 'month') {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    } else if (preset === 'year') {
      from = `${now.getFullYear()}-01-01`;
    }

    setFromDate(from);
    setToDate(to);

    const query = new URLSearchParams();
    query.set('fromDate', from);
    query.set('toDate', to);
    if (orderStatus !== 'ALL') query.set('orderStatus', orderStatus);
    if (paymentStatus !== 'ALL') query.set('paymentStatus', paymentStatus);
    if (paymentMethod !== 'ALL') query.set('paymentMethod', paymentMethod);
    router.push(`/admin/history?${query.toString()}`);
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders available to export for the selected filter criteria.');
      return;
    }

    const headers = [
      'Order Number',
      'Invoice Number',
      'Customer Name',
      'Customer Phone',
      'Placed Date',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'UTR Number',
      'Total Amount (INR)',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.order_number}"`,
      `"${o.invoice?.invoice_number || ''}"`,
      `"${o.user?.name || ''}"`,
      `"${o.user?.phone || ''}"`,
      `"${new Date(o.placed_at).toISOString()}"`,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.order_status}"`,
      `"${o.payment?.utr_number || ''}"`,
      o.total_amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VIDYUT_SPARES_Business_Report_${fromDate || 'All'}_to_${toDate || 'Today'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        {/* PRESET QUICK BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Quick Date Presets:</span>
          <button
            onClick={() => setPreset('today')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F2C59] hover:text-white font-bold transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setPreset('yesterday')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F2C59] hover:text-white font-bold transition-colors"
          >
            Yesterday
          </button>
          <button
            onClick={() => setPreset('month')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F2C59] hover:text-white font-bold transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => setPreset('year')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F2C59] hover:text-white font-bold transition-colors"
          >
            This Year
          </button>
        </div>

        {/* CSV EXPORT BUTTON */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* CUSTOM DATE & FILTER SELECTORS (NO SEARCH KEYWORD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="font-bold text-slate-700 block mb-1">From Date (Start)</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">To Date (End)</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Order Status</label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
          >
            <option value="ALL">ALL Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
          >
            <option value="ALL">ALL Payment Statuses</option>
            <option value="AWAITING_VERIFICATION">AWAITING_VERIFICATION</option>
            <option value="PAID">PAID</option>
            <option value="REJECTED">REJECTED</option>
            <option value="NOT_REQUIRED">NOT_REQUIRED (COD)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={applyFilters}
            className="w-full bg-[#0F2C59] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Filter className="h-4 w-4" /> Apply Report Filters
          </button>
        </div>
      </div>
    </div>
  );
}
