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
    
    // BUSINESS RULE: Total Sales Revenue is strictly calculated from DELIVERED orders ONLY
    const deliveredOrdersList = orders.filter((o) => o.order_status === 'DELIVERED');
    const totalSales = deliveredOrdersList.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    // Current Calendar Month Delivered Sales (e.g. 1st of month to end of month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthDeliveredList = deliveredOrdersList.filter((o) => new Date(o.placed_at) >= startOfMonth);
    const currentMonthSales = currentMonthDeliveredList.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const currentMonthName = now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

    const pendingOrders = orders.filter((o) => o.order_status === 'PENDING' || o.order_status === 'CONFIRMED').length;
    const processingOrders = orders.filter((o) => o.order_status === 'PROCESSING').length;
    const deliveredOrders = deliveredOrdersList.length;

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      totalOrders,
      pendingPaymentApprovals,
      paidOrdersCount: paidOrders.length,
      totalSales,
      currentMonthSales,
      currentMonthName,
      deliveredOrdersList,
      currentMonthDeliveredList,
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
      currentMonthSales: 0,
      currentMonthName: '',
      deliveredOrdersList: [],
      currentMonthDeliveredList: [],
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

    await logAdminAudit(
      'CREATE_PAYMENT_METHOD',
      'PAYMENT_METHOD',
      newPm.id,
      `Created payment method "${newPm.display_name}" (${newPm.type})`
    );

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

    await logAdminAudit(
      'TOGGLE_PAYMENT_METHOD',
      'PAYMENT_METHOD',
      id,
      `Set payment method ID ${id} active state to ${is_active}`
    );

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

    await logAdminAudit(
      'DELETE_PAYMENT_METHOD',
      'PAYMENT_METHOD',
      id,
      `Deleted payment method ID ${id}`
    );

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

    await logAdminAudit(
      'STOCK_ADJUSTMENT',
      'PRODUCT',
      params.product_id,
      `Adjusted stock for "${product.name}" from ${product.stock_quantity} to ${newStock} (${params.adjustment_quantity > 0 ? '+' : ''}${params.adjustment_quantity}). Reason: ${params.reason}`
    );

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
export async function logAdminAudit(
  action: string,
  entity_type: string,
  entity_id: string,
  description: string
): Promise<void> {
  try {
    const user = await getActiveUser();
    const adminUserId = user?.id || 'c0000000-0000-0000-0000-000000000001';
    const now = new Date().toISOString();
    const auditId = crypto.randomUUID();

    const logPayload: AdminAuditLog = {
      id: auditId,
      admin_user_id: adminUserId,
      action,
      entity_type,
      entity_id,
      description,
      created_at: now,
      admin: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            role: user.role,
            is_active: true,
            created_at: now,
            updated_at: now,
          }
        : {
            id: 'c0000000-0000-0000-0000-000000000001',
            name: 'VIDYUT SPARES Store Admin',
            email: 'admin@vidyutspares.com',
            phone: '9440146599',
            role: 'ADMIN',
            is_active: true,
            created_at: now,
            updated_at: now,
          },
    };

    persistentStore.createAuditLog(logPayload);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('admin_audit_logs').insert([
        {
          id: auditId,
          admin_user_id: adminUserId,
          action,
          entity_type,
          entity_id,
          description,
          created_at: now,
        },
      ]);
    } catch {
      // Supabase audit logging fallback
    }
  } catch (err) {
    console.error('logAdminAudit error:', err);
  }
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  try {
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('admin_audit_logs')
        .select('*, admin:users(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as AdminAuditLog[];
      }
    } catch {
      // DB fallback
    }
    return persistentStore.getAuditLogs();
  } catch (err) {
    console.error('getAdminAuditLogs error:', err);
    return persistentStore.getAuditLogs();
  }
}

// Store Profile Configuration
export async function getStoreConfig(): Promise<import('@/types').StoreConfig> {
  try {
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from('store_settings')
        .select('*')
        .eq('id', 'config_1')
        .maybeSingle();

      if (!error && data) {
        return data as import('@/types').StoreConfig;
      }
    } catch {
      // DB fallback
    }
    return persistentStore.getStoreConfig();
  } catch (err) {
    return persistentStore.getStoreConfig();
  }
}

