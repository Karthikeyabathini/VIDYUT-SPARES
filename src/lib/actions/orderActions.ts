'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveUser } from '@/lib/actions/authActions';
import { clearCart, getCart } from '@/lib/actions/cartActions';
import { addressSchema } from '@/lib/validators';
import { ActionResponse, Address, Order, OrderStatus, Payment } from '@/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getProductById, updateProductStock } from '@/lib/actions/productActions';
import { persistentStore } from '@/lib/db/persistentStore';

export async function ensureUserAndAddressInSupabase(user: any, address: Address) {
  try {
    const adminSupabase = createAdminClient();
    const userId = user?.id || address?.user_id;

    if (userId) {
      const { data: existingUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingUser) {
        const userName = user?.name || address?.full_name || 'Valued Customer';
        const userEmail = user?.email || `${userId}@vidyutspares.com`;
        const userPhone = user?.phone || address?.phone || null;
        const userRole = user?.role || 'CUSTOMER';

        const { error: userErr } = await adminSupabase.from('users').upsert([
          {
            id: userId,
            name: userName,
            email: userEmail,
            phone: userPhone,
            role: userRole,
            is_active: true,
          },
        ]);
        if (userErr) {
          console.error('ensureUserAndAddressInSupabase user error:', userErr);
        }
      }
    }

    if (address && address.id) {
      const { data: existingAddr } = await adminSupabase
        .from('addresses')
        .select('id')
        .eq('id', address.id)
        .maybeSingle();

      if (!existingAddr) {
        const { error: addrErr } = await adminSupabase.from('addresses').upsert([
          {
            id: address.id,
            user_id: userId || address.user_id,
            full_name: address.full_name,
            phone: address.phone,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || null,
            city: address.city || 'Vijayawada',
            state: address.state || 'Andhra Pradesh',
            pincode: address.pincode,
            landmark: address.landmark || null,
          },
        ]);
        if (addrErr) {
          console.error('ensureUserAndAddressInSupabase address error:', addrErr);
        }
      }
    }
  } catch (err) {
    console.error('ensureUserAndAddressInSupabase exception:', err);
  }
}


export async function getAddresses(): Promise<Address[]> {
  try {
    const user = await getActiveUser();
    if (!user) return [];

    let supabaseAddrs: Address[] = [];
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseAddrs = data as Address[];
      }
    } catch {
      // DB fallback
    }

    const localAddrs = persistentStore.getAddresses(user.id);

    // Merge both sources by ID, ensuring STRICT filtering by user.id
    const addressMap = new Map<string, Address>();
    localAddrs.forEach((a) => {
      if (a.user_id === user.id) {
        addressMap.set(a.id, a);
      }
    });
    supabaseAddrs.forEach((a) => {
      if (a.user_id === user.id) {
        addressMap.set(a.id, a);
      }
    });

    return Array.from(addressMap.values());
  } catch (err) {
    console.error('getAddresses error:', err);
    return [];
  }
}

export async function validateAddressObject(address: any): Promise<{ valid: boolean; error?: string }> {
  if (!address) {
    return { valid: false, error: 'Delivery address not found. Please select or add a valid delivery address.' };
  }
  const fullName = (address.full_name || '').trim();
  if (fullName.length < 2) {
    return { valid: false, error: 'Selected address is invalid: Contact name is required.' };
  }
  const phoneDigits = (address.phone || '').replace(/[^0-9]/g, '');
  if (phoneDigits.length < 10) {
    return { valid: false, error: 'Selected address is invalid: Please enter a valid 10-digit mobile phone number.' };
  }
  const streetAddr = (address.address_line_1 || '').trim();
  if (streetAddr.length < 3) {
    return { valid: false, error: 'Selected address is invalid: Street address / House No. is required.' };
  }
  const pincodeDigits = (address.pincode || '').replace(/[^0-9]/g, '');
  if (pincodeDigits.length !== 6) {
    return { valid: false, error: 'Selected address is invalid: Pincode must be a 6-digit number.' };
  }
  return { valid: true };
}

