'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerCustomer } from '@/lib/actions/authActions';
import { User, Mail, Phone, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import VidyutLogo from '@/components/common/VidyutLogo';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/account';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await registerCustomer(form);
    setLoading(false);

    if (res.success) {
      window.location.href = redirectTo;
    } else {
      setError(res.error || 'Failed to register account');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {redirectTo.includes('checkout') && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 p-4 rounded-xl font-medium space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <span>Create an account to complete your order.</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Your cart items will be automatically saved to your new account.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="name"
                suppressHydrationWarning
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                suppressHydrationWarning
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mobile Phone *</label>
            <div className="relative">
              <input
                type="tel"
                required
                autoComplete="tel"
                suppressHydrationWarning
                placeholder="Mobile Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="new-password"
                suppressHydrationWarning
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Customer Account'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#0F2C59] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    );
  }

export default function CustomerRegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <VidyutLogo variant="auth" priority />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] tracking-tight">Register New Account</h1>
          <p className="text-xs text-slate-500">Create a customer account to order electrical spares</p>
        </div>

        <Suspense fallback={<div className="text-xs text-slate-400 text-center py-4">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
