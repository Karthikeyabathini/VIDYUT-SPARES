import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/actions/authActions';
import { getCustomerOrders, getAddresses } from '@/lib/actions/orderActions';
import { User, Package, FileText, MapPin, ShoppingBag, ArrowRight, ShieldCheck, Plus } from 'lucide-react';

export const revalidate = 0;

export default async function AccountDashboardPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login?redirectTo=/account');
  }

  const orders = await getCustomerOrders();
  const addresses = await getAddresses();

  const totalOrders = orders.length;
  const verifiedInvoices = orders.filter((o) => o.payment_status === 'PAID').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-[#0F2C59] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
            <ShieldCheck className="h-3.5 w-3.5" /> Customer Account Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {profile.name}!
          </h1>
          <p className="text-xs text-slate-300">{profile.email} • Phone: {profile.phone || 'Not provided'}</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/products"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="h-4 w-4" /> Browse Catalog
          </Link>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#0F2C59] shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Orders</span>
            <span className="text-2xl font-extrabold text-[#0F2C59] group-hover:text-amber-600 transition-colors">
              {totalOrders}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-[#0F2C59] rounded-xl group-hover:bg-amber-100 transition-colors">
            <Package className="h-6 w-6" />
          </div>
        </Link>

        <Link
          href="/account/invoices"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Verified Invoices</span>
            <span className="text-2xl font-extrabold text-emerald-600">
              {verifiedInvoices}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Saved Addresses</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {addresses.length}
            </span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <MapPin className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* RECENT ORDERS & ACCOUNT OPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT ORDERS LIST */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-[#0F2C59]" /> My Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{order.order_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.payment_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.payment_status === 'AWAITING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Placed on {new Date(order.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length || 0} items
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0">
                    <span className="font-extrabold text-[#0F2C59] text-sm">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="text-xs font-bold bg-[#0F2C59] text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-blue-900 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-3">
              <Package className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/products"
                className="inline-block text-xs font-bold bg-[#0F2C59] text-white px-4 py-2 rounded-lg"
              >
                Shop Electrical Products
              </Link>
            </div>
          )}
        </div>

        {/* SIDEBAR ACCOUNT OPTIONS */}
        <div className="space-y-6">
          {/* PROFILE SUMMARY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-[#0F2C59]" /> Account Details
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-slate-900">{profile.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-900">{profile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-slate-900">{profile.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* SAVED ADDRESSES PREVIEW */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0F2C59]" /> Delivery Addresses
              </h3>
              <Link
                href="/checkout"
                className="text-[11px] font-bold text-[#0F2C59] hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Add Address
              </Link>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-2 text-xs">
                {addresses.slice(0, 2).map((addr) => (
                  <div key={addr.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">{addr.full_name} ({addr.phone})</p>
                    <p className="text-slate-600 text-[11px] leading-tight">
                      {addr.address_line_1}, {addr.address_line_2 ? `${addr.address_line_2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No saved addresses yet. Address will be saved when placing an order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
