'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { paymentProofSchema, rejectionSchema } from '@/lib/validators';
import { ActionResponse, Invoice, Payment, PaymentMethod } from '@/types';
import { revalidatePath } from 'next/cache';
import { getAllPaymentMethods } from '@/lib/actions/adminActions';
import { getOrderById } from '@/lib/actions/orderActions';
import { getActiveUser } from '@/lib/actions/authActions';
import { persistentStore } from '@/lib/db/persistentStore';

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const all = await getAllPaymentMethods();
    return all.filter((m) => m.is_active);
  } catch {
    return persistentStore.getPaymentMethods().filter((m) => m.is_active);
  }
}

export async function getAllPayments(): Promise<Payment[]> {
  try {
    let supabasePayments: Payment[] = [];
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('payments')
        .select('*, order:orders(*, user:users(*))')
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabasePayments = data as Payment[];
      }
    } catch {
      // DB fallback
    }

    const localPayments = persistentStore.getPayments();

    // Merge payments by ID
    const paymentMap = new Map<string, Payment>();
    localPayments.forEach((p) => paymentMap.set(p.id, p));
    supabasePayments.forEach((p) => paymentMap.set(p.id, p));

    // Fallback: Ensure any online payment order has a corresponding payment record
    const allOrders = persistentStore.getOrders();
    for (const ord of allOrders) {
      if (ord.payment_method && ord.payment_method !== 'COD') {
        const hasPayment = Array.from(paymentMap.values()).some((p) => p.order_id === ord.id || p.order?.order_number === ord.order_number);
        if (!hasPayment) {
          const synthesizedPayment: Payment = {
            id: `pay-${ord.id}`,
            order_id: ord.id,
            payment_method: ord.payment_method,
            amount: ord.total_amount,
            payment_status: ord.payment_status as any,
            utr_number: `REF-${ord.order_number}`,
            proof_file_url: '/vs-logo.svg',
            payer_name: ord.address_snapshot?.full_name || 'Customer',
            payer_phone: ord.address_snapshot?.phone || null,
            payment_date: (ord.placed_at || ord.created_at || new Date().toISOString()).split('T')[0],
            payment_time: new Date(ord.placed_at || ord.created_at || Date.now()).toLocaleTimeString('en-IN', { hour12: false }),
            customer_note: 'Online Payment submitted during checkout',
            created_at: ord.created_at || new Date().toISOString(),
            updated_at: ord.updated_at || new Date().toISOString(),
            order: ord,
          };
          paymentMap.set(synthesizedPayment.id, synthesizedPayment);
          persistentStore.createPayment(synthesizedPayment);
        }
      }
    }

    const merged = Array.from(paymentMap.values());

    // Enrich order information if missing
    for (const p of merged) {
      if (!p.order || !p.order.order_number) {
        const matchingOrder = persistentStore.getOrderById(p.order_id);
        if (matchingOrder) {
          p.order = matchingOrder;
        }
      }
    }

    return merged.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  } catch (err) {
    console.error('getAllPayments error:', err);
    return persistentStore.getPayments();
  }
}

export async function submitPaymentProof(formData: {
  order_id: string;
  payment_method: string;
  amount: number;
  utr_number: string;
  proof_file_url: string;
  payer_name?: string;
  payer_phone?: string;
  payment_date: string;
  payment_time: string;
  customer_note?: string;
}): Promise<ActionResponse<Payment>> {
  try {
    const validated = paymentProofSchema.parse(formData);
    const user = await getActiveUser();

    if (!user) return { success: false, error: 'Authentication required' };

    const order = await getOrderById(validated.order_id);
    if (!order) return { success: false, error: 'Order not found' };

    const trimmedUTR = validated.utr_number.trim();
    const newPaymentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPayment: Payment = {
      id: newPaymentId,
      order_id: order.id,
      payment_method: validated.payment_method,
      amount: validated.amount,
      payment_status: 'AWAITING_VERIFICATION' as any,
      utr_number: trimmedUTR,
      proof_file_url: validated.proof_file_url,
      payer_name: validated.payer_name || null,
      payer_phone: validated.payer_phone || null,
      payment_date: validated.payment_date,
      payment_time: validated.payment_time,
      customer_note: validated.customer_note || null,
      created_at: now,
      updated_at: now,
      order,
    };

    persistentStore.createPayment(newPayment);
    persistentStore.updateOrder(order.id, {
      payment_status: 'AWAITING_VERIFICATION' as any,
      order_status: 'PENDING' as any,
    });

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('payments').insert([{
        id: newPaymentId,
        order_id: order.id,
        payment_method: validated.payment_method,
        amount: validated.amount,
        payment_status: 'AWAITING_VERIFICATION',
        utr_number: trimmedUTR,
        proof_file_url: validated.proof_file_url,
        payer_name: validated.payer_name || null,
        payer_phone: validated.payer_phone || null,
        payment_date: validated.payment_date,
        payment_time: validated.payment_time,
        customer_note: validated.customer_note || null,
        created_at: now,
        updated_at: now,
      }]);
      await adminSupabase
        .from('orders')
        .update({
          payment_status: 'AWAITING_VERIFICATION',
          order_status: 'PENDING',
          updated_at: now,
        })
        .eq('id', order.id);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/account/orders');
    revalidatePath('/admin/payments');
    revalidatePath('/admin/orders');
    return { success: true, data: newPayment };
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      const firstMsg = err.errors?.[0]?.message || 'Invalid payment verification details';
      return { success: false, error: firstMsg };
    }
    return { success: false, error: err?.message || 'Failed to submit payment proof' };
  }
}

