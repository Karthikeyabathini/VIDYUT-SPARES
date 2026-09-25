'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function InvoicePrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
    >
      <Printer className="h-4 w-4" /> Print / Save PDF Invoice
    </button>
  );
}
