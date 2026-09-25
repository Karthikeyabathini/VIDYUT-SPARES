'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/actions/authActions';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import VidyutLogo from '@/components/common/VidyutLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAdmin({ email, password });
    setLoading(false);

    if (res.success) {
      window.location.href = '/admin';
    } else {
      setError(res.error || 'Admin authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-slate-700 p-8 rounded-2xl shadow-2xl space-y-6 text-slate-100">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <VidyutLogo variant="auth" priority />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">VIDYUT SPARES</h1>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mt-1">
              Admin Portal Sign In
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/90 border border-red-700 text-red-200 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="font-bold text-slate-200 block mb-1.5 text-xs">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Enter admin email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#020617] border-2 border-slate-700 text-white font-bold text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all dark-input"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-200 block mb-1.5 text-xs">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#020617] border-2 border-slate-700 text-white font-bold text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all dark-input"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Protected & Authorized Administrator Portal
        </div>
      </div>
    </div>
  );
}
