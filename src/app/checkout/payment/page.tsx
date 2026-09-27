import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrderById } from '@/lib/actions/orderActions';
import { getActivePaymentMethods } from '@/lib/actions/paymentActions';
import { getCart } from '@/lib/actions/cartActions';
import PaymentSubmissionForm from './PaymentSubmissionForm';
import { QrCode, Phone, Building2 } from 'lucide-react';

interface PaymentPageProps {
  searchParams: Promise<{
    orderId?: string;
    addressId?: string;
    methodId?: string;
  }>;
}

export const revalidate = 0;

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { orderId, addressId, methodId } = await searchParams;

  let order = null;
  let amountPayable = 0;
  let targetAddressId = addressId || '';

  if (orderId) {
    order = await getOrderById(orderId);
    if (!order) {
      notFound();
    }
    amountPayable = order.total_amount;
    targetAddressId = order.address_id;
  } else if (addressId) {
    const { items } = await getCart();
    if (!items || items.length === 0) {
      redirect('/cart');
    }
    const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
    const deliveryCharge = subtotal >= 2000 ? 0 : 50;
    amountPayable = subtotal + deliveryCharge;
  } else {
    redirect('/cart');
  }

  const paymentMethods = await getActivePaymentMethods();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="bg-[#0F2C59] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-900 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Manual Online Payment Verification
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              {order ? `Order #${order.order_number}` : 'Complete Online Payment'}
            </h1>
          </div>
          <div className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold block leading-tight">Amount Payable</span>
            <span className="text-xl font-extrabold">
              ₹{amountPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          Complete the payment using one of the official VIDYUT SPARES payment receiving channels below. After completing the payment in your UPI or Bank app, upload the payment screenshot and enter your 12-digit UTR number for manual admin verification.
        </p>
      </div>

      {/* PAYMENT RECEIVING CHANNELS DISPLAY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
          <QrCode className="h-5 w-5 text-[#0F2C59]" /> Official VIDYUT SPARES Payment Methods
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {method.type === 'UPI_QR' ? (
                    <QrCode className="h-5 w-5 text-amber-600" />
                  ) : method.type === 'UPI_NUMBER' ? (
                    <Phone className="h-5 w-5 text-[#0F2C59]" />
                  ) : (
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  )}
                  <h3 className="font-extrabold text-slate-900 text-sm">{method.display_name}</h3>
                </div>

                {method.upi_id && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">UPI ID: </span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold select-all">
                      {method.upi_id}
                    </span>
                  </p>
                )}

                {method.phone_number && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-500">Payment Mobile: </span>
                    <span className="font-bold text-slate-900">{method.phone_number}</span>
                  </p>
                )}

                {method.instructions && (
                  <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                    {method.instructions}
                  </p>
                )}
              </div>

              {method.qr_image_url && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Scan & Pay</span>
                  <div className="w-32 h-32 mx-auto relative border border-slate-100 rounded">
                    <img
                      src={method.qr_image_url}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PROOF SUBMISSION FORM */}
      <PaymentSubmissionForm
        order={order}
        addressId={targetAddressId}
        selectedMethodId={methodId}
        amountPayable={amountPayable}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
