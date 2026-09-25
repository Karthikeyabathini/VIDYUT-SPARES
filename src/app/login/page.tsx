'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/actions/authActions';
import { Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import VidyutLogo from '@/components/common/VidyutLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginUser({ email, password });
    setLoading(false);

    if (res.success) {
      window.location.href = redirectTo;
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {redirectTo.includes('checkout') && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 p-4 rounded-xl font-medium space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <span>Please sign in or create an account to purchase products.</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Guest purchasing is disabled to protect your orders, invoices, and delivery addresses.
          </p>
          <div className="flex gap-2 pt-1">
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px]">
              Sign In Below
            </span>
            <Link
              href={`/register?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="px-3 py-1 bg-white border border-amber-400 text-amber-950 font-bold rounded-lg text-[11px] hover:bg-amber-100"
            >
              Create Account Instead
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="font-bold text-slate-700 block mb-1">Email Address</label>
        <div className="relative">
          <input
            type="email"
            required
            autoComplete="email"
            suppressHydrationWarning
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-[#0F2C59]"
          />
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div>
        <label className="font-bold text-slate-700 block mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            suppressHydrationWarning
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-[#0F2C59]"
          />
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        suppressHydrationWarning
        className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#0F2C59] hover:bg-blue-900 text-white flex items-center justify-center gap-2 shadow-md transition-colors"
      >
        {loading ? 'Signing In...' : 'Sign In as Customer'} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <VidyutLogo variant="auth" priority />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] tracking-tight">Customer Sign In</h1>
          <p className="text-xs text-slate-500">Sign in to track orders, manage addresses, and view invoices</p>
        </div>

        <Suspense fallback={<div className="text-xs text-slate-400 text-center py-4">Loading login form...</div>}>
          <LoginForm />
        </Suspense>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 space-y-3">
          <div>
            Don&apos;t have a customer account?{' '}
            <Link href="/register" className="font-bold text-[#0F2C59] hover:underline">
              Register Here
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 mb-1.5 font-semibold">Store Management Access</p>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl border border-amber-300 w-full transition-colors shadow-sm"
            >
              <ShieldAlert className="h-4 w-4 text-amber-600" /> Admin Portal Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
