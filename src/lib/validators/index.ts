import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit Indian mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid contact number is required'),
  address_line_1: z.string().min(5, 'Street address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(2, 'City name is required').default('Vijayawada'),
  state: z.string().min(2, 'State name is required').default('Andhra Pradesh'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  landmark: z.string().optional(),
});

export const paymentProofSchema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.string().min(1, 'Payment method required'),
  amount: z.number().positive('Amount must be greater than 0'),
  utr_number: z.string().min(6, 'UTR / Reference number must be at least 6 characters'),
  proof_file_url: z.string().url('Proof image upload required'),
  payer_name: z.string().optional(),
  payer_phone: z.string().optional(),
  payment_date: z.string().min(1, 'Payment date required'),
  payment_time: z.string().min(1, 'Payment time required'),
  customer_note: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name required'),
  slug: z.string().optional(),
  sku: z.string().optional(),
  category_id: z.string().min(1, 'Please select a category'),
  brand: z.string().min(1, 'Brand name required'),
  price: z.number().min(0, 'Price cannot be negative'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  low_stock_threshold: z.number().int().min(0, 'Low stock threshold cannot be negative').default(5),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const paymentMethodSchema = z.object({
  type: z.enum(['COD', 'UPI_QR', 'UPI_NUMBER', 'BANK_TRANSFER']),
  display_name: z.string().min(2, 'Display name required'),
  provider: z.string().optional().nullable(),
  upi_id: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  qr_image_url: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const rejectionSchema = z.object({
  rejection_reason: z.string().min(5, 'Rejection reason must be at least 5 characters long'),
});
