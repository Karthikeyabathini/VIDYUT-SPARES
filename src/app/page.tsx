import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getProducts } from '@/lib/actions/productActions';
import ProductCard from '@/components/customer/ProductCard';
import { ShieldCheck, Truck, Zap, Headphones, ArrowRight } from 'lucide-react';
import VidyutLogo from '@/components/common/VidyutLogo';

export const revalidate = 0;

export default async function HomePage() {
  const categories = await getCategories();
  const featuredProducts = await getProducts({ sortBy: 'newest' });

  return (
    <div className="space-y-12 pb-16">
      {/* HERO BANNER SECTION */}
      <section className="relative bg-[#0F2C59] text-white py-16 lg:py-24 overflow-hidden border-b border-blue-950">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-400/30">
                <Zap className="h-4 w-4 fill-amber-400" /> Official Electrical Store Vijayawada
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Your Trusted Electrical Spares Partner
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Quality electrical products and reliable service for homes, businesses and electrical professionals in Tarapet, Vijayawada.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg transition-colors text-sm"
                >
                  Shop Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900/80 hover:bg-slate-900 text-white font-semibold px-7 py-3.5 rounded-xl border border-slate-700 transition-colors text-sm"
                >
                  Contact Store
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-slate-900/80 p-8 rounded-3xl border-2 border-amber-400/80 shadow-2xl backdrop-blur flex items-center justify-center">
                <VidyutLogo variant="lg" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#0F2C59] rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">100% Genuine Brands</h4>
              <p className="text-xs text-slate-500">Havells, Polycab, Legrand, Anchor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Fast Local Delivery</h4>
              <p className="text-xs text-slate-500">Vijayawada & AP wide shipping</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Transparent Invoicing</h4>
              <p className="text-xs text-slate-500">Official tax bill on every order</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Direct Phone Support</h4>
              <p className="text-xs text-slate-500">Call 9440146599 for order help</p>
            </div>
          </div>
        </div>
      </section>



      {/* FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Electrical Products
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              In-stock spare parts, switches, wires, and protection breakers
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
          >
            View Entire Catalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <p className="text-slate-500 text-sm">Products are loading from database seed...</p>
          </div>
        )}
      </section>

      {/* STORE LOCATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F2C59] text-white p-8 rounded-2xl shadow-md border border-blue-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-amber-400">
              Visit VIDYUT SPARES Store in Tarapet, Vijayawada
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              11-39-15, Katurivari St, Beside 1 Town Police Station, Tarapet, Vijayawada, Andhra Pradesh 520001
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:9440146599"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-5 py-3 rounded-xl transition-colors"
            >
              Call 9440146599
            </a>
            <Link
              href="/contact"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-colors"
            >
              View Map & Hours
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
