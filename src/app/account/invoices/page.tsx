import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getActiveUser } from '@/lib/actions/authActions';
import { createAdminClient } from '@/lib/supabase/admin';
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

import { getCustomerInvoices } from '@/lib/actions/invoiceActions';

export const revalidate = 0;

export default async function CustomerInvoicesPage() {
  const user = await getActiveUser();

  if (!user) {
    redirect('/login?redirectTo=/account/invoices');
  }

  const invoices = await getCustomerInvoices();


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-7 w-7 text-[#0F2C59]" /> My Tax Invoices
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Download and print official tax invoices for verified paid orders
        </p>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="bg-[#0F2C59] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-[#0F2C59]">{inv.invoice_number}</td>
                  <td className="p-4 font-mono text-slate-600">{inv.order?.order_number}</td>
                  <td className="p-4 text-slate-500">{inv.invoice_date}</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                      <CheckCircle2 className="h-3 w-3" /> {inv.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-extrabold text-slate-900">
                    ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/account/invoices/${inv.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2C59] hover:underline"
                    >
                      View / Print <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Invoices Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Invoices become downloadable after online payment is verified by admin or COD order is confirmed.
          </p>
        </div>
      )}
    </div>
  );
}
