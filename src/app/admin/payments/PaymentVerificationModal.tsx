'use client';

import React, { useState } from 'react';
import { approvePayment, rejectPayment } from '@/lib/actions/paymentActions';
import { CheckCircle2, XCircle, Eye, X, ShieldAlert } from 'lucide-react';

export default function PaymentVerificationModal({ payment }: { payment: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const res = await approvePayment(payment.id);
    setLoading(false);

    if (res.success) {
      alert('Payment approved successfully! Order status set to PROCESSING and Tax Invoice generated.');
      setOpen(false);
    } else {
      alert(res.error || 'Failed to approve payment');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }

    setLoading(true);
    const res = await rejectPayment(payment.id, rejectionReason.trim());
    setLoading(false);

    if (res.success) {
      alert('Payment rejected. Order cancelled and inventory stock restored.');
      setOpen(false);
    } else {
      alert(res.error || 'Failed to reject payment');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
      >
        <Eye className="h-3.5 w-3.5" /> Inspect Proof
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-left border border-slate-300 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Payment Verification Inspection
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Order #{payment.order?.order_number}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* SCREENSHOT PROOF PREVIEW */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Payment Receipt Screenshot:
                </label>
                <div className="bg-slate-900 rounded-xl p-2 border border-slate-700 min-h-[250px] flex items-center justify-center">
                  <img
                    src={payment.proof_file_url}
                    alt="Customer Payment Receipt Proof"
                    className="max-h-[350px] object-contain rounded"
                  />
                </div>
              </div>

              {/* TRANSACTION METADATA */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500 font-semibold">Submitted UTR Number:</span>
                    <span className="font-mono font-extrabold text-amber-800 text-sm select-all">
                      {payment.utr_number}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500 font-semibold">Order Total Payable:</span>
                    <span className="font-extrabold text-[#0F2C59] text-sm">
                      ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500 font-semibold">Payment Date & Time:</span>
                    <span className="font-bold text-slate-800">
                      {payment.payment_date} at {payment.payment_time}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500 font-semibold">Channel Used:</span>
                    <span className="font-bold text-slate-800">{payment.payment_method}</span>
                  </div>
                  {payment.payer_name && (
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-semibold">Payer Name:</span>
                      <span className="font-bold text-slate-800">{payment.payer_name}</span>
                    </div>
                  )}
                  {payment.customer_note && (
                    <div className="pt-1">
                      <span className="text-slate-500 font-semibold block">Customer Note:</span>
                      <p className="text-slate-800 italic bg-white p-2 rounded border border-slate-200 mt-0.5">
                        &quot;{payment.customer_note}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* CURRENT VERIFICATION STATUS */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                  <span className="font-bold text-[#0F2C59]">Current Status: </span>
                  <span className="font-extrabold text-amber-800">{payment.payment_status}</span>
                </div>

                {/* APPROVE / REJECT ACTIONS */}
                {payment.payment_status === 'AWAITING_VERIFICATION' && (
                  <div className="space-y-3 pt-2">
                    {!showRejectInput ? (
                      <div className="flex gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={loading}
                          className="w-1/2 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-md transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve & Issue Invoice
                        </button>
                        <button
                          onClick={() => setShowRejectInput(true)}
                          disabled={loading}
                          className="w-1/2 py-3 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 shadow-md transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Reject Payment
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReject} className="space-y-3 bg-red-50 p-4 rounded-xl border border-red-200">
                        <label className="font-bold text-red-900 block text-xs">
                          Mandatory Rejection Reason:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Reason for payment rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full p-2 rounded-lg border border-red-300 text-xs bg-white text-slate-900"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowRejectInput(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white"
                          >
                            Confirm Rejection & Restore Stock
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
