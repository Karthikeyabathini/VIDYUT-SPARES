'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { productSchema } from '@/lib/validators';
import { ActionResponse, Category, Product } from '@/types';
import { revalidatePath } from 'next/cache';
import { persistentStore } from '@/lib/db/persistentStore';

export interface ProductFilterParams {
  search?: string;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  includeInactive?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
}

export async function getCategories(): Promise<Category[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  } catch (err) {
    // Supabase table missing or connection fallback
  }

  return persistentStore.getCategories();
}

export async function createCategory(formData: {
  name: string;
  description?: string;
  image_url?: string;
}): Promise<ActionResponse<Category>> {
  try {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newCat: Category = {
      id: newId,
      name: formData.name,
      slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    persistentStore.createCategory(newCat);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('categories').insert([newCat]);
    } catch {
      // Ignore DB sync error
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    return { success: true, data: newCat };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create category' };
  }
}

export async function getProducts(params?: ProductFilterParams): Promise<Product[]> {
  let list: Product[] = [];

  try {
    const adminSupabase = createAdminClient();
    let query = adminSupabase.from('products').select('*, category:categories(*)');

    if (!params?.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (params?.inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      list = data as Product[];
    }
  } catch {
    // DB fallback
  }

  if (list.length === 0) {
    list = persistentStore.getProducts();
  }

  // Filter inactive
  if (!params?.includeInactive) {
    list = list.filter((p) => p.is_active);
  }

  // Filter in-stock
  if (params?.inStockOnly) {
    list = list.filter((p) => p.stock_quantity > 0);
  }

  // Apply category filter
  if (params?.categorySlug) {
    list = list.filter(
      (p) => (p.category as any)?.slug === params.categorySlug || p.category_id === params.categorySlug
    );
  }

  // Apply search filter
  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Apply sorting
  if (params?.sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params?.sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (params?.sortBy === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) return data as Product;
  } catch {
    // Fallback
  }

  return persistentStore.getProductBySlug(slug);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) return data as Product;
  } catch {
    // Fallback
  }

  return persistentStore.getProductById(id);
}

export async function createProduct(formData: any): Promise<ActionResponse<Product>> {
  try {
    const validated = productSchema.parse(formData);

    const slug =
      validated.slug ||
      validated.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);

    const cleanPrefix = validated.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') || 'VS';
    const sku = validated.sku || `VS-${cleanPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProductId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newProduct: Product = {
      id: newProductId,
      name: validated.name,
      slug,
      sku,
      category_id: validated.category_id,
      brand: validated.brand,
      price: validated.price,
      stock_quantity: validated.stock_quantity,
      low_stock_threshold: validated.low_stock_threshold ?? 5,
      description: validated.description || null,
      image_url: validated.image_url || '/vs-logo.svg',
      is_active: validated.is_active ?? true,
      created_at: now,
      updated_at: now,
    };

    // Save to persistent file storage
    persistentStore.createProduct(newProduct);

    // Try DB sync
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('products').insert([newProduct]);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true, data: newProduct };
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      const firstMsg = err.errors?.[0]?.message || 'Invalid product details';
      return { success: false, error: firstMsg };
    }
    return { success: false, error: err?.message || 'Failed to create product' };
  }
}

export async function updateProduct(id: string, formData: any): Promise<ActionResponse<Product>> {
  try {
    const validated = productSchema.parse(formData);
    const existing = await getProductById(id);

    const now = new Date().toISOString();
    const updatePayload: Partial<Product> = {
      name: validated.name,
      slug: validated.slug || existing?.slug,
      sku: validated.sku || existing?.sku,
      category_id: validated.category_id,
      brand: validated.brand,
      price: validated.price,
      stock_quantity: validated.stock_quantity,
      low_stock_threshold: validated.low_stock_threshold ?? existing?.low_stock_threshold ?? 5,
      description: validated.description || null,
      image_url: validated.image_url || existing?.image_url || '/vs-logo.svg',
      is_active: validated.is_active ?? existing?.is_active ?? true,
      updated_at: now,
    };

    const updated = persistentStore.updateProduct(id, updatePayload);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('products')
        .update(updatePayload)
        .eq('id', id);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true, data: updated || (existing as Product) };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update product' };
  }
}

export async function toggleProductActive(id: string, is_active: boolean): Promise<ActionResponse> {
  try {
    persistentStore.updateProduct(id, { is_active });

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('products')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to toggle product status' };
  }
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
  try {
    persistentStore.deleteProduct(id);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase.from('products').delete().eq('id', id);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete product' };
  }
}

export async function updateProductStock(id: string, newStockQuantity: number): Promise<ActionResponse<Product>> {
  try {
    const updated = persistentStore.updateProductStock(id, newStockQuantity);

    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('products')
        .update({ stock_quantity: newStockQuantity, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // DB sync fallback
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    return { success: true, data: updated as Product };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update product stock' };
  }
}
