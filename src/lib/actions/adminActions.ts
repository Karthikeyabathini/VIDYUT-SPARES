'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { paymentMethodSchema } from '@/lib/validators';
import { ActionResponse, AdminAuditLog, PaymentMethod, StockMovement } from '@/types';
import { revalidatePath } from 'next/cache';
import { getAllAdminOrders } from '@/lib/actions/orderActions';
import { getActiveUser } from '@/lib/actions/authActions';
import { persistentStore } from '@/lib/db/persistentStore';

export async function getAdminDashboardStats() {
  try {
    const products = persistentStore.getProducts();
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.is_active).length;
    const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
    const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5)).length;

    const orders = await getAllAdminOrders();
    const totalOrders = orders.length;
    const pendingPaymentApprovals = orders.filter((o) => o.payment_status === 'AWAITING_VERIFICATION').length;
    const paidOrders = orders.filter((o) => o.payment_status === 'PAID' || o.payment_status === 'NOT_REQUIRED');
    const totalSales = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    const pendingOrders = orders.filter((o) => o.order_status === 'PENDING' || o.order_status === 'CONFIRMED').length;
    const processingOrders = orders.filter((o) => o.order_status === 'PROCESSING').length;
    const deliveredOrders = orders.filter((o) => o.order_status === 'DELIVERED').length;

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      totalOrders,
      pendingPaymentApprovals,
      paidOrdersCount: paidOrders.length,
      totalSales,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      customerCount: 1,
    };
  } catch (err) {
    console.error('getAdminDashboardStats error:', err);
    return {
      totalProducts: 0,
      activeProducts: 0,
      outOfStock: 0,
      lowStock: 0,
      totalOrders: 0,
      pendingPaymentApprovals: 0,
      paidOrdersCount: 0,
      totalSales: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      customerCount: 0,
    };
  }
}

// Payment Methods Admin Management
export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('payment_methods')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as PaymentMethod[];
      }
    } catch {
      // DB fallback
    }

    return persistentStore.getPaymentMethods();
  } catch (err) {
    console.error('getAllPaymentMethods error:', err);
    return persistentStore.getPaymentMethods();
  }
}

export async function createPaymentMethod(formData: any): Promise<ActionResponse<PaymentMethod>> {
  try {
    const validated = paymentMethodSchema.parse(formData);
    const newPm: PaymentMethod = {
      id: crypto.randomUUID(),
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    persistentStore.createPaymentMethod(newPm);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('payment_methods').insert([newPm]);
    } catch {
      // DB fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/payment-methods');
    revalidatePath('/checkout');
    return { success: true, data: newPm };
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      const firstMsg = err.errors?.[0]?.message || 'Invalid payment method fields';
      return { success: false, error: firstMsg };
    }
    return { success: false, error: err?.message || 'Failed to create payment method' };
  }
}

export async function togglePaymentMethodActive(id: string, is_active: boolean): Promise<ActionResponse> {
  try {
    persistentStore.togglePaymentMethod(id, is_active);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('payment_methods')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // DB fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/payment-methods');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to toggle status' };
  }
}

export async function deletePaymentMethod(id: string): Promise<ActionResponse> {
  try {
    persistentStore.deletePaymentMethod(id);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('payment_methods').delete().eq('id', id);
    } catch {
      // DB fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/payment-methods');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete payment method' };
  }
}

// Manual Stock Adjustment with Audit Logging
export async function adjustProductStock(params: {
  product_id: string;
  adjustment_quantity: number;
  reason: string;
}): Promise<ActionResponse> {
  try {
    const product = persistentStore.getProductById(params.product_id);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const newStock = product.stock_quantity + params.adjustment_quantity;
    if (newStock < 0) {
      return { success: false, error: 'Stock cannot be reduced below zero' };
    }

    persistentStore.updateProductStock(params.product_id, newStock);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('products')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', params.product_id);
    } catch {
      // DB fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to adjust stock' };
  }
}

// Stock Movements Log
export async function getStockMovements(): Promise<StockMovement[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('stock_movements')
      .select('*, product:products(*), admin:users(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as StockMovement[];
    }
    return [];
  } catch (err) {
    console.error('getStockMovements error:', err);
    return [];
  }
}

// Audit Logs
export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('admin_audit_logs')
      .select('*, admin:users(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as AdminAuditLog[];
    }
    return [];
  } catch (err) {
    console.error('getAdminAuditLogs error:', err);
    return [];
  }
}

// Custom Date Range Report Query
export async function getFilteredBusinessHistory(params: {
  fromDate?: string;
  toDate?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}) {
  try {
    const orders = persistentStore.getOrders();
    const totalOrders = orders.length;
    const totalSales = orders
      .filter((o) => o.payment_status === 'PAID')
      .reduce((acc, o) => acc + (o.total_amount || 0), 0);

    const totalItemsSold = orders
      .filter((o) => o.payment_status === 'PAID')
      .reduce((acc, o) => {
        const itemQty = o.items?.reduce((iAcc: number, item: any) => iAcc + item.quantity, 0) || 0;
        return acc + itemQty;
      }, 0);

    const codOrders = orders.filter((o) => o.payment_method === 'COD').length;
    const onlineOrders = orders.filter((o) => o.payment_method !== 'COD').length;
    const pendingVerification = orders.filter((o) => o.payment_status === 'AWAITING_VERIFICATION').length;
    const rejectedPayments = orders.filter((o) => o.payment_status === 'REJECTED').length;
    const cancelledOrders = orders.filter((o) => o.order_status === 'CANCELLED').length;

    return {
      orders,
      summary: {
        totalOrders,
        totalSales,
        totalItemsSold,
        codOrders,
        onlineOrders,
        pendingVerification,
        rejectedPayments,
        cancelledOrders,
      },
    };
  } catch {
    return {
      orders: [],
      summary: {
        totalOrders: 0,
        totalSales: 0,
        totalItemsSold: 0,
        codOrders: 0,
        onlineOrders: 0,
        pendingVerification: 0,
        rejectedPayments: 0,
        cancelledOrders: 0,
      },
    };
  }
}
