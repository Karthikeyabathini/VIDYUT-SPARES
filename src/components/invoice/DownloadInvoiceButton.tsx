'use client';

import React, { useState } from 'react';
import { Download, Loader2, Lock } from 'lucide-react';
import { verifyInvoiceAccess } from '@/lib/actions/invoiceActions';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DownloadInvoiceButtonProps {
  invoiceOrOrderId: string;
  invoiceNumber?: string;
  orderStatus?: string;
  isAdmin?: boolean;
  className?: string;
}

export default function DownloadInvoiceButton({
  invoiceOrOrderId,
  invoiceNumber,
  orderStatus,
  isAdmin = false,
  className = '',
}: DownloadInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const normalizedStatus = (orderStatus || '').toUpperCase();
  const isDelivered = normalizedStatus === 'DELIVERED';
  const canDownload = isAdmin || isDelivered;

  const handleDownload = async () => {
    if (!canDownload) {
      alert('Invoice is available for download only after the order has been delivered.');
      return;
    }

    setLoading(true);

    try {
      // 1. Perform server-side security authorization check
      const authRes = await verifyInvoiceAccess(invoiceOrOrderId);
      if (!authRes.authorized || !authRes.invoice) {
        alert(authRes.error || 'Access Denied: You are not authorized to download this invoice.');
        setLoading(false);
        return;
      }

      const invoice = authRes.invoice;
      const targetInvoiceNum = invoice.invoice_number || invoiceNumber || 'INVOICE';

      // 2. Check if invoice document element is already rendered on screen
      let docElement = document.getElementById('official-invoice-document');
      let createdContainer: HTMLDivElement | null = null;

      // If not rendered on screen, create temporary off-screen container for html2canvas
      if (!docElement) {
        const { default: OfficialInvoiceView } = await import('./OfficialInvoiceView');
        const ReactDOMServer = (await import('react-dom/server')).default;
        const htmlString = ReactDOMServer.renderToString(<OfficialInvoiceView invoice={invoice} />);

        createdContainer = document.createElement('div');
        createdContainer.style.position = 'fixed';
        createdContainer.style.left = '-9999px';
        createdContainer.style.top = '0';
        createdContainer.style.width = '794px';
        createdContainer.innerHTML = htmlString;
        document.body.appendChild(createdContainer);
        docElement = createdContainer.querySelector('#official-invoice-document') || createdContainer;

        // Give browser DOM layout engine time to paint and compute styles
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      // 3. Find all discrete A4 page containers
      const pageElements = Array.from(docElement.querySelectorAll('.a4-page-container')) as HTMLElement[];
      const targets = pageElements.length > 0 ? pageElements : [docElement as HTMLElement];

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // 4. Render each A4 page container individually into the PDF
      for (let i = 0; i < targets.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(targets[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const allA4 = clonedDoc.querySelectorAll('.a4-page-container');
            allA4.forEach((el) => {
              (el as HTMLElement).style.margin = '0';
              (el as HTMLElement).style.boxShadow = 'none';
              (el as HTMLElement).style.border = 'none';
            });
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      if (createdContainer) {
        document.body.removeChild(createdContainer);
      }

      const cleanNum = targetInvoiceNum.replace(/[/]/g, '-');
      pdf.save(`VIDYUT-SPARES-Invoice-${cleanNum}.pdf`);
    } catch (err: any) {
      console.error('Invoice download error:', err);
      alert('Failed to generate PDF invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!canDownload) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed shadow-none">
        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Invoice available after delivery</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 text-amber-400 shrink-0" /> Download Invoice
        </>
      )}
    </button>
  );
}