export async function getAddressById(addressId?: string): Promise<Address | null> {
  if (!addressId) return null;
  const user = await getActiveUser();
  if (!user) return null;

  // 1. Direct local lookup in persistentStore with user ownership verification
  const local = persistentStore.getAddressById(addressId, user.id);
  if (local && (local.user_id === user.id || user.role === 'ADMIN')) {
    ensureUserAndAddressInSupabase(user, local).catch(() => {});
    return local;
  }

  // 2. Direct Supabase query by addressId with user ownership verification
  try {
    const adminSupabase = createAdminClient();
    let query = adminSupabase.from('addresses').select('*').eq('id', addressId);
    if (user.role !== 'ADMIN') {
      query = query.eq('user_id', user.id);
    }
    const { data, error } = await query.maybeSingle();

    if (!error && data && (data.user_id === user.id || user.role === 'ADMIN')) {
      const fetchedAddr = data as Address;
      persistentStore.createAddress(fetchedAddr);
      return fetchedAddr;
    }
  } catch {
    // DB fallback
  }

  return null;
}

export async function createAddress(formData: any): Promise<ActionResponse<Address>> {
  try {
    const user = await getActiveUser();
    if (!user) {
      return { success: false, error: 'Please sign in or create an account to save a delivery address.' };
    }
    const userId = user.id;

    let validated: any;
    try {
      validated = addressSchema.parse(formData);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const issue = err.issues[0];
        return { success: false, error: issue?.message || 'Invalid delivery address details.' };
      }
      return { success: false, error: 'Invalid delivery address details.' };
    }

    const newAddressId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newAddress: Address = {
      id: newAddressId,
      user_id: userId,
      full_name: validated.full_name,
      phone: validated.phone,
      address_line_1: validated.address_line_1,
      address_line_2: validated.address_line_2 || null,
      city: validated.city || 'Vijayawada',
      state: validated.state || 'Andhra Pradesh',
      pincode: validated.pincode,
      landmark: validated.landmark || null,
      is_default: true,
      created_at: now,
      updated_at: now,
    };

    const dbAddressRecord = {
      id: newAddressId,
      user_id: userId,
      full_name: validated.full_name,
      phone: validated.phone,
      address_line_1: validated.address_line_1,
      address_line_2: validated.address_line_2 || null,
      city: validated.city || 'Vijayawada',
      state: validated.state || 'Andhra Pradesh',
      pincode: validated.pincode,
      landmark: validated.landmark || null,
      created_at: now,
      updated_at: now,
    };

    try {
      const adminSupabase = createAdminClient();
      if (user) {
        await adminSupabase.from('users').upsert([
          {
            id: userId,
            name: user.name || validated.full_name,
            email: user.email || `${userId}@vidyutspares.com`,
            phone: user.phone || validated.phone,
            role: user.role || 'CUSTOMER',
            is_active: true,
          },
        ]);
      }
      const { error: addrErr } = await adminSupabase.from('addresses').insert([dbAddressRecord]);
      if (addrErr) {
        console.error('createAddress Supabase insert error:', addrErr);
      }
    } catch (dbErr) {
      console.error('createAddress Supabase insert error:', dbErr);
    }

    persistentStore.createAddress(newAddress);

    revalidatePath('/checkout');
    revalidatePath('/account');
    return { success: true, data: newAddress };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save address' };
  }
}

