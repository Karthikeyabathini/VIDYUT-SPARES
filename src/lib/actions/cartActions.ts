'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveUser } from '@/lib/actions/authActions';
import { getProductById } from '@/lib/actions/productActions';
import { ActionResponse, CartItem } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function getCartCookieKey(): Promise<string> {
  const user = await getActiveUser();
  if (user) {
    return `vs_cart_user_${user.id}`;
  }
  const cookieStore = await cookies();
  let guestId = cookieStore.get('vs_guest_cart_session')?.value;
  if (!guestId) {
    guestId = `guest-${crypto.randomUUID()}`;
    try {
      cookieStore.set('vs_guest_cart_session', guestId, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    } catch {
      // Ignore cookie set warning
    }
  }
  return `vs_cart_guest_${guestId}`;
}

async function getCartFromCookie(): Promise<CartItem[]> {
  try {
    const key = await getCartCookieKey();
    const cookieStore = await cookies();
    const raw = cookieStore.get(key)?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveCartToCookie(items: CartItem[]): Promise<void> {
  try {
    const key = await getCartCookieKey();
    const cookieStore = await cookies();
    cookieStore.set(key, JSON.stringify(items), {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
  } catch (err) {
    console.error('saveCartToCookie error:', err);
  }
}

export async function getCart(): Promise<{ items: CartItem[]; subtotal: number }> {
  try {
    const user = await getActiveUser();

    // 1. Try DB read if user is logged in
    if (user) {
      try {
        const adminSupabase = createAdminClient();
        const { data: cart } = await adminSupabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cart) {
          const { data: items, error } = await adminSupabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('cart_id', cart.id)
            .order('created_at', { ascending: true });

          if (!error && items && items.length > 0) {
            const cartItems = items as CartItem[];
            const subtotal = cartItems.reduce((acc, item) => {
              const price = item.product?.price || 0;
              return acc + price * item.quantity;
            }, 0);
            return { items: cartItems, subtotal };
          }
        }
      } catch {
        // Fallback to cookie store
      }
    }

    // 2. Cookie store fallback (works for guest & user seamlessly when DB table missing)
    const cookieItems = await getCartFromCookie();
    const itemsWithProd: CartItem[] = [];

    for (const item of cookieItems) {
      const prod = await getProductById(item.product_id);
      if (prod && prod.is_active) {
        itemsWithProd.push({ ...item, product: prod });
      }
    }

    const subtotal = itemsWithProd.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0);

    return { items: itemsWithProd, subtotal };
  } catch (err) {
    console.error('getCart error:', err);
    return { items: [], subtotal: 0 };
  }
}

export async function addToCart(productId: string, quantity: number = 1): Promise<ActionResponse> {
  try {
    const product = await getProductById(productId);

    if (!product || !product.is_active) {
      return { success: false, error: 'This electrical product is no longer available' };
    }

    const user = await getActiveUser();

    // 1. Always update cookie cart store to guarantee immediate persistence
    const currentItems = await getCartFromCookie();
    const existingIdx = currentItems.findIndex((i) => i.product_id === productId);
    const newQty = (existingIdx >= 0 ? currentItems[existingIdx].quantity : 0) + quantity;

    if (newQty > product.stock_quantity) {
      return {
        success: false,
        error: `Only ${product.stock_quantity} units available in stock.`,
      };
    }

    if (existingIdx >= 0) {
      currentItems[existingIdx].quantity = newQty;
      currentItems[existingIdx].updated_at = new Date().toISOString();
    } else {
      currentItems.push({
        id: crypto.randomUUID(),
        cart_id: `cart-${user?.id || 'guest'}`,
        product_id: productId,
        quantity: newQty,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product,
      });
    }

    await saveCartToCookie(currentItems);

    // 2. DB Sync attempt if user logged in
    if (user) {
      try {
        const adminSupabase = createAdminClient();
        let { data: cart } = await adminSupabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!cart) {
          const { data: newCart } = await adminSupabase
            .from('carts')
            .insert([{ user_id: user.id }])
            .select('id')
            .single();
          cart = newCart;
        }

        if (cart) {
          const { data: existingItem } = await adminSupabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .maybeSingle();

          if (existingItem) {
            await adminSupabase
              .from('cart_items')
              .update({ quantity: newQty, updated_at: new Date().toISOString() })
              .eq('id', existingItem.id);
          } else {
            await adminSupabase.from('cart_items').insert([
              {
                id: crypto.randomUUID(),
                cart_id: cart.id,
                product_id: productId,
                quantity: newQty,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);
          }
        }
      } catch {
        // DB sync silent fallback
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add item to cart' };
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<ActionResponse> {
  try {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    const currentItems = await getCartFromCookie();
    const itemIdx = currentItems.findIndex((i) => i.id === cartItemId || i.product_id === cartItemId);
    if (itemIdx >= 0) {
      currentItems[itemIdx].quantity = quantity;
      currentItems[itemIdx].updated_at = new Date().toISOString();
      await saveCartToCookie(currentItems);
    }

    const user = await getActiveUser();
    if (user) {
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('cart_items')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('id', cartItemId);
      } catch {
        // DB fallback
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update cart quantity' };
  }
}

export async function removeFromCart(cartItemId: string): Promise<ActionResponse> {
  try {
    const currentItems = await getCartFromCookie();
    const filtered = currentItems.filter((i) => i.id !== cartItemId && i.product_id !== cartItemId);
    await saveCartToCookie(filtered);

    const user = await getActiveUser();
    if (user) {
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase.from('cart_items').delete().eq('id', cartItemId);
      } catch {
        // DB fallback
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to remove item from cart' };
  }
}

export async function clearCart(): Promise<void> {
  try {
    const key = await getCartCookieKey();
    const cookieStore = await cookies();
    cookieStore.delete(key);
    cookieStore.delete('vs_guest_cart_data');
    cookieStore.delete('vs_guest_cart_session');

    const user = await getActiveUser();
    if (user) {
      try {
        const adminSupabase = createAdminClient();
        const { data: cart } = await adminSupabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cart) {
          await adminSupabase.from('cart_items').delete().eq('cart_id', cart.id);
        }
      } catch {
        // DB fallback
      }
    }
  } catch (err) {
    console.error('clearCart error:', err);
  }
}

export async function mergeGuestCartToCustomer(customerUserId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const guestId = cookieStore.get('vs_guest_cart_session')?.value;
    if (!guestId) return;

    const guestKey = `vs_cart_guest_${guestId}`;
    const raw = cookieStore.get(guestKey)?.value || cookieStore.get('vs_guest_cart_data')?.value;
    if (!raw) return;

    const guestItems: CartItem[] = JSON.parse(raw);
    if (!Array.isArray(guestItems) || guestItems.length === 0) return;

    for (const item of guestItems) {
      if (item.product_id) {
        await addToCart(item.product_id, item.quantity);
      }
    }

    cookieStore.delete(guestKey);
    cookieStore.delete('vs_guest_cart_data');
    cookieStore.delete('vs_guest_cart_session');
  } catch (err) {
    console.error('mergeGuestCartToCustomer error:', err);
  }
}