// ADMIN ACTION: Approve Payment & Issue Invoice
export async function approvePayment(paymentId: string, adminNote?: string): Promise<ActionResponse<Invoice>> {
  try {
    const now = new Date().toISOString();
    const allPayments = await getAllPayments();
    const payment = allPayments.find((p) => p.id === paymentId || p.order_id === paymentId);
    const order = await getOrderById(payment?.order_id || paymentId);

    if (!order) {
      return { success: false, error: 'Associated customer order not found' };
    }

    // Generate Official Tax Invoice
    const invoiceId = crypto.randomUUID();
    const randomInvoiceSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `VSI-2026-${randomInvoiceSuffix}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    const invoicePayload: Invoice = {
      id: invoiceId,
      order_id: order.id,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      subtotal: order.subtotal,
      delivery_charge: order.delivery_charge,
      total_amount: order.total_amount,
      payment_method: payment?.payment_method || order.payment_method,
      payment_status: 'PAID' as any,
      created_at: now,
      updated_at: now,
      order,
    };

    persistentStore.updatePayment(paymentId, {
      payment_status: 'PAID' as any,
      admin_note: adminNote || 'Payment verified manually by admin',
      verified_at: now,
    });

    persistentStore.updateOrder(order.id, {
      payment_status: 'PAID' as any,
      order_status: 'PROCESSING' as any,
      confirmed_at: now,
    });

    persistentStore.createInvoice(invoicePayload);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('payments').update({
        payment_status: 'PAID',
        admin_note: adminNote || 'Payment verified manually by admin',
        verified_at: now,
        updated_at: now,
      }).or(`id.eq.${paymentId},order_id.eq.${paymentId}`);

      await adminSupabase.from('orders').update({
        payment_status: 'PAID',
        order_status: 'PROCESSING',
        confirmed_at: now,
        updated_at: now,
      }).eq('id', order.id);

      await adminSupabase.from('invoices').insert([{
        id: invoiceId,
        order_id: order.id,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        subtotal: order.subtotal,
        delivery_charge: order.delivery_charge,
        total_amount: order.total_amount,
        payment_method: payment?.payment_method || order.payment_method,
        payment_status: 'PAID',
        created_at: now,
        updated_at: now,
      }]);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/payments');
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    revalidatePath('/account/invoices');

    return { success: true, data: invoicePayload };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to approve payment' };
  }
}

// ADMIN ACTION: Reject Payment
export async function rejectPayment(paymentId: string, rejectionReason: string): Promise<ActionResponse> {
  try {
    const validated = rejectionSchema.parse({ rejection_reason: rejectionReason });
    const now = new Date().toISOString();

    persistentStore.updatePayment(paymentId, {
      payment_status: 'REJECTED' as any,
      rejection_reason: validated.rejection_reason,
      verified_at: now,
    });

    const allPayments = await getAllPayments();
    const payment = allPayments.find((p) => p.id === paymentId || p.order_id === paymentId);
    if (payment?.order_id) {
      persistentStore.updateOrder(payment.order_id, {
        payment_status: 'REJECTED' as any,
        order_status: 'CANCELLED' as any,
      });
    }

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('payments').update({
        payment_status: 'REJECTED',
        rejection_reason: validated.rejection_reason,
        verified_at: now,
        updated_at: now,
      }).or(`id.eq.${paymentId},order_id.eq.${paymentId}`);
    } catch {
      // DB fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/payments');
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reject payment' };
  }
}
