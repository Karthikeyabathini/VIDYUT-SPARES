'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ShieldAlert } from 'lucide-react';
import { getCart } from '@/lib/actions/cartActions';
import { getCurrentUserProfile, logoutUser } from '@/lib/actions/authActions';
import { UserProfile } from '@/types';

import VidyutLogo from '@/components/common/VidyutLogo';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadHeaderState() {
      const profile = await getCurrentUserProfile();
      setUser(profile);

      const cartData = await getCart();
      const count = cartData.items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    }
    loadHeaderState();
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

  return (
    <header className="sticky top-0 z-50 bg-[#0F2C59] text-white shadow-md border-b border-blue-950">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center font-medium border-b border-slate-800">
        ⚡ Official Electrical Spares Supplier | Vijayawada, Andhra Pradesh | Call Support: <a href="tel:9440146599" className="text-amber-400 hover:underline font-semibold">9440146599</a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <VidyutLogo variant="header" priority />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors block leading-tight">
                VIDYUT SPARES
              </span>
              <span className="text-[10px] tracking-wider text-slate-300 uppercase font-semibold block">
                Electrical Products & Spares
              </span>
            </div>
          </Link>

          {/* DESKTOP SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8">
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
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-slate-200 hover:text-amber-400 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#0F2C59]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Admin Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-semibold bg-blue-900/60 hover:bg-blue-900 py-1.5 px-3 rounded-lg border border-blue-700 text-white transition-colors"
                >
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
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

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 text-white placeholder-slate-400 text-sm border border-slate-700 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          <nav className="flex flex-col gap-3 font-medium text-slate-200 pt-2 border-t border-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-400 py-1"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-400 py-1"
            >
              Products
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-400 py-1"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-400 py-1"
            >
              Contact
            </Link>
            {!user && (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-1/2 text-center text-sm font-semibold bg-slate-800 text-white py-2 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-1/2 text-center text-sm font-semibold bg-amber-500 text-slate-950 py-2 rounded-lg font-bold"
                  >
                    Register
                  </Link>
                </div>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-bold bg-slate-950 text-amber-400 py-2.5 rounded-lg border border-amber-400/40 flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="h-4 w-4" /> Store Admin Portal Login
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
