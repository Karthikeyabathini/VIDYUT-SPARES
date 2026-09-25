'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cancelCustomerOrder } from '@/lib/actions/orderActions';

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

const PREDEFINED_REASONS = [
  'Ordered by mistake',
  'Found a better price',
  'No longer required',
  'Delivery is taking too long',
  'Ordered the wrong product',
  'Change of requirement',
  'Other',
];

export default function CancelOrderModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
}: CancelOrderModalProps) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPredefined = (reason: string) => {
    setSelectedReason(reason);
    setErrorMsg(null);
    if (reason !== 'Other') {
      setCustomReason(reason);
    } else {
      setCustomReason('');
    }
  };

  const finalReasonText = (selectedReason === 'Other' ? customReason : (customReason || selectedReason)).trim();

  const handleConfirmCancel = async () => {
    if (!finalReasonText || finalReasonText.length < 5) {
      setErrorMsg('Please provide a reason for cancelling the order (at least 5 characters).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await cancelCustomerOrder({
        orderId,
        reason: finalReasonText,
      });

      if (res.success) {
        setSuccessMsg('Order cancelled successfully. Your cancellation reason has been recorded.');
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Unable to cancel order right now. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 relative overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Cancel Order #{orderNumber}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Are you sure you want to cancel this order? This action will mark your order as cancelled.
            </p>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!successMsg && (
          <div className="space-y-4">
            {/* PREDEFINED REASONS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select a reason for cancellation:
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => handleSelectPredefined(reason)}
                      disabled={loading}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-red-50 border-red-300 text-red-700 font-bold ring-1 ring-red-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TEXTAREA FOR CUSTOM / DETAILED REASON */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={loading}
                rows={3}
                placeholder="Please explain why you wish to cancel this order..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minimum 5 characters required. Your reason will be saved in your order record.
              </p>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        {!successMsg && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={loading || !finalReasonText || finalReasonText.length < 5}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
