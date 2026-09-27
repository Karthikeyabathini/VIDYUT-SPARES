'use client';

import React from 'react';
import { Order } from '@/types';
import { X, CheckCircle, IndianRupee, Calendar, ShoppingBag, User, Phone, FileText } from 'lucide-react';

interface RevenueAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  totalAmount: number;
  orders: Order[];
}

export default function RevenueAuditModal({
  isOpen,
  onClose,
  title,
  subtitle,
  totalAmount,
  orders,
}: RevenueAuditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="bg-[#0F2C59] text-white p-6 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                Verified Delivered Revenue Audit
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1 text-white">{title}</h2>
            <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* REVENUE SUMMARY BAR */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <span className="text-slate-600 font-bold uppercase block text-[10px]">Calculated Total Revenue</span>
              <span className="text-xl font-extrabold text-emerald-900">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-700">
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Delivered Orders Count</span>
              <span className="font-extrabold text-slate-900 text-base">{orders.length} orders</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Calculation Standard</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                Status = DELIVERED Only
              </span>
            </div>
          </div>
        </div>

        {/* DELIVERED ORDERS LIST TABLE */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {orders.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3">Order #</th>
                    <th className="p-3">Placed Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Delivered Items</th>
                    <th className="p-3 text-right">Delivered Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#0F2C59]">
                        {o.order_number}
                      </td>
                      <td className="p-3 text-slate-500 font-medium">
                        {new Date(o.placed_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{o.user?.name || 'Customer'}</span>
                        <span className="text-[11px] text-slate-500">{o.user?.phone || o.address_snapshot?.phone}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700">{o.payment_method}</span>
                        {o.payment?.utr_number && (
                          <span className="block text-[10px] font-mono text-amber-800 font-bold">
                            UTR: {o.payment.utr_number}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {o.items && o.items.length > 0 ? (
                          <div className="space-y-0.5">
                            {o.items.map((item: any) => (
                              <div key={item.id} className="text-[11px]">
                                • <span className="font-semibold">{item.product_name_snapshot}</span> x{item.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">Items recorded</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-800 text-sm">
                        ₹{o.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <ShoppingBag className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No DELIVERED orders found for this timeframe.</p>
              <p className="text-xs text-slate-400 mt-1">
                Only orders with order_status = DELIVERED are added to total sales revenue calculations.
              </p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Strict business rule applied: Unfulfilled or pending orders are excluded from revenue.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0F2C59] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors"
          >
            Close Audit Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