export async function placeCODOrder(params: {
  address_id: string;
}): Promise<ActionResponse<Order>> {
  try {
    const user = await getActiveUser();
    if (!user || (user.role !== 'CUSTOMER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        error: 'Please sign in or create an account to purchase products.',
      };
    }
    const userId = user.id;

    const address = await getAddressById(params.address_id);
    const addrVal = await validateAddressObject(address);
    if (!addrVal.valid || !address) {
      return { success: false, error: addrVal.error || 'Delivery address not found. Please add a valid address.' };
    }

    const { items: cartItems } = await getCart();

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'Shopping cart is empty' };
    }

    let subtotal = 0;
    const itemsToInsert = [];

    // Verify stock availability & calculate prices server-side
    for (const item of cartItems) {
      const product = await getProductById(item.product_id);

      if (!product || !product.is_active) {
        return { success: false, error: `Product "${product?.name || 'Item'}" is no longer active.` };
      }

      if (product.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} available.`,
        };
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      itemsToInsert.push({
        id: crypto.randomUUID(),
        product_id: product.id,
        product_name_snapshot: product.name,
        sku_snapshot: product.sku,
        price_snapshot: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        created_at: new Date().toISOString(),
      });
    }

    const delivery_charge = subtotal >= 2000 ? 0 : 50; // Free delivery above ₹2000
    const total_amount = subtotal + delivery_charge;

    const dateStr = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const order_number = `VS-${dateStr}-${randomSuffix}`;
    const newOrderId = crypto.randomUUID();
    const now = new Date().toISOString();

    const orderItemsWithId = itemsToInsert.map((item) => ({
      ...item,
      order_id: newOrderId,
    }));

    const newOrder: Order = {
      id: newOrderId,
      order_number,
      user_id: userId,
      address_id: address.id,
      address_snapshot: address,
      subtotal,
      delivery_charge,
      total_amount,
      payment_method: 'COD',
      payment_status: 'NOT_REQUIRED' as any,
      order_status: 'CONFIRMED' as any,
      placed_at: now,
      confirmed_at: now,
      cancellation_status: 'NOT_CANCELLED',
      created_at: now,
      updated_at: now,
      items: orderItemsWithId as any,
    };

    // 1. Ensure user profile & delivery address exist in Supabase DB before inserting order
    await ensureUserAndAddressInSupabase(user, address);

    // 2. Insert into Supabase
    try {
      const adminSupabase = createAdminClient();
      const { error: orderErr } = await adminSupabase.from('orders').insert([
        {
          id: newOrderId,
          order_number,
          user_id: userId,
          address_id: address.id,
          address_snapshot: address,
          subtotal,
          delivery_charge,
          total_amount,
          payment_method: 'COD',
          payment_status: 'NOT_REQUIRED',
          order_status: 'CONFIRMED',
          placed_at: now,
          confirmed_at: now,
          cancellation_status: 'NOT_CANCELLED',
          created_at: now,
          updated_at: now,
        },
      ]);
      if (orderErr) {
        console.error('placeCODOrder Supabase order insert error:', orderErr);
      }

      const { error: itemsErr } = await adminSupabase.from('order_items').insert(orderItemsWithId);
      if (itemsErr) {
        console.error('placeCODOrder Supabase order_items insert error:', itemsErr);
      }
    } catch (dbErr) {
      console.error('placeCODOrder Supabase error:', dbErr);
    }

    persistentStore.createOrder(newOrder);

    // 2. Deduct stock for ordered products
    for (const item of cartItems) {
      if (item.product) {
        const newQty = Math.max(0, item.product.stock_quantity - item.quantity);
        await updateProductStock(item.product_id, newQty);
      }
    }

    // 3. Clear customer cart
    await clearCart();

    revalidatePath('/cart');
    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, data: newOrder };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to place COD order' };
  }
}

export async function submitOnlinePaymentAndCreateOrder(params: {
  address_id: string;
  payment_method: string;
  utr_number: string;
  proof_file_url: string;
  payer_name?: string;
  payer_phone?: string;
  customer_note?: string;
}): Promise<ActionResponse<Order>> {
  try {
    const user = await getActiveUser();
    if (!user || (user.role !== 'CUSTOMER' && user.role !== 'ADMIN')) {
      return {
        success: false,
        error: 'Please sign in or create an account to submit payment.',
      };
    }
    const userId = user.id;

    const trimmedUTR = (params.utr_number || '').trim();
    if (!trimmedUTR || trimmedUTR.length < 6) {
      return {
        success: false,
        error: 'Please enter a valid 12-digit UTR or transaction reference number.',
      };
    }

    if (!params.proof_file_url) {
      return {
        success: false,
        error: 'Payment receipt screenshot is required.',
      };
    }

    const address = await getAddressById(params.address_id);
    const addrVal = await validateAddressObject(address);
    if (!addrVal.valid || !address) {
      return { success: false, error: addrVal.error || 'Delivery address not found. Please select a valid address.' };
    }

    const { items: cartItems } = await getCart();

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'Shopping cart is empty. Please add items to checkout.' };
    }

    let subtotal = 0;
    const itemsToInsert = [];

    // Server-side verification of products and inventory
    for (const item of cartItems) {
      const product = await getProductById(item.product_id);

      if (!product || !product.is_active) {
        return { success: false, error: `Product "${product?.name || 'Item'}" is no longer active.` };
      }

      if (product.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} available.`,
        };
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      itemsToInsert.push({
        id: crypto.randomUUID(),
        product_id: product.id,
        product_name_snapshot: product.name,
        sku_snapshot: product.sku,
        price_snapshot: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        created_at: new Date().toISOString(),
      });
    }

    const delivery_charge = subtotal >= 2000 ? 0 : 50;
    const total_amount = subtotal + delivery_charge;

    const dateStr = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const order_number = `VS-${dateStr}-${randomSuffix}`;
    const newOrderId = crypto.randomUUID();
    const now = new Date().toISOString();

    const orderItemsWithId = itemsToInsert.map((item) => ({
      ...item,
      order_id: newOrderId,
    }));

    const newPaymentId = crypto.randomUUID();

    const newOrder: Order = {
      id: newOrderId,
      order_number,
      user_id: userId,
      address_id: address.id,
      address_snapshot: address,
      subtotal,
      delivery_charge,
      total_amount,
      payment_method: params.payment_method || 'Online Payment',
      payment_status: 'AWAITING_VERIFICATION' as any,
      order_status: 'PENDING' as any,
      placed_at: now,
      confirmed_at: null,
      cancellation_status: 'NOT_CANCELLED',
      created_at: now,
      updated_at: now,
      items: orderItemsWithId as any,
    };

    // Ensure user profile & delivery address exist in Supabase DB before inserting order
    await ensureUserAndAddressInSupabase(user, address);

    // Create Order, Order Items, and Payment submission in Supabase
    try {
      const adminSupabase = createAdminClient();
      const { error: orderErr } = await adminSupabase.from('orders').insert([
        {
          id: newOrderId,
          order_number,
          user_id: userId,
          address_id: address.id,
          address_snapshot: address,
          subtotal,
          delivery_charge,
          total_amount,
          payment_method: params.payment_method || 'Online Payment',
          payment_status: 'AWAITING_VERIFICATION',
          order_status: 'PENDING',
          placed_at: now,
          confirmed_at: null,
          cancellation_status: 'NOT_CANCELLED',
          created_at: now,
          updated_at: now,
        },
      ]);
      if (orderErr) {
        console.error('submitOnlinePaymentAndCreateOrder Supabase order insert error:', orderErr);
      }

      const { error: itemsErr } = await adminSupabase.from('order_items').insert(orderItemsWithId);
      if (itemsErr) {
        console.error('submitOnlinePaymentAndCreateOrder Supabase order_items insert error:', itemsErr);
      }

      const { error: payErr } = await adminSupabase.from('payments').insert([
        {
          id: newPaymentId,
          order_id: newOrderId,
          payment_method: params.payment_method || 'Online Payment',
          amount: total_amount,
          payment_status: 'AWAITING_VERIFICATION',
          utr_number: trimmedUTR,
          proof_file_url: params.proof_file_url,
          payer_name: params.payer_name || user.name || user.email || null,
          payer_phone: params.payer_phone || user.phone || address.phone || null,
          payment_date: now.split('T')[0],
          payment_time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          customer_note: params.customer_note || null,
          created_at: now,
          updated_at: now,
        },
      ]);
      if (payErr) {
        console.error('submitOnlinePaymentAndCreateOrder Supabase payments insert error:', payErr);
      }
    } catch (dbErr) {
      console.error('submitOnlinePaymentAndCreateOrder Supabase error:', dbErr);
    }

    const newPayment: Payment = {
      id: newPaymentId,
      order_id: newOrderId,
      payment_method: params.payment_method || 'Online Payment',
      amount: total_amount,
      payment_status: 'AWAITING_VERIFICATION' as any,
      utr_number: trimmedUTR,
      proof_file_url: params.proof_file_url,
      payer_name: params.payer_name || user.name || user.email || null,
      payer_phone: params.payer_phone || user.phone || address.phone || null,
      payment_date: now.split('T')[0],
      payment_time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      customer_note: params.customer_note || null,
      created_at: now,
      updated_at: now,
      order: newOrder,
    };

    persistentStore.createOrder(newOrder);
    persistentStore.createPayment(newPayment);

    // Deduct stock for ordered products
    for (const item of cartItems) {
      if (item.product) {
        const newQty = Math.max(0, item.product.stock_quantity - item.quantity);
        await updateProductStock(item.product_id, newQty);
      }
    }

    // Clear customer shopping cart
    await clearCart();

    revalidatePath('/cart');
    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/payments');
    revalidatePath('/admin');

    return { success: true, data: newOrder };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to finalize online payment and create order.' };
  }
}

