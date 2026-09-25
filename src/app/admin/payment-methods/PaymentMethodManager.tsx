'use client';

import React, { useState } from 'react';
import { PaymentMethod } from '@/types';
import { createPaymentMethod, togglePaymentMethodActive, deletePaymentMethod } from '@/lib/actions/adminActions';
import { uploadProductImage } from '@/lib/actions/storageActions';
import { Plus, CheckCircle2, QrCode, Phone, Building2, Trash2 } from 'lucide-react';

export default function PaymentMethodManager({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [qrPreview, setQrPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'UPI_NUMBER' as const,
    display_name: '',
    provider: 'PhonePe',
    upi_id: '',
    phone_number: '',
    qr_image_url: '',
    instructions: '',
    is_active: true,
    sort_order: 1,
  });

  const handleToggle = async (id: string, currentActive: boolean) => {
    const nextActive = !currentActive;
    const res = await togglePaymentMethodActive(id, nextActive);
    if (res.success) {
      setMethods(
        methods.map((m) => (m.id === id ? { ...m, is_active: nextActive } : m))
      );
    } else {
      alert(res.error || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete payment method "${displayName}"?`)) {
      return;
    }
    const res = await deletePaymentMethod(id);
    if (res.success) {
      setMethods(methods.filter((m) => m.id !== id));
    } else {
      alert(res.error || 'Failed to delete payment method');
    }
  };

  const handleQRFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('QR code image file size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setQrPreview(result);
        setForm((prev) => ({ ...prev, qr_image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.display_name.trim()) return;

    setLoading(true);

    let finalQrUrl = form.qr_image_url;
    if (form.qr_image_url && form.qr_image_url.startsWith('data:image')) {
      const uploadRes = await uploadProductImage(form.qr_image_url, `qr_${Date.now()}`);
      if (uploadRes.success && uploadRes.data) {
        finalQrUrl = uploadRes.data;
      }
    }

    const payload = {
      ...form,
      qr_image_url: finalQrUrl,
    };

    const res = await createPaymentMethod(payload);
    setLoading(false);

    if (res.success && res.data) {
      setMethods([...methods, res.data]);
      setShowAddForm(false);
      setQrPreview(null);
      setForm({
        type: 'UPI_NUMBER',
        display_name: '',
        provider: 'PhonePe',
        upi_id: '',
        phone_number: '',
        qr_image_url: '',
        instructions: '',
        is_active: true,
        sort_order: 1,
      });
    } else {
      alert(res.error || 'Failed to add payment method');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-extrabold text-slate-900 text-sm">
          Active Payment Receiving Options ({methods.filter((m) => m.is_active).length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" /> Add Payment Channel
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h4 className="font-extrabold text-[#0F2C59] text-sm uppercase tracking-wider">Configure New Receiving Method</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              >
                <option value="UPI_NUMBER">UPI Number (PhonePe / GPay)</option>
                <option value="UPI_QR">UPI QR Code Scan</option>
                <option value="BANK_TRANSFER">Bank Account Transfer</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Display Title *</label>
              <input
                type="text"
                required
                placeholder="Channel Title"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">Payment Number (Optional)</label>
              <input
                type="text"
                placeholder="Payment Phone Number"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            {/* QR CODE FILE UPLOAD */}
            <div className="sm:col-span-2 space-y-2">
              <label className="font-bold text-slate-700 block">Upload Admin QR Code Image (Optional)</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#0F2C59] rounded-xl p-4 text-center bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleQRFileUpload}
                  className="hidden"
                  id="adminQrImageUploadInput"
                />
                <label htmlFor="adminQrImageUploadInput" className="cursor-pointer space-y-2 block">
                  <QrCode className="h-8 w-8 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-[#0F2C59]">
                    Click here to browse & upload admin QR Code image from device
                  </p>
                  <p className="text-[10px] text-slate-400">Supported formats: PhonePe / GPay / Paytm QR Code (JPG, PNG, WEBP)</p>
                </label>
              </div>

              {qrPreview && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
                  <div className="w-16 h-16 relative border border-emerald-300 rounded overflow-hidden shrink-0 bg-white p-1">
                    <img src={qrPreview} alt="QR Code Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Admin QR Code Attached
                    </p>
                    <p className="text-slate-500 text-[11px]">Will be displayed to customers during online payment checkout</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold block mb-1">Customer Instructions</label>
              <input
                type="text"
                placeholder="Transfer order total and submit UTR number"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg font-semibold bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg font-bold bg-[#0F2C59] text-white"
            >
              Save Payment Channel
            </button>
          </div>
        </form>
      )}

      {/* METHODS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`p-6 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between ${
              method.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {method.type === 'UPI_QR' ? (
                    <QrCode className="h-5 w-5 text-amber-600 shrink-0" />
                  ) : method.type === 'UPI_NUMBER' ? (
                    <Phone className="h-5 w-5 text-[#0F2C59] shrink-0" />
                  ) : (
                    <Building2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                  <h4 className="font-extrabold text-slate-900 text-sm">{method.display_name}</h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggle(method.id, method.is_active)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      method.is_active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {method.is_active ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleDelete(method.id, method.display_name)}
                    title="Delete payment channel"
                    className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {method.phone_number && (
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-400">Phone: </span>
                  <span className="font-bold text-slate-900">{method.phone_number}</span>
                </p>
              )}

              {method.instructions && (
                <p className="text-[11px] text-slate-500 italic">&quot;{method.instructions}&quot;</p>
              )}
            </div>

            {method.qr_image_url && (
              <div className="w-28 h-28 mx-auto relative border border-slate-200 rounded p-1 bg-white">
                <img src={method.qr_image_url} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
