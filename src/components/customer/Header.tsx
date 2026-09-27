'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ShieldAlert } from 'lucide-react';
import { getCart } from '@/lib/actions/cartActions';
import { getCurrentUserProfile, logoutUser } from '@/lib/actions/authActions';
import { getStoreConfig } from '@/lib/actions/adminActions';
import { UserProfile, StoreConfig } from '@/types';

import VidyutLogo from '@/components/common/VidyutLogo';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const refreshCartCount = async () => {
    try {
      const cartData = await getCart();
      const count = cartData.items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    } catch {
      // Ignore count fetch error
    }
  };

  useEffect(() => {
    async function loadHeaderState() {
      const [profile, config] = await Promise.all([
        getCurrentUserProfile(),
        getStoreConfig(),
      ]);
      setUser(profile);
      setStoreConfig(config);
      await refreshCartCount();
    }
    loadHeaderState();

    const handleCartUpdated = () => {
      refreshCartCount();
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setUserDropdownOpen(false);
    window.location.href = '/';
  };

  const phoneDisplay = storeConfig?.store_phone || '9440146599';
  const businessName = storeConfig?.business_name || 'VIDYUT SPARES';

  return (
    <header className="sticky top-0 z-50 bg-[#0F2C59] text-white shadow-md border-b border-blue-950">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium border-b border-slate-800 truncate">
        ⚡ Official Electrical Spares Supplier | Support: <a href={`tel:${phoneDisplay}`} className="text-amber-400 hover:underline font-semibold">{phoneDisplay}</a>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[64px] sm:h-20 py-2 sm:py-0 gap-2">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <VidyutLogo variant="header" priority />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-lg md:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors block leading-tight whitespace-nowrap">
                {businessName}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider text-slate-300 uppercase font-semibold hidden sm:block">
                Electrical Products & Spares
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search spare parts, switches, MCBs, wires, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/60 text-white placeholder-slate-400 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-slate-900"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </form>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-amber-400 transition-colors">
              Products
            </Link>
            <Link href="/about" className="hover:text-amber-400 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-amber-400 transition-colors">
              Contact
            </Link>
          </nav>

          {/* USER & CART ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1.5 sm:p-2 text-slate-200 hover:text-amber-400 transition-colors" title="Shopping Cart">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-[11px] font-extrabold h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center border-2 border-[#0F2C59] animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Admin Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-blue-900/60 hover:bg-blue-900 py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg border border-blue-700 text-white transition-colors"
                >
                  <User className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="max-w-[65px] sm:max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-sm text-slate-200">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {user.role === 'ADMIN' && (
                        <span className="inline-block mt-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-amber-400 hover:bg-slate-800 font-semibold"
                      >
                        <ShieldAlert className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-800"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-800"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/invoices"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-800"
                    >
                      My Invoices
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800 border-t border-slate-800"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-200 hover:text-white px-3 py-1.5 rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
                <Link
                  href="/admin/login"
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-950 text-amber-400 border border-amber-400/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Admin Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          />

          {/* Off-canvas panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-slate-900 text-white shadow-2xl border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto z-50 animate-slide-in-right">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <VidyutLogo variant="header" priority />
                  <span className="font-extrabold text-base tracking-tight text-white">
                    VIDYUT SPARES
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  aria-label="Close Mobile Navigation"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search spare parts, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 text-white placeholder-slate-400 text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </form>

              {/* Main Navigation Links */}
              <nav className="flex flex-col space-y-1 font-semibold text-sm">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
                >
                  Home Page
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
                >
                  Electrical Products
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
                >
                  Contact Store
                </Link>
              </nav>

              {/* User Account / Navigation Section */}
              {user ? (
                <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                  <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <p className="font-extrabold text-white text-sm">{user.name}</p>
                    <p className="text-slate-400 font-medium text-xs">{user.email}</p>
                    {user.role === 'ADMIN' && (
                      <span className="inline-block bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        ADMINISTRATOR
                      </span>
                    )}
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold border border-amber-500/30"
                    >
                      <ShieldAlert className="h-4 w-4" /> Go to Admin Portal
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 font-medium"
                  >
                    My Profile & Dashboard
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 font-medium"
                  >
                    My Orders & Tracking
                  </Link>
                  <Link
                    href="/account/invoices"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 font-medium"
                  >
                    Tax Invoices & Downloads
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-950/50 text-red-400 font-bold border border-red-900/40 transition-colors"
                  >
                    Sign Out Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center font-bold bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 transition-colors"
                  >
                    Customer Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl shadow-md transition-colors"
                  >
                    Register New Account
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-xs font-bold bg-slate-950 hover:bg-black text-amber-400 py-3 rounded-xl border border-amber-400/40 flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShieldAlert className="h-4 w-4" /> Admin Portal Sign In
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
              ⚡ VIDYUT SPARES • Vijayawada
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
