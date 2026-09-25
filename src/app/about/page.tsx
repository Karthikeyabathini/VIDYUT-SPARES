import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, MapPin, Zap, Phone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-8">
          <div className="relative w-28 h-18 rounded-2xl bg-white p-2 border-2 border-amber-400 shrink-0 shadow-inner flex items-center justify-center">
            <Image src="/vs-logo.svg" alt="VIDYUT SPARES Logo" fill className="object-contain p-0.5" priority />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-[#0F2C59] tracking-tight">About VIDYUT SPARES</h1>
            <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
               Vijayawada, Andhra Pradesh • Est. Electrical Spares Supplier
            </p>
          </div>
        </div>

        <div className="prose text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>
            Welcome to <strong className="text-[#0F2C59]">VIDYUT SPARES</strong>, your premier destination for genuine electrical spare parts, switches, wiring cables, circuit protection breakers, and commercial lighting fixtures in Tarapet, Vijayawada.
          </p>
          <p>
            We take immense pride in supplying top-tier brands including <em>Havells, Polycab, Legrand, Anchor, Schneider, Finolex, and Crompton</em>. Whether you are an electrical contractor, industrial technician, or homeowner upgrading power installations, VIDYUT SPARES ensures authentic quality, fair wholesale pricing, and transparent tax invoicing on every order.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-1">
            <ShieldCheck className="h-5 w-5 text-[#0F2C59]" />
            <h3 className="font-bold text-slate-900">Genuine Guarantee</h3>
            <p className="text-slate-600 text-[11px]">100% original manufacturer electrical products with valid warranty.</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-1">
            <MapPin className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-slate-900">Vijayawada Location</h3>
            <p className="text-slate-600 text-[11px]">Situated beside 1 Town Police Station in Tarapet for easy pickup.</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-1">
            <Zap className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Fast Order Processing</h3>
            <p className="text-slate-600 text-[11px]">Prompt verification of online payments and rapid local dispatch.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