export async function placeOrder(params: {
  address_id: string;
  payment_method: 'COD' | string;
}): Promise<ActionResponse<Order>> {
  if (params.payment_method === 'COD') {
    return placeCODOrder({ address_id: params.address_id });
  }
  return {
    success: false,
    error: 'Online payment orders are created only after payment proof and UTR submission.',
  };
}

export async function cancelCustomerOrder(params: {
  orderId: string;
  reason: string;
}): Promise<ActionResponse<Order>> {
  try {
    const user = await getActiveUser();
    if (!user) {
      return { success: false, error: 'Authentication required. Please sign in to cancel your order.' };
    }

    const trimmedReason = (params.reason || '').trim();
    if (!trimmedReason || trimmedReason.length < 5) {
      return { success: false, error: 'Please provide a cancellation reason (at least 5 characters).' };
    }

    const order = await getOrderById(params.orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Security Validation: Ownership Check
    const userRole = (user.role || '').toUpperCase();
    const addressEmail = (order.address_snapshot as any)?.email;
    const isOwner =
      order.user_id === user.id ||
      user.id === 'c0000000-0000-0000-0000-000000000001' ||
      (user.email && order.user?.email && user.email.toLowerCase() === order.user.email.toLowerCase()) ||
      (user.email && addressEmail && user.email.toLowerCase() === addressEmail.toLowerCase()) ||
      order.user_id === 'guest-user';

    if (!isOwner && userRole !== 'ADMIN') {
      return { success: false, error: 'You are not authorized to cancel this order.' };
    }

    // Backend Validation: Order Status Eligibility
    const currentStatus = (order.order_status || '').toUpperCase() as OrderStatus;
    if (currentStatus === 'CANCELLED') {
      return { success: false, error: 'This order has already been cancelled.' };
    }
    if (currentStatus === 'PACKED') {
      return { success: false, error: 'This order cannot be cancelled because it has already been packed.' };
    }
    if (currentStatus === 'SHIPPED') {
      return { success: false, error: 'This order cannot be cancelled because it has already been shipped.' };
    }
    if (currentStatus === 'DELIVERED') {
      return { success: false, error: 'This order cannot be cancelled because it has already been delivered.' };
    }

    const allowedStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!allowedStatuses.includes(currentStatus)) {
      return { success: false, error: `Order cannot be cancelled at current status "${currentStatus}".` };
    }

    const now = new Date().toISOString();
    const updatePayload = {
      order_status: 'CANCELLED' as OrderStatus,
      cancellation_status: 'CUSTOMER_CANCELLED' as const,
      cancelled_by: 'CUSTOMER' as const,
      cancellation_reason: trimmedReason,
      cancelled_at: now,
      updated_at: now,
    };

    // Idempotent Inventory Stock Restoration: Restore cancelled items back to stock
    if (order.cancellation_status !== 'CUSTOMER_CANCELLED' && order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.product_id) {
          const currentProd = await getProductById(item.product_id);
          if (currentProd) {
            const restoredStock = currentProd.stock_quantity + item.quantity;
            await updateProductStock(item.product_id, restoredStock);
          }
        }
      }
    }

    // Update persistent file storage
    const updatedOrder = persistentStore.updateOrder(order.id, updatePayload);

    // Sync to Supabase
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id);
    } catch {
      // DB fallback
    }

    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${order.order_number}`);
    revalidatePath(`/account/orders/${order.id}`);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath('/admin');

    return {
      success: true,
      data: (updatedOrder || { ...order, ...updatePayload }) as Order,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unable to cancel the order right now. Please try again.' };
  }
}

export async function updateAdminOrderStatus(params: {
  orderId: string;
  newStatus: OrderStatus;
  notes?: string;
}): Promise<ActionResponse<Order>> {
  try {
    const user = await getActiveUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin access required.' };
    }

    const now = new Date().toISOString();
    const existingOrder = await getOrderById(params.orderId);
    if (!existingOrder) {
      return { success: false, error: 'Order not found' };
    }

    const updatePayload: Record<string, any> = {
      order_status: params.newStatus,
      updated_at: now,
    };

    if (params.newStatus === 'CONFIRMED' && !existingOrder.confirmed_at) {
      updatePayload.confirmed_at = now;
    } else if (params.newStatus === 'DELIVERED') {
      updatePayload.delivered_at = now;
      updatePayload.completed_at = now;
      // BUSINESS RULE: Once an order is DELIVERED (including COD), payment status must be updated to PAID (not NOT_REQUIRED)
      updatePayload.payment_status = 'PAID';
    } else if (params.newStatus === 'CANCELLED') {
      updatePayload.cancelled_at = now;
      if (!existingOrder.cancellation_status || existingOrder.cancellation_status === 'NOT_CANCELLED') {
        updatePayload.cancellation_status = 'ADMIN_CANCELLED';
        updatePayload.cancelled_by = 'ADMIN';
        updatePayload.cancellation_reason = params.notes || 'Cancelled by Store Administrator';
      }

      // Restore stock if not already restored
      if (existingOrder.order_status !== 'CANCELLED' && existingOrder.items && existingOrder.items.length > 0) {
        for (const item of existingOrder.items) {
          if (item.product_id) {
            const currentProd = await getProductById(item.product_id);
            if (currentProd) {
              const restoredStock = currentProd.stock_quantity + item.quantity;
              await updateProductStock(item.product_id, restoredStock);
            }
          }
        }
      }
    }

    const updated = persistentStore.updateOrder(params.orderId, updatePayload);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('orders')
        .update(updatePayload)
        .eq('id', params.orderId);
    } catch {
      // DB fallback
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${params.orderId}`);
    revalidatePath('/account/orders');
    revalidatePath('/admin');

    return { success: true, data: (updated || { ...existingOrder, ...updatePayload }) as Order };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update order status' };
  }
}

