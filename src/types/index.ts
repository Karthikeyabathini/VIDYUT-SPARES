export type UserRole = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'AWAITING_VERIFICATION'
  | 'PAID'
  | 'REJECTED'
  | 'REFUNDED'
  | 'NOT_REQUIRED';

export type PaymentMethodType = 'COD' | 'UPI_QR' | 'UPI_NUMBER' | 'BANK_TRANSFER';

export type StockMovementType =
  | 'ORDER'
  | 'RESTOCK'
  | 'MANUAL_ADJUSTMENT'
  | 'CANCELLATION'
  | 'RETURN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  category_id: string;
  brand: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  display_name: string;
  provider?: string | null;
  upi_id?: string | null;
  phone_number?: string | null;
  qr_image_url?: string | null;
  instructions?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string;
  address_snapshot: Address;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  placed_at: string;
  confirmed_at?: string | null;
  completed_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_status?: 'NOT_CANCELLED' | 'CUSTOMER_CANCELLED' | 'ADMIN_CANCELLED';
  cancelled_by?: 'CUSTOMER' | 'ADMIN' | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: UserProfile;
  payment?: Payment;
  invoice?: Invoice;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  payment_status: PaymentStatus;
  utr_number: string;
  proof_file_url: string;
  payer_name?: string | null;
  payer_phone?: string | null;
  payment_date: string;
  payment_time: string;
  customer_note?: string | null;
  admin_note?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type?: string | null;
  reference_id?: string | null;
  reason?: string | null;
  created_by?: string | null;
  created_at: string;
  product?: Product;
  admin?: UserProfile;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
  admin?: UserProfile;
}

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
