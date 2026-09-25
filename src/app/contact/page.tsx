import React from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-[#0F2C59] tracking-tight">Contact VIDYUT SPARES</h1>
            <p className="text-xs text-slate-500">Official electrical store address & customer care hotline</p>
          </div>
          <div className="relative w-16 h-16 rounded-xl bg-white p-1 border-2 border-amber-400 shrink-0 shadow-sm flex items-center justify-center">
            <Image src="/vs-logo.jpeg" alt="VIDYUT SPARES Logo" fill className="object-contain" priority />
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
                    11-39-15, Katurivari St, Beside 1 Town Police Station, Tarapet, Vijayawada, Andhra Pradesh 520001, India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Phone className="h-5 w-5 text-[#0F2C59] shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Customer Care Phone</h3>
                  <a href="tel:9440146599" className="text-amber-700 font-extrabold text-sm hover:underline block">
                    +91 9440146599
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Official Email</h3>
                  <a href="mailto:vidyutspares@gmail.com" className="text-slate-700 font-semibold hover:underline block">
                    vidyutspares@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="tel:9440146599"
                className="w-1/2 text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-sm transition-colors text-xs"
              >
                Call Store Now
              </a>
              <a
                href="mailto:vidyutspares@gmail.com"
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
                  <span>Monday - Saturday:</span>
                  <span className="font-bold text-white">9:00 AM - 8:30 PM</span>
                </li>
                <li className="flex justify-between border-b border-blue-900/50 pb-1">
                  <span>Sunday:</span>
                  <span className="font-bold text-amber-400">10:00 AM - 2:00 PM</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span>Online Order Processing:</span>
                  <span className="font-bold text-emerald-400">24/7 Available</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="h-4 w-4" /> Tarapet Electrical Hub
              </div>
              <p className="text-[11px] leading-tight">
                Located right beside the 1 Town Police Station in Tarapet. Pickup options and invoice copies available at counter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
