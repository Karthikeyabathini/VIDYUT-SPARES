import React from 'react';
import { getAllPayments } from '@/lib/actions/paymentActions';
import PaymentVerificationModal from './PaymentVerificationModal';
import { CheckSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments();
  const pendingPayments = payments?.filter((p) => p.payment_status === 'AWAITING_VERIFICATION') || [];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-amber-500" /> Payment Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect customer transaction UTR numbers and receipt screenshots to manually approve or reject payments
          </p>
        </div>

        <div className="bg-amber-100 text-amber-900 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-amber-300">
          Pending Verification Requests: {pendingPayments.length}
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {payments && payments.length > 0 ? (
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead>
              <tr className="bg-[#0F2C59] text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">UTR / Ref</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-[#0F2C59]">
                    {payment.order?.order_number}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{payment.order?.user?.name || 'Customer'}</p>
                    <p className="text-[11px] text-slate-400">{payment.order?.user?.phone || payment.order?.user?.email}</p>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">
                    ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{payment.payment_method}</td>
                  <td className="p-4 font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 w-fit">
                    {payment.utr_number}
                  </td>
                  <td className="p-4 text-slate-500">
                    {payment.payment_date} {payment.payment_time}
                  </td>
                  <td className="p-4">
                    {payment.payment_status === 'AWAITING_VERIFICATION' ? (
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-amber-200">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    ) : payment.payment_status === 'PAID' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> PAID
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-red-200">
                        <XCircle className="h-3 w-3" /> REJECTED
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <PaymentVerificationModal payment={payment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckSquare className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm">No payment verification requests recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
