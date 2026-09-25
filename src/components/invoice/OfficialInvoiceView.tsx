'use client';

import React from 'react';
import { Invoice } from '@/types';
import { User, MapPin, Mail, Phone, Package, Zap, CheckCircle2, FileText } from 'lucide-react';

interface OfficialInvoiceViewProps {
  invoice: Invoice;
}

export default function OfficialInvoiceView({ invoice }: OfficialInvoiceViewProps) {
  const order = invoice.order;
  if (!order) return null;

  const address = order.address_snapshot || {};
  const items = order.items || [];

  const invoiceDateStr = invoice.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date(order.placed_at || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  // Calculate pages cleanly based on item count
  // Page 1 can comfortably accommodate up to 6 product items along with Header, Meta & Customer info
  // If items > 6, chunk remaining items into Page 2+
  const ITEMS_PAGE_1 = 6;
  const ITEMS_PAGE_N = 10;

  const pages: {
    pageIndex: number;
    totalPages: number;
    pageItems: typeof items;
    startIndex: number;
    isLastPage: boolean;
  }[] = [];

  if (items.length <= ITEMS_PAGE_1) {
    pages.push({
      pageIndex: 1,
      totalPages: 1,
      pageItems: items,
      startIndex: 0,
      isLastPage: true,
    });
  } else {
    // Page 1
    pages.push({
      pageIndex: 1,
      totalPages: 1, // updated after loop
      pageItems: items.slice(0, ITEMS_PAGE_1),
      startIndex: 0,
      isLastPage: false,
    });

    let remaining = items.slice(ITEMS_PAGE_1);
    let startIdx = ITEMS_PAGE_1;
    let pageNum = 2;

    while (remaining.length > 0) {
      const chunk = remaining.slice(0, ITEMS_PAGE_N);
      remaining = remaining.slice(ITEMS_PAGE_N);
      pages.push({
        pageIndex: pageNum,
        totalPages: 0,
        pageItems: chunk,
        startIndex: startIdx,
        isLastPage: remaining.length === 0,
      });
      startIdx += chunk.length;
      pageNum++;
    }

    const totalCount = pages.length;
    pages.forEach((p) => (p.totalPages = totalCount));
  }

  return (
    <div id="official-invoice-document" style={{ width: '794px', margin: '0 auto' }}>
      {pages.map((p) => (
        <div
          key={p.pageIndex}
          className="a4-page-container"
          style={{
            width: '794px',
            height: '1123px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            margin: '0 auto 24px auto',
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            border: '1px solid #cbd5e1',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* TOP CONTENT WRAPPER */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 1. TOP BRANDING BANNER */}
            <div
              style={{
                background: 'linear-gradient(to right, #0B2246, #0F2C59, #0D2447)',
                color: '#ffffff',
                padding: '16px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '4px solid #F59E0B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 10 }}>
                {/* Official Logo Container matching Reference Design */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Native Inline Vector SVG Logo - Guaranteed 100% synchronous DOM rendering in html2canvas */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 500 320"
                    style={{ width: '70px', height: '45px', display: 'block' }}
                  >
                    {/* Outer Oval Background (White fill inside oval) */}
                    <ellipse cx="250" cy="160" rx="230" ry="142" fill="#FFFFFF" />

                    {/* Letter V */}
                    <text
                      x="135"
                      y="234"
                      textAnchor="middle"
                      style={{
                        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                        fontWeight: 900,
                        fontSize: '215px',
                        fill: '#0B389C',
                      }}
                    >
                      V
                    </text>

                    {/* Letter S */}
                    <text
                      x="365"
                      y="234"
                      textAnchor="middle"
                      style={{
                        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                        fontWeight: 900,
                        fontSize: '215px',
                        fill: '#0B389C',
                      }}
                    >
                      S
                    </text>

                    {/* Central Red Lightning Bolt */}
                    <polygon points="262,0 216,148 266,148 192,320 238,172 188,172" fill="#E52320" />

                    {/* Outer Oval Border */}
                    <ellipse cx="250" cy="160" rx="230" ry="142" fill="none" stroke="#0B389C" strokeWidth="16" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.025em', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
                    VIDYUT SPARES
                  </h1>
                  <p style={{ fontSize: '10px', color: '#FCD34D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    ELECTRICAL PRODUCTS & SPARES
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, fontStyle: 'italic', color: '#e2e8f0', margin: 0 }}>
                    Powering Your Electrical Needs
                  </p>
                  <div style={{ height: '2px', width: '100%', backgroundColor: '#F59E0B', marginTop: '3px', borderRadius: '9999px' }}></div>
                  {p.totalPages > 1 && (
                    <p style={{ fontSize: '10px', color: '#FCD34D', fontWeight: 700, margin: '2px 0 0 0' }}>
                      Page {p.pageIndex} of {p.totalPages}
                    </p>
                  )}
                </div>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#F59E0B' }}>
                  <Zap style={{ height: '22px', width: '22px', fill: '#F59E0B', color: '#F59E0B' }} />
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* PAGE 1 ONLY: INVOICE TITLE, META CARD & CUSTOMER DETAILS */}
              {p.pageIndex === 1 && (
                <>
                  {/* 2. INVOICE TITLE & META CARD */}
                  <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ backgroundColor: '#0F2C59', padding: '14px', borderRadius: '14px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText style={{ height: '36px', width: '36px', color: '#F59E0B' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0F2C59', textTransform: 'uppercase', margin: 0 }}>
                          INVOICE
                        </h2>
                        <div style={{ height: '4px', width: '60px', backgroundColor: '#F59E0B', margin: '4px 0', borderRadius: '9999px' }}></div>
                        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, fontStyle: 'italic', margin: 0 }}>Thank you for your business!</p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '14px 16px', fontSize: '11px', width: '270px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dbeafe', paddingBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#475569' }}>Invoice No</span>
                        <span style={{ fontWeight: 800, color: '#0F2C59' }}>{invoice.invoice_number}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dbeafe', paddingBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#475569' }}>Invoice Date</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{invoiceDateStr}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dbeafe', paddingBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#475569' }}>Order No</span>
                        <span style={{ fontWeight: 800, color: '#0F2C59' }}>#{order.order_number}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#475569' }}>Payment Method</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{order.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. CUSTOMER & STORE DETAILS CARD */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#0F2C59', color: '#ffffff', padding: '7px 14px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User style={{ height: '14px', width: '14px', color: '#F59E0B' }} /> Customer Details
                    </div>
                    <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#F8FAFC', fontSize: '11px' }}>
                      {/* Left Column: Customer Info */}
                      <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#475569', width: '140px' }}>Customer Name :</span>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>{address.full_name || 'Valued Customer'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#475569', width: '140px' }}>Mobile No :</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{address.phone || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#475569', width: '140px' }}>Delivery Address :</span>
                          <span style={{ fontWeight: 500, color: '#1e293b' }}>
                            {address.address_line_1} {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                            <br />
                            {address.city}, {address.state} - <span style={{ fontWeight: 700 }}>{address.pincode}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Store Business Contact Info */}
                      <div style={{ paddingLeft: '6px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin style={{ height: '15px', width: '15px', color: '#0F2C59', flexShrink: 0, marginTop: '1px' }} />
                          <div>
                            <p style={{ fontWeight: 800, color: '#0F2C59', margin: 0 }}>VIDYUT SPARES</p>
                            <p style={{ fontSize: '10px', lineHeight: 1.3, color: '#475569', margin: '2px 0 0 0' }}>
                              11-39-15, Katurivari St, Beside 1 Town Police Station,
                              <br />
                              Tarapet, Vijayawada, Andhra Pradesh - 520001
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail style={{ height: '14px', width: '14px', color: '#0F2C59', flexShrink: 0 }} />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>vidyutspares@gmail.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone style={{ height: '14px', width: '14px', color: '#0F2C59', flexShrink: 0 }} />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>9440146599</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 4. PRODUCTS PURCHASED TABLE */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#0F2C59', color: '#ffffff', padding: '7px 14px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package style={{ height: '14px', width: '14px', color: '#F59E0B' }} /> Products Purchased {p.totalPages > 1 && `(Continued)`}
                </div>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#EBF5FF', color: '#0F2C59', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px', textAlign: 'center', width: '45px', borderRight: '1px solid #e2e8f0' }}>S.No</th>
                      <th style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>Product Name</th>
                      <th style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>Description</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '60px', borderRight: '1px solid #e2e8f0' }}>Qty</th>
                      <th style={{ padding: '10px', textAlign: 'right', width: '105px', borderRight: '1px solid #e2e8f0' }}>Unit Price (₹)</th>
                      <th style={{ padding: '10px', textAlign: 'right', width: '105px' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#ffffff' }}>
                    {p.pageItems.map((item, idx) => (
                      <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#F8FAFC', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                          {p.startIndex + idx + 1}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                          {item.product_name_snapshot}
                        </td>
                        <td style={{ padding: '10px', color: '#475569', fontFamily: 'monospace', fontSize: '10px', borderRight: '1px solid #e2e8f0' }}>
                          SKU: {item.sku_snapshot || 'VS-N/A'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 500, borderRight: '1px solid #e2e8f0' }}>
                          ₹{item.price_snapshot.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                          ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotal & Grand Total Box on Last Page */}
                {p.isLastPage && (
                  <div style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #cbd5e1', padding: '14px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                        <span style={{ fontWeight: 700 }}>Sub Total</span>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                          ₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                        <span style={{ fontWeight: 700 }}>Delivery Charge</span>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#047857' }}>
                          {order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge.toFixed(2)}`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', paddingBottom: '2px' }}>
                        <span style={{ fontWeight: 700 }}>Discount</span>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>₹0.00</span>
                      </div>
                      <div style={{ backgroundColor: '#0F2C59', color: '#ffffff', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 900 }}>
                        <span>Grand Total</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '15px', color: '#F59E0B' }}>
                          ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. FOOTER CARDS: TRUST & TERMS ON LAST PAGE */}
              {p.isLastPage && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '11px' }}>
                  {/* Left Card: Customer Appreciation */}
                  <div style={{ backgroundColor: '#F0F7FF', border: '1px solid #BFDBFE', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: '#0F2C59', color: '#ffffff', padding: '8px', borderRadius: '9999px', flexShrink: 0 }}>
                      <CheckCircle2 style={{ height: '22px', width: '22px', color: '#F59E0B' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, color: '#0F2C59', fontSize: '13px', margin: 0 }}>We appreciate your trust!</p>
                      <p style={{ fontSize: '10px', color: '#475569', fontWeight: 500, margin: '2px 0 0 0' }}>For any queries, please contact us.</p>
                    </div>
                  </div>

                  {/* Right Card: Terms & Conditions */}
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#0F2C59', textTransform: 'uppercase', fontSize: '10px' }}>
                      <Zap style={{ height: '14px', width: '14px', color: '#F59E0B', fill: '#F59E0B' }} /> Terms & Conditions
                    </div>
                    <ul style={{ fontSize: '10px', color: '#475569', margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <li>Goods once sold will not be taken back.</li>
                      <li>Warranty as per manufacturer terms.</li>
                      <li>Please keep this invoice for future reference.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. BOTTOM FOOTER BAR - ATTACHED TO BOTTOM OF EVERY A4 PAGE */}
          <div
            style={{
              backgroundColor: '#0F2C59',
              color: '#ffffff',
              padding: '10px 28px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              borderTop: '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
            }}
          >
            <div style={{ height: '2px', width: '40px', backgroundColor: '#F59E0B', borderRadius: '9999px' }}></div>
            <span>VIDYUT SPARES | ELECTRICAL PRODUCTS & SPARES</span>
            <div style={{ height: '2px', width: '40px', backgroundColor: '#F59E0B', borderRadius: '9999px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
