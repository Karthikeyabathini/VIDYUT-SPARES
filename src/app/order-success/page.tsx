import React from 'react';
import Link from 'next/link';
import { getOrderById } from '@/lib/actions/orderActions';
import { getActiveUser } from '@/lib/actions/authActions';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, AlertTriangle, Package, MapPin, CreditCard, ShoppingBag, ShieldAlert } from 'lucide-react';

interface OrderSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    paymentStatus?: string;
  }>;
}

export const revalidate = 0;

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { orderId, paymentStatus } = await searchParams;
  const user = await getActiveUser();

  // 1. Missing orderId parameter handling
  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200 space-y-4">
          <div className="h-14 w-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Missing Order Reference</h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            No order ID was specified in your request. If you recently placed an order, you can view your full order history in your account dashboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors"
            >
              <Package className="h-4 w-4" /> View My Orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-5 py-3 rounded-xl border border-slate-300 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" /> Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Retrieve order record
  const order = await getOrderById(orderId);

  // 3. Order record not found handling
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="h-14 w-14 bg-blue-50 text-[#0F2C59] rounded-full flex items-center justify-center mx-auto">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Order Information Unavailable</h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t retrieve an order record matching reference <span className="font-mono font-bold text-slate-900">{orderId}</span>. If you recently completed checkout or payment submission, your order is being processed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors"
            >
              Check My Account Orders <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-5 py-3 rounded-xl border border-slate-300 transition-colors"
            >
              Return to Electrical Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Privacy & Ownership Security Check
  if (user) {
    const userRole = (user.role || '').toUpperCase();
    const addressEmail = (order.address_snapshot as any)?.email;
    const isOwner =
      order.user_id === user.id ||
      userRole === 'ADMIN' ||
      order.user_id === 'guest-user' ||
      (user.email && order.user?.email && user.email.toLowerCase() === order.user.email.toLowerCase()) ||
      (user.email && addressEmail && user.email.toLowerCase() === addressEmail.toLowerCase());

    if (!isOwner) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200 space-y-4">
            <div className="h-14 w-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Protected Order Details</h1>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              This order belongs to another customer account. Please sign in with the account used to place this order to view complete details.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/login?redirectTo=/account/orders"
                className="inline-flex items-center justify-center bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
              >
                Sign In to Customer Account
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  const isOnlineVerification = order.payment_method !== 'COD' || paymentStatus === 'submitted';
  const address = order.address_snapshot || {};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
            Order Confirmed & Logged
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank You! Order #{order.order_number} Received
          </h1>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* VERIFICATION / CONFIRMATION BANNER */}
        {isOnlineVerification ? (
          <div className="bg-amber-50 p-4 sm:p-5 rounded-xl border border-amber-200 text-left max-w-2xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" /> Payment Awaiting Admin Verification
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your payment proof has been submitted successfully. Your transaction is currently awaiting manual verification by our finance team at VIDYUT SPARES. Once verified, your status will update to <span className="font-bold">PAID</span> and your official invoice will be generated.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 sm:p-5 rounded-xl border border-blue-200 text-left max-w-2xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-[#0F2C59] font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" /> Cash on Delivery Order Registered
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Your Cash on Delivery order has been registered successfully. Our dispatch team in Vijayawada is preparing your electrical spare parts for shipment.
            </p>
          </div>
        )}

        {/* ORDER SUMMARY & ADDRESS BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs max-w-2xl mx-auto">
          {/* ORDER INFO CARD */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <CreditCard className="h-4 w-4 text-[#0F2C59]" /> Payment Summary
            </h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-slate-900">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Status:</span>
              <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                {order.order_status}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-extrabold text-[#0F2C59] text-sm border-t border-slate-200">
              <span>Total Amount:</span>
              <span>₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* DELIVERY ADDRESS CARD */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <MapPin className="h-4 w-4 text-[#0F2C59]" /> Delivery Address
            </h3>
            <p className="font-bold text-slate-900">{address.full_name || 'Customer'}</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {address.address_line_1}
              {address.address_line_2 ? `, ${address.address_line_2}` : ''}
              <br />
              {address.city || 'Vijayawada'}, {address.state || 'Andhra Pradesh'} - {address.pincode}
            </p>
            <p className="text-slate-500 text-[11px]">Phone: <span className="font-bold text-slate-800">{address.phone}</span></p>
          </div>
        </div>

        {/* ORDER ITEMS LIST */}
        {order.items && order.items.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-3 max-w-2xl mx-auto">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Package className="h-4 w-4 text-[#0F2C59]" /> Ordered Items ({order.items.length})
            </h3>
            <div className="space-y-2 divide-y divide-slate-200/60">
              {order.items.map((item: any) => (
                <div key={item.id || item.product_id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.product_name_snapshot || item.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.price_snapshot?.toLocaleString('en-IN') || item.price}</p>
                  </div>
                  <span className="font-extrabold text-[#0F2C59]">
                    ₹{(item.subtotal || item.quantity * (item.price_snapshot || item.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Link
            href={`/account/orders/${order.order_number}`}
            className="inline-flex items-center justify-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-colors"
          >
            Track Order Details <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/account/invoices"
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-6 py-3.5 rounded-xl border border-slate-300 transition-colors"
          >
            View Invoices
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
