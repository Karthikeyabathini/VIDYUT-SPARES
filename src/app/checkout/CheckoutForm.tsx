'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Address, CartItem, PaymentMethod } from '@/types';
import { createAddress, placeCODOrder } from '@/lib/actions/orderActions';
import { MapPin, Plus, CheckCircle, CreditCard, Banknote, ShieldAlert, ArrowRight } from 'lucide-react';

interface CheckoutFormProps {
  addresses: Address[];
  cartItems: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethods: PaymentMethod[];
}

export default function CheckoutForm({
  addresses: initialAddresses,
  cartItems,
  subtotal,
  deliveryCharge,
  grandTotal,
  paymentMethods,
}: CheckoutFormProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialAddresses[0]?.id || ''
  );
  const [paymentMode, setPaymentMode] = useState<'COD' | 'ONLINE'>('ONLINE');
  const [selectedOnlineMethodId, setSelectedOnlineMethodId] = useState<string>(
    paymentMethods[0]?.id || ''
  );

  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(initialAddresses.length === 0);

  // New Address Form State
  const [addressError, setAddressError] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '',
    landmark: '',
  });

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    setLoading(true);
    const res = await createAddress(newAddress);
    setLoading(false);

    if (res.success && res.data) {
      setAddresses((prev) => [res.data!, ...prev.filter((a) => a.id !== res.data!.id)]);
      setSelectedAddressId(res.data.id);
      setShowAddressForm(false);
      setAddressError(null);
    } else {
      setAddressError(res.error || 'Failed to save delivery address');
    }
  };

  const handlePlaceOrderSubmit = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address first.');
      return;
    }

    if (paymentMode === 'COD') {
      setLoading(true);
      const res = await placeCODOrder({
        address_id: selectedAddressId,
      });
      setLoading(false);

      if (res.success && res.data) {
        router.push(`/order-success?orderId=${res.data.id}`);
      } else {
        alert(res.error || 'Could not complete COD order placement.');
      }
    } else {
      // ONLINE PAYMENT: Navigate to payment page with address and method without creating an order
      const chosenMethod = paymentMethods.find((m) => m.id === selectedOnlineMethodId) || paymentMethods[0];
      const methodQuery = chosenMethod?.id ? `&methodId=${encodeURIComponent(chosenMethod.id)}` : '';
      router.push(`/checkout/payment?addressId=${encodeURIComponent(selectedAddressId)}${methodQuery}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT STEPS */}
      <div className="lg:col-span-8 space-y-8">
        {/* STEP 1: DELIVERY ADDRESS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#0F2C59]" /> 1. Select Delivery Address
            </h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Address
              </button>
            )}
          </div>

          {!showAddressForm ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                    selectedAddressId === addr.id
                      ? 'border-[#0F2C59] bg-blue-50/40 ring-2 ring-[#0F2C59]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-extrabold text-slate-900 text-sm">{addr.full_name}</p>
                    {selectedAddressId === addr.id && (
                      <CheckCircle className="h-5 w-5 text-[#0F2C59]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">{addr.phone}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {addr.address_line_1}, {addr.address_line_2 ? `${addr.address_line_2}, ` : ''}
                    {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Add New Delivery Address</h3>

              {addressError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-bold">
                  {addressError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Full Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Contact Name"
                    value={newAddress.full_name}
                    onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mobile Phone (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="House No, Street Name, Area"
                    value={newAddress.address_line_1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Pincode (6 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Nearby Landmark"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#0F2C59]"
                >
                  Save Delivery Address
                </button>
              </div>
            </form>
          )}
        </div>

        {/* STEP 2: PAYMENT METHOD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#0F2C59]" /> 2. Select Payment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ONLINE MANUAL PAYMENT CHOICE */}
            <div
              onClick={() => setPaymentMode('ONLINE')}
              className={`p-5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                paymentMode === 'ONLINE'
                  ? 'border-[#0F2C59] bg-blue-50/50 ring-2 ring-[#0F2C59]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  <span className="font-extrabold text-sm text-slate-900">Manual Online Payment</span>
                </div>
                {paymentMode === 'ONLINE' && <CheckCircle className="h-5 w-5 text-[#0F2C59]" />}
              </div>
              <p className="text-xs text-slate-600">
                Pay via PhonePe / Google Pay / Paytm QR or UPI number, then submit UTR reference & receipt screenshot.
              </p>
              <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Admin Verification Required
              </span>
            </div>

            {/* CASH ON DELIVERY CHOICE */}
            <div
              onClick={() => setPaymentMode('COD')}
              className={`p-5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                paymentMode === 'COD'
                  ? 'border-[#0F2C59] bg-blue-50/50 ring-2 ring-[#0F2C59]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <span className="font-extrabold text-sm text-slate-900">Cash on Delivery (COD)</span>
                </div>
                {paymentMode === 'COD' && <CheckCircle className="h-5 w-5 text-[#0F2C59]" />}
              </div>
              <p className="text-xs text-slate-600">
                Pay cash upon receiving delivery of electrical spares at your Vijayawada store or home location.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT ORDER SUMMARY & SUBMIT */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 h-fit">
        <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Order Items ({cartItems.length})
        </h3>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
          {cartItems.map((item) => (
            <div key={item.id} className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 line-clamp-1">{item.product?.name}</p>
                <p className="text-slate-500 font-mono">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-slate-900 shrink-0">
                ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge:</span>
            <span className="font-bold text-emerald-700">
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </span>
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-extrabold text-[#0F2C59]">
            <span>Total Payable:</span>
            <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrderSubmit}
          disabled={loading || !selectedAddressId}
          className="w-full py-4 px-6 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
        >
          {paymentMode === 'COD' ? 'Confirm COD Order' : 'Proceed to Online Payment'} <ArrowRight className="h-4 w-4" />
        </button>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
          <div className="flex items-center gap-1 font-bold">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" /> Important Payment Note
          </div>
          <p>
            {paymentMode === 'ONLINE'
              ? 'You will be redirected to view official QR/UPI details and upload payment proof after clicking proceed.'
              : 'Your cash order will be processed immediately upon confirmation.'}
          </p>
        </div>
      </div>
    </div>
  );
}
