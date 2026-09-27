'use client';

import React, { useState } from 'react';
import { StoreConfig } from '@/types';
import { updateStoreConfig } from '@/lib/actions/adminActions';
import { X, Save, Building2, Phone, Mail, MapPin, FileText, Clock, Loader2 } from 'lucide-react';

interface EditStoreProfileModalProps {
  initialConfig: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditStoreProfileModal({
  initialConfig,
  isOpen,
  onClose,
  onSaved,
}: EditStoreProfileModalProps) {
  const [formData, setFormData] = useState<StoreConfig>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof StoreConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await updateStoreConfig(formData);
      if (res.success) {
        setSuccessMsg('Store Profile configuration saved successfully! Website updated.');
        setTimeout(() => {
          onSaved();
          onClose();
        }, 1000);
      } else {
        setError(res.error || 'Failed to update Store Profile Config.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* MODAL HEADER */}
        <div className="bg-[#0F2C59] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-amber-400" />
            <h2 className="font-extrabold text-base tracking-tight">Edit Store Profile Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold">
              ✅ {successMsg}
            </div>
          )}

          {/* Business Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-900" /> Business / Store Name
            </label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => handleChange('business_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] text-slate-900 font-semibold"
              placeholder="e.g. VIDYUT SPARES"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Phone */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-900" /> Customer Care Phone
              </label>
              <input
                type="text"
                required
                value={formData.store_phone}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] text-slate-900 font-semibold"
                placeholder="e.g. 9440146599"
              />
            </div>

            {/* Store Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-900" /> Official Email Address
              </label>
              <input
                type="email"
                required
                value={formData.store_email}
                onChange={(e) => handleChange('store_email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] text-slate-900 font-semibold"
                placeholder="e.g. vidyutspares@gmail.com"
              />
            </div>
          </div>

          {/* Store Address */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-900" /> Official Store Address
            </label>
            <textarea
              required
              rows={3}
              value={formData.store_address}
              onChange={(e) => handleChange('store_address', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] text-slate-900 font-medium leading-relaxed"
              placeholder="Full shop address including landmark, city, state and pincode"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GSTIN Number */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-900" /> GSTIN Number (Optional)
              </label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] text-slate-900 font-mono"
                placeholder="e.g. 37AAAAA0000A1Z5"
              />
            </div>

            {/* Support Hours */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-900" /> Support / Store Hours
              </label>
              <input
                type="text"
                value={formData.support_hours || ''}
                onChange={(e) => handleChange('support_hours', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] text-slate-900"
                placeholder="e.g. Mon - Sat: 9:00 AM - 8:30 PM (IST)"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-blue-900 text-white font-extrabold flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-amber-400" /> Save Profile & Update Website
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