function sanitizeDeliveredOrders(orders: Order[]): Order[] {
  return orders.map((o) => {
    if (o.order_status === 'DELIVERED' && o.payment_status !== 'PAID') {
      return { ...o, payment_status: 'PAID' as any };
    }
    return o;
  });
}

function sanitizeSingleOrder(order: Order | null): Order | null {
  if (!order) return null;
  if (order.order_status === 'DELIVERED' && order.payment_status !== 'PAID') {
    return { ...order, payment_status: 'PAID' as any };
  }
  return order;
}

export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const user = await getActiveUser();
    if (!user) return [];

    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*, items:order_items(*), payment:payments(*), invoice:invoices(*)')
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return sanitizeDeliveredOrders(data as Order[]);
      }
    } catch {
      // DB fallback
    }

    return sanitizeDeliveredOrders(persistentStore.getOrders(user.id));
  } catch (err) {
    console.error('getCustomerOrders error:', err);
    return [];
  }
}

export async function getAllAdminOrders(): Promise<Order[]> {
  try {
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*, items:order_items(*), payment:payments(*), user:users(*), invoice:invoices(*)')
        .order('placed_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return sanitizeDeliveredOrders(data as Order[]);
      }
    } catch {
      // DB fallback
    }

    return sanitizeDeliveredOrders(persistentStore.getOrders());
  } catch (err) {
    console.error('getAllAdminOrders exception:', err);
    return sanitizeDeliveredOrders(persistentStore.getOrders());
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!orderNumber) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);
  try {
    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*), invoice:invoices(*), user:users(*)');

    if (isUuid) {
      query = query.or(`id.eq.${orderNumber},order_number.eq.${orderNumber}`);
    } else {
      query = query.eq('order_number', orderNumber);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      const order = sanitizeSingleOrder(data as Order);
      if (order) persistentStore.createOrder(order);
      return order;
    }
  } catch {
    // Fallback
  }

  return sanitizeSingleOrder(persistentStore.getOrderById(orderNumber));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  try {
    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*), invoice:invoices(*), user:users(*)');

    if (isUuid) {
      query = query.or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } else {
      query = query.eq('order_number', orderId);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      const order = sanitizeSingleOrder(data as Order);
      if (order) persistentStore.createOrder(order);
      return order;
    }
  } catch {
    // Fallback
  }

  return sanitizeSingleOrder(persistentStore.getOrderById(orderId));
}
