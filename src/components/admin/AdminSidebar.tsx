'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Package,
  FolderTree,
  ShoppingBag,
  CreditCard,
  History,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { logoutUser } from '@/lib/actions/authActions';
import VidyutLogo from '@/components/common/VidyutLogo';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      window.location.href = '/';
    }
  };

  const menu = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Payment Verification', href: '/admin/payments', icon: CheckSquare, badge: 'QUEUE' },
    { label: 'Products & Stock', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Order Processing', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Payment Methods', href: '/admin/payment-methods', icon: CreditCard },
    { label: 'Business History', href: '/admin/history', icon: FileSpreadsheet },
    { label: 'Audit Logs & Settings', href: '/admin/settings', icon: ShieldCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full text-slate-300">
      <div>
        {/* LOGO BRANDING */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VidyutLogo variant="admin" priority />
            <div>
              <span className="font-extrabold text-sm text-white block tracking-tight">
                VIDYUT SPARES
              </span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Admin Portal
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>

        {/* NAVIGATION MENU */}
        <nav className="p-4 space-y-1.5 text-xs font-semibold">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#0F2C59] text-white font-extrabold shadow-sm border border-blue-900'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
        >
          Return to Customer Store
        </Link>
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" /> {loggingOut ? 'Signing Out...' : 'Admin Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:block w-64 bg-slate-900 h-screen sticky top-0 border-r border-slate-800 shrink-0">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          />
          <aside className="fixed top-0 bottom-0 left-0 w-[82%] max-w-xs bg-slate-900 shadow-2xl border-r border-slate-800 z-50 animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
