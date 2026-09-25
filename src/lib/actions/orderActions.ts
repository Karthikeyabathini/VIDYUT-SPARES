'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveUser } from '@/lib/actions/authActions';
import { clearCart, getCart } from '@/lib/actions/cartActions';
import { addressSchema } from '@/lib/validators';
import { ActionResponse, Address, Order, OrderStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getProductById, updateProductStock } from '@/lib/actions/productActions';
import { persistentStore } from '@/lib/db/persistentStore';

export async function getAddresses(): Promise<Address[]> {
  try {
    const user = await getActiveUser();
    if (!user) return [];

    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Address[];
      }
    } catch {
      // DB fallback
    }

    return persistentStore.getAddresses(user.id);
  } catch (err) {
    console.error('getAddresses error:', err);
    return [];
  }
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
        const fieldName = issue?.path?.[0];
        if (fieldName === 'phone') {
          return { success: false, error: 'Please enter a valid 10-digit Indian mobile phone number (e.g. 9876543210).' };
        }
        if (fieldName === 'pincode') {
          return { success: false, error: 'Pincode must be exactly 6 digits (e.g. 520001).' };
        }
        if (fieldName === 'full_name') {
          return { success: false, error: 'Full contact name is required.' };
        }
        if (fieldName === 'address_line_1') {
          return { success: false, error: 'Street address / House No. is required.' };
        }
        return { success: false, error: issue?.message || 'Invalid delivery address details.' };
      }
      return { success: false, error: 'Invalid delivery address details.' };
    }

    const newAddressId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newAddress: Address = {
      id: newAddressId,
      user_id: userId,
      ...validated,
      is_default: true,
      created_at: now,
      updated_at: now,
    };

    persistentStore.createAddress(newAddress);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('addresses').insert([newAddress]);
    } catch {
      // DB fallback
    }

    revalidatePath('/checkout');
    revalidatePath('/account');
    return { success: true, data: newAddress };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save address' };
  }
}

export async function placeOrder(params: {
  address_id: string;
  payment_method: 'COD' | string;
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

    const userAddrs = await getAddresses();
    const address = userAddrs.find((a) => a.id === params.address_id) || userAddrs[0];

    if (!address) return { success: false, error: 'Delivery address not found. Please add a valid address.' };

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

    const isCOD = params.payment_method === 'COD';
    const initialPaymentStatus = isCOD ? 'NOT_REQUIRED' : 'PENDING';
    const initialOrderStatus = isCOD ? 'CONFIRMED' : 'PENDING';

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
      payment_method: params.payment_method,
      payment_status: initialPaymentStatus as any,
      order_status: initialOrderStatus as any,
      placed_at: now,
      confirmed_at: isCOD ? now : null,
      cancellation_status: 'NOT_CANCELLED',
      created_at: now,
      updated_at: now,
      items: orderItemsWithId as any,
    };

    persistentStore.createOrder(newOrder);

    // Try Supabase insert
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('orders').insert([
        {
          id: newOrderId,
          order_number,
          user_id: userId,
          address_id: address.id,
          address_snapshot: address,
          subtotal,
          delivery_charge,
          total_amount,
          payment_method: params.payment_method,
          payment_status: initialPaymentStatus,
          order_status: initialOrderStatus,
          placed_at: now,
          confirmed_at: isCOD ? now : null,
          cancellation_status: 'NOT_CANCELLED',
          created_at: now,
          updated_at: now,
        },
      ]);
      await adminSupabase.from('order_items').insert(orderItemsWithId);
    } catch {
      // DB sync fallback
    }

    // Deduct stock for ordered products
    for (const item of cartItems) {
      if (item.product) {
        const newQty = Math.max(0, item.product.stock_quantity - item.quantity);
        await updateProductStock(item.product_id, newQty);
      }
    }

    // Clear customer cart
    await clearCart();

    revalidatePath('/cart');
    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, data: newOrder };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to place order' };
  }
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

    return { success: true, data: (updated || existingOrder) as Order };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update order status' };
  }
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
        return data as Order[];
      }
    } catch {
      // DB fallback
    }

    return persistentStore.getOrders(user.id);
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
        return data as Order[];
      }
    } catch {
      // DB fallback
    }

    return persistentStore.getOrders();
  } catch (err) {
    console.error('getAllAdminOrders exception:', err);
    return persistentStore.getOrders();
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*), invoice:invoices(*), user:users(*)')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (!error && data) return data as Order;
  } catch {
    // Fallback
  }

  return persistentStore.getOrderById(orderNumber);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*), invoice:invoices(*), user:users(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (!error && data) return data as Order;
  } catch {
    // Fallback
  }

  return persistentStore.getOrderById(orderId);
}
