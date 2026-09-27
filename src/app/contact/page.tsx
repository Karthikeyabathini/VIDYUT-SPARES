import React from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, FileText } from 'lucide-react';
import { getStoreConfig } from '@/lib/actions/adminActions';

export const revalidate = 0;

export default async function ContactPage() {
  const storeConfig = await getStoreConfig();

  const businessName = storeConfig?.business_name || 'VIDYUT SPARES';
  const phone = storeConfig?.store_phone || '9440146599';
  const email = storeConfig?.store_email || 'vidyutspares@gmail.com';
  const address = storeConfig?.store_address || '11-39-15, Katurivari St, Beside 1 Town Police Station, Tarapet, Vijayawada, Andhra Pradesh 520001, India';
  const supportHours = storeConfig?.support_hours || 'Mon - Sat: 9:00 AM - 8:30 PM (IST)';
  const gstin = storeConfig?.gstin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-[#0F2C59] tracking-tight">Contact {businessName}</h1>
            <p className="text-xs text-slate-500">Official electrical store address & customer care hotline</p>
          </div>
          <div className="relative w-16 h-16 rounded-xl bg-white p-1 border-2 border-amber-400 shrink-0 shadow-sm flex items-center justify-center">
            <Image src="/vs-logo.jpeg" alt={`${businessName} Logo`} fill className="object-contain" priority />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* CONTACT INFO */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <MapPin className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Store Address</h3>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Phone className="h-5 w-5 text-[#0F2C59] shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Customer Care Phone</h3>
                  <a href={`tel:${phone}`} className="text-amber-700 font-extrabold text-sm hover:underline block">
                    +91 {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Official Email</h3>
                  <a href={`mailto:${email}`} className="text-slate-700 font-semibold hover:underline block">
                    {email}
                  </a>
                </div>
              </div>

              {gstin && (
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <FileText className="h-5 w-5 text-purple-600 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">GSTIN Number</h3>
                    <p className="text-slate-900 font-mono font-bold">{gstin}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`tel:${phone}`}
                className="w-1/2 text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-sm transition-colors text-xs"
              >
                Call Store Now
              </a>
              <a
                href={`mailto:${email}`}
                className="w-1/2 text-center bg-[#0F2C59] hover:bg-blue-900 text-white font-bold py-3 rounded-xl shadow-sm transition-colors text-xs"
              >
                Send Email
              </a>
            </div>
          </div>

          {/* STORE HOURS & HIGHLIGHTS */}
          <div className="bg-[#0F2C59] text-white p-6 rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-blue-900 pb-3">
                <Clock className="h-5 w-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">Store Operating Hours</h3>
              </div>

              <ul className="space-y-2 text-slate-300 text-xs">
                <li className="flex justify-between border-b border-blue-900/50 pb-1">
                  <span>Support Hours:</span>
                  <span className="font-bold text-amber-400">{supportHours}</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span>Online Order Processing:</span>
                  <span className="font-bold text-emerald-400">24/7 Available</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="h-4 w-4" /> Official Electrical Store
              </div>
              <p className="text-[11px] leading-tight">
                Store pickup options and tax invoice copies available at counter during working hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
