'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, ShieldAlert } from 'lucide-react';
import VidyutLogo from '@/components/common/VidyutLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // On /admin/login, render clean full-screen login view without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar isOpen={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Admin Navigation"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2C59] tracking-tight flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="truncate">VIDYUT SPARES Store Administration</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
                Tarapet, Vijayawada • Store Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">Database </span>Live
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
