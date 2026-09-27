import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { verifyInvoiceAccess } from '@/lib/actions/invoiceActions';
import { getStoreConfig } from '@/lib/actions/adminActions';
import OfficialInvoiceView from '@/components/invoice/OfficialInvoiceView';
import DownloadInvoiceButton from '@/components/invoice/DownloadInvoiceButton';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const [authRes, storeConfig] = await Promise.all([
    verifyInvoiceAccess(id),
    getStoreConfig(),
  ]);

  if (!authRes.authorized || !authRes.invoice) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 shadow-sm space-y-3">
          <ShieldAlert className="h-10 w-10 text-red-600 mx-auto" />
          <h1 className="text-xl font-extrabold tracking-tight">Invoice Access Restricted</h1>
          <p className="text-xs text-red-800 font-medium">
            {authRes.error || 'You do not have authorization to view or download this invoice.'}
          </p>
        </div>
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0F2C59] text-white px-5 py-2.5 rounded-xl hover:bg-blue-900 shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const invoice = authRes.invoice;
  const order = invoice.order;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* NO-PRINT HEADER ACTIONS */}
      <div className="no-print flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-md">
        <Link
          href="/account/orders"
          className="text-xs font-bold text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <DownloadInvoiceButton
          invoiceOrOrderId={id}
          invoiceNumber={invoice.invoice_number}
          orderStatus={order?.order_status}
          isAdmin={true}
        />
      </div>

      {/* OFFICIAL INVOICE VIEW */}
      <div className="overflow-x-auto pb-6">
        <OfficialInvoiceView invoice={invoice} storeConfig={storeConfig} />
      </div>
    </div>
  );
}

