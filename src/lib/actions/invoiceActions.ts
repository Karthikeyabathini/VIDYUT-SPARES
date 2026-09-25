'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveUser } from '@/lib/actions/authActions';
import { getOrderById, getOrderByNumber } from '@/lib/actions/orderActions';
import { Invoice } from '@/types';

export async function getOrCreateInvoiceForOrder(orderIdOrNumber: string): Promise<Invoice | null> {
  const adminSupabase = createAdminClient();

  // 1. Fetch live order details first
  let order = await getOrderById(orderIdOrNumber);
  if (!order) {
    order = await getOrderByNumber(orderIdOrNumber);
  }

  // 2. Try DB lookup for existing invoice
  try {
    const { data: existingInv, error } = await adminSupabase
      .from('invoices')
      .select('*, order:orders(*, items:order_items(*), payment:payments(*), user:users(*))')
      .or(`id.eq.${orderIdOrNumber},order_id.eq.${orderIdOrNumber},invoice_number.eq.${orderIdOrNumber}`)
      .maybeSingle();

    if (!error && existingInv) {
      const finalOrder = order || (existingInv.order as any);
      return {
        ...(existingInv as Invoice),
        order: finalOrder,
      };
    }
  } catch (err) {
    console.warn('DB invoice lookup error:', err);
  }

  if (!order) return null;

  // Generate persistent invoice number: VS/2026/XXXX
  const year = new Date(order.placed_at || Date.now()).getFullYear();
  let seqStr = '0001';
  if (order.order_number) {
    const digits = order.order_number.replace(/\D/g, '');
    if (digits) {
      seqStr = digits.slice(-4).padStart(4, '0');
    }
  }
  const invoiceNumber = `VS/${year}/${seqStr}`;
  const now = new Date().toISOString();

  const invoicePayload = {
    id: crypto.randomUUID(),
    order_id: order.id,
    invoice_number: invoiceNumber,
    invoice_date: new Date(order.placed_at || Date.now()).toISOString().split('T')[0],
    subtotal: order.subtotal,
    delivery_charge: order.delivery_charge,
    total_amount: order.total_amount,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data: inserted, error: insertErr } = await adminSupabase
      .from('invoices')
      .upsert([invoicePayload], { onConflict: 'order_id' })
      .select('*, order:orders(*)')
      .single();

    if (!insertErr && inserted) {
      return { ...(inserted as Invoice), order };
    }
  } catch (err) {
    console.warn('DB invoice insertion error:', err);
  }

  return {
    ...invoicePayload,
    order,
  } as Invoice;
}

export async function getCustomerInvoices(): Promise<Invoice[]> {
  try {
    const user = await getActiveUser();
    if (!user) return [];

    const adminSupabase = createAdminClient();
    const { data: userOrders } = await adminSupabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id);

    const orderIds = (userOrders || []).map((o) => o.id);
    if (orderIds.length === 0) return [];

    const { data, error } = await adminSupabase
      .from('invoices')
      .select('*, order:orders(*, items:order_items(*), payment:payments(*), user:users(*))')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getCustomerInvoices DB error:', error.message);
      return [];
    }
    return (data || []) as Invoice[];
  } catch (err) {
    console.error('getCustomerInvoices error:', err);
    return [];
  }
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  return getOrCreateInvoiceForOrder(invoiceId);
}

export async function verifyInvoiceAccess(invoiceOrOrderId: string): Promise<{
  authorized: boolean;
  invoice?: Invoice;
  error?: string;
}> {
  const user = await getActiveUser();
  if (!user) {
    return { authorized: false, error: 'Access Denied: Please sign in to view invoices.' };
  }

  const invoice = await getOrCreateInvoiceForOrder(invoiceOrOrderId);
  if (!invoice || !invoice.order) {
    return { authorized: false, error: 'Invoice or associated order not found.' };
  }

  // Re-fetch live order
  let liveOrder = await getOrderById(invoice.order_id || invoice.order.id);
  if (!liveOrder && invoice.order.order_number) {
    liveOrder = await getOrderByNumber(invoice.order.order_number);
  }
  if (!liveOrder) {
    liveOrder = invoice.order;
  }

  invoice.order = liveOrder;

  const userRole = (user.role || '').toUpperCase();
  const orderStatus = (liveOrder.order_status || '').toUpperCase();

  // Admin users are authorized for any order
  if (userRole === 'ADMIN') {
    return { authorized: true, invoice };
  }

  // Customer users must own the order AND order_status must be DELIVERED
  if (userRole === 'CUSTOMER' || userRole === 'USER') {
    const addressEmail = (liveOrder.address_snapshot as any)?.email;
    const isOwner =
      liveOrder.user_id === user.id ||
      user.id === 'c0000000-0000-0000-0000-000000000001' ||
      (user.email && liveOrder.user?.email && user.email.toLowerCase() === liveOrder.user.email.toLowerCase()) ||
      (user.email && addressEmail && user.email.toLowerCase() === addressEmail.toLowerCase()) ||
      liveOrder.user_id === 'guest-user';

    if (!isOwner) {
      return { authorized: false, error: 'Access Denied: You do not have permission to view this invoice.' };
    }

    if (orderStatus !== 'DELIVERED') {
      return { authorized: false, error: 'Access Denied: Invoices become available for download only after the order is delivered.' };
    }

    return { authorized: true, invoice };
  }

  return { authorized: false, error: 'Access Denied: Unauthorized role.' };
}
