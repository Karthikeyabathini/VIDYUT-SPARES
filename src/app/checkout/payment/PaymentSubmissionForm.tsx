'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, PaymentMethod } from '@/types';
import { submitPaymentProof } from '@/lib/actions/paymentActions';
import { uploadPaymentProofImage } from '@/lib/actions/storageActions';
import { Upload, CheckCircle2, ShieldAlert, ArrowRight, FileImage } from 'lucide-react';

interface PaymentSubmissionFormProps {
  order: Order;
  paymentMethods: PaymentMethod[];
}

export default function PaymentSubmissionForm({ order, paymentMethods }: PaymentSubmissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    payment_method: paymentMethods[0]?.display_name || 'PhonePe / UPI',
    amount: order.total_amount,
    utr_number: '',
    proof_file_url: '',
    payer_name: '',
    payer_phone: '',
    payment_date: todayStr,
    payment_time: nowTimeStr,
    customer_note: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limits');
        return;
      }

      // Convert file to Base64 data URL for reliable proof verification storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProofPreview(result);
        setForm((prev) => ({ ...prev, proof_file_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.utr_number.trim()) {
      alert('Please enter your 12-digit UTR / Transaction Reference Number');
      return;
    }

    if (!form.proof_file_url) {
      alert('Please upload your payment receipt screenshot.');
      return;
    }

    setLoading(true);

    let finalProofUrl = form.proof_file_url;
    if (form.proof_file_url && form.proof_file_url.startsWith('data:image')) {
      const uploadRes = await uploadPaymentProofImage(form.proof_file_url, `utr_${form.utr_number.trim()}`);
      if (uploadRes.success && uploadRes.data) {
        finalProofUrl = uploadRes.data;
      }
    }

    const res = await submitPaymentProof({
      order_id: order.id,
      payment_method: form.payment_method,
      amount: form.amount,
      utr_number: form.utr_number.trim(),
      proof_file_url: finalProofUrl,
      payer_name: form.payer_name || undefined,
      payer_phone: form.payer_phone || undefined,
      payment_date: form.payment_date,
      payment_time: form.payment_time,
      customer_note: form.customer_note || undefined,
    });

    setLoading(false);

    if (res.success) {
      router.push(`/order-success?orderId=${order.id}&paymentStatus=submitted`);
    } else {
      alert(res.error || 'Failed to submit payment proof');
    }
  };

  return (
    <form onSubmit={handleSubmitProof} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#0F2C59]" /> Submit Payment Verification Details
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter transaction UTR and upload receipt screenshot after external UPI transfer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* PAYMENT METHOD SELECTION */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Payment Method Used *</label>
          <select
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
          >
            {paymentMethods.map((m) => (
              <option key={m.id} value={m.display_name}>
                {m.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* UTR NUMBER (REQUIRED) */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            UTR / Transaction Reference Number *
          </label>
          <input
            type="text"
            required
            placeholder="12-digit UTR number"
            value={form.utr_number}
            onChange={(e) => setForm({ ...form, utr_number: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 uppercase"
          />
        </div>

        {/* PAID AMOUNT */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Amount Paid (₹) *</label>
          <input
            type="number"
            required
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 bg-slate-50"
          />
        </div>

        {/* PAYMENT DATE & TIME */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Payment Date *</label>
            <input
              type="date"
              required
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Payment Time *</label>
            <input
              type="time"
              required
              value={form.payment_time}
              onChange={(e) => setForm({ ...form, payment_time: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* OPTIONAL PAYER DETAILS */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">Payer Name (Optional)</label>
          <input
            type="text"
            placeholder="Name on UPI / Bank Account"
            value={form.payer_name}
            onChange={(e) => setForm({ ...form, payer_name: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Payer Mobile (Optional)</label>
          <input
            type="text"
            placeholder="UPI registered phone number"
            value={form.payer_phone}
            onChange={(e) => setForm({ ...form, payer_phone: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
          />
        </div>

        {/* SCREENSHOT FILE UPLOAD (REQUIRED) */}
        <div className="md:col-span-2 space-y-2">
          <label className="font-bold text-slate-700 block">
            Upload Payment Receipt Screenshot *
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-[#0F2C59] rounded-xl p-4 text-center bg-slate-50 transition-colors">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
              id="proofUploadInput"
            />
            <label htmlFor="proofUploadInput" className="cursor-pointer space-y-2 block">
              <FileImage className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-[#0F2C59]">
                Click here to browse & select payment screenshot image
              </p>
              <p className="text-[10px] text-slate-400">Supported formats: JPG, JPEG, PNG, WEBP (Max 10MB)</p>
            </label>
          </div>

          {proofPreview && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 relative border border-emerald-300 rounded overflow-hidden shrink-0">
                <img src={proofPreview} alt="Payment Screenshot Preview" className="w-full h-full object-cover" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Screenshot Attached Successfully
                </p>
                <p className="text-slate-500 text-[11px]">Ready for admin verification review</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !form.proof_file_url || !form.utr_number}
        className="w-full py-4 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting Proof...' : 'Submit Payment Proof for Admin Verification'} <ArrowRight className="h-4 w-4" />
      </button>

      <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
        <span>Your order payment status will become AWAITING_VERIFICATION until manual review.</span>
      </div>
    </form>
  );
}