export async function updateStoreConfig(
  formData: Partial<import('@/types').StoreConfig>
): Promise<ActionResponse<import('@/types').StoreConfig>> {
  try {
    const user = await getActiveUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    const updatedConfig = persistentStore.updateStoreConfig(formData);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('store_settings').upsert({
        id: 'config_1',
        ...updatedConfig,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // DB fallback
    }

    await logAdminAudit(
      'UPDATE_STORE_PROFILE',
      'STORE_CONFIG',
      'config_1',
      `Updated Store Profile Config: Business Name "${updatedConfig.business_name}", Phone "${updatedConfig.store_phone}", Address "${updatedConfig.store_address.slice(0, 30)}..."`
    );

    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    revalidatePath('/contact');
    return { success: true, data: updatedConfig };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update store configuration.' };
  }
}

// Custom Date Range Report Query with Supabase PostgreSQL Live Data & Analytics
export async function getFilteredBusinessHistory(params: {
  fromDate?: string;
  toDate?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}) {
  try {
    const allOrders = await getAllAdminOrders();

    // Filter by date range (fromDate & toDate in YYYY-MM-DD format)
    let filtered = allOrders;

    if (params.fromDate) {
      const fromTimestamp = new Date(`${params.fromDate}T00:00:00`).getTime();
      filtered = filtered.filter((o) => new Date(o.placed_at).getTime() >= fromTimestamp);
    }

    if (params.toDate) {
      const toTimestamp = new Date(`${params.toDate}T23:59:59.999`).getTime();
      filtered = filtered.filter((o) => new Date(o.placed_at).getTime() <= toTimestamp);
    }

    if (params.orderStatus && params.orderStatus !== 'ALL') {
      filtered = filtered.filter((o) => o.order_status === params.orderStatus);
    }

    if (params.paymentStatus && params.paymentStatus !== 'ALL') {
      filtered = filtered.filter((o) => o.payment_status === params.paymentStatus);
    }

    if (params.paymentMethod && params.paymentMethod !== 'ALL') {
      filtered = filtered.filter((o) => o.payment_method === params.paymentMethod);
    }

    const totalOrders = filtered.length;
    const deliveredOrders = filtered.filter((o) => o.order_status === 'DELIVERED');
    
    // BUSINESS RULE: Revenue is strictly calculated from DELIVERED orders ONLY
    const totalSales = deliveredOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    const totalItemsSold = deliveredOrders.reduce((acc, o) => {
      const itemQty = o.items?.reduce((iAcc: number, item: any) => iAcc + item.quantity, 0) || 0;
      return acc + itemQty;
    }, 0);

    const codOrders = filtered.filter((o) => o.payment_method === 'COD').length;
    const onlineOrders = filtered.filter((o) => o.payment_method !== 'COD').length;
    const pendingVerification = filtered.filter((o) => o.payment_status === 'AWAITING_VERIFICATION').length;
    const rejectedPayments = filtered.filter((o) => o.payment_status === 'REJECTED').length;
    const cancelledOrders = filtered.filter((o) => o.order_status === 'CANCELLED').length;
    const deliveredCount = deliveredOrders.length;

    // GENERATE GRAPH ANALYTICS TREND DATA
    // Group delivered orders by date (or month if date range spans > 60 days)
    const trendMap: Record<string, { label: string; revenue: number; orderCount: number }> = {};

    deliveredOrders.forEach((o) => {
      const d = new Date(o.placed_at);
      const dateKey = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { label: dateKey, revenue: 0, orderCount: 0 };
      }
      trendMap[dateKey].revenue += o.total_amount || 0;
      trendMap[dateKey].orderCount += 1;
    });

    const chartData = Object.values(trendMap);

    // Calculate percentage increase / decrease vs previous period if range provided
    let growthPercentage = 0;
    if (chartData.length >= 2) {
      const currentHalf = chartData.slice(Math.floor(chartData.length / 2));
      const previousHalf = chartData.slice(0, Math.floor(chartData.length / 2));
      const currentRev = currentHalf.reduce((sum, item) => sum + item.revenue, 0);
      const previousRev = previousHalf.reduce((sum, item) => sum + item.revenue, 0);

      if (previousRev > 0) {
        growthPercentage = Math.round(((currentRev - previousRev) / previousRev) * 100);
      } else if (currentRev > 0) {
        growthPercentage = 100;
      }
    }

    return {
      orders: filtered,
      summary: {
        totalOrders,
        totalSales,
        totalItemsSold,
        deliveredCount,
        codOrders,
        onlineOrders,
        pendingVerification,
        rejectedPayments,
        cancelledOrders,
        growthPercentage,
      },
      chartData,
    };
  } catch (err) {
    console.error('getFilteredBusinessHistory error:', err);
    return {
      orders: [],
      summary: {
        totalOrders: 0,
        totalSales: 0,
        totalItemsSold: 0,
        deliveredCount: 0,
        codOrders: 0,
        onlineOrders: 0,
        pendingVerification: 0,
        rejectedPayments: 0,
        cancelledOrders: 0,
        growthPercentage: 0,
      },
      chartData: [],
    };
  }
}
