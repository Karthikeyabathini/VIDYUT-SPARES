'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import VidyutLogo from '@/components/common/VidyutLogo';
import { getStoreConfig } from '@/lib/actions/adminActions';
import { StoreConfig } from '@/types';

export default function Footer() {
  const pathname = usePathname();
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getStoreConfig();
        setStoreConfig(config);
      } catch {
        // Fallback to default
      }
    }
    loadConfig();
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const businessName = storeConfig?.business_name || 'VIDYUT SPARES';
  const phone = storeConfig?.store_phone || '9440146599';
  const email = storeConfig?.store_email || 'vidyutspares@gmail.com';
  const address = storeConfig?.store_address || '11-39-15, Katurivari St, Beside 1 Town Police Station, Tarapet, Vijayawada, Andhra Pradesh 520001, India';

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* BRAND COL */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <VidyutLogo variant="footer" showText textClassName="font-extrabold text-lg text-white tracking-tight" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your trusted electrical spares partner supplying genuine switches, copper wires, circuit breakers, LED lights, and industrial installation components.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-slate-900 p-2.5 rounded-lg border border-slate-800 w-fit">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Official Genuine Spares Supplier
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  Electrical Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About {businessName}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Store
                </Link>
              </li>
            </ul>
          </div>

          {/* CUSTOMER LINKS */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Customer Account
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account" className="hover:text-amber-400 transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-amber-400 transition-colors">
                  Order Tracking & History
                </Link>
              </li>
              <li>
                <Link href="/account/invoices" className="hover:text-amber-400 transition-colors">
                  Tax Invoices & Downloads
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  Store Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Store Contact
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white font-semibold">
                  +91 {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} {businessName}. All Rights Reserved.</p>
          <p className="text-slate-600">Official E-Commerce Store</p>
        </div>
      </div>
    </footer>
  );
}
