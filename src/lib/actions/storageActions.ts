'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { ActionResponse } from '@/types';

/**
 * Upload product image to Supabase Storage `product-images` (Public Bucket)
 */
export async function uploadProductImage(
  fileBase64: string,
  fileName: string
): Promise<ActionResponse<string>> {
  try {
    if (!fileBase64 || !fileName) {
      return { success: false, error: 'File data is required' };
    }

    const adminSupabase = createAdminClient();

    // Detect content type
    let contentType = 'image/jpeg';
    const mimeMatch = fileBase64.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      contentType = mimeMatch[1];
    }

    // Remove Base64 metadata prefix if present
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `products/${Date.now()}_${cleanFileName}`;

    // Ensure product-images bucket exists as public
    try {
      await adminSupabase.storage.createBucket('product-images', { public: true });
    } catch {
      // Bucket exists
    }

    // Upload to 'product-images' bucket
    const { error } = await adminSupabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Storage uploadProductImage error:', error.message);
      return { success: true, data: fileBase64 };
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { success: true, data: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('uploadProductImage exception:', err);
    return { success: true, data: fileBase64 };
  }
}

/**
 * Upload payment proof screenshot to Supabase Storage `payment-proofs` (Permanent Public Bucket)
 */
export async function uploadPaymentProofImage(
  fileBase64: string,
  fileName: string
): Promise<ActionResponse<string>> {
  try {
    if (!fileBase64 || !fileName) {
      return { success: false, error: 'Payment proof image is required' };
    }

    const adminSupabase = createAdminClient();

    let contentType = 'image/jpeg';
    const mimeMatch = fileBase64.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      contentType = mimeMatch[1];
    }

    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `proofs/${Date.now()}_${cleanFileName}`;

    // Ensure payment-proofs bucket exists as public
    try {
      await adminSupabase.storage.createBucket('payment-proofs', { public: true });
    } catch {
      // Bucket exists
    }

    const { error } = await adminSupabase.storage
      .from('payment-proofs')
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Storage uploadPaymentProofImage error:', error.message);
      return { success: true, data: fileBase64 };
    }

    // Return permanent public URL instead of expiring signed URL
    const { data: publicUrlData } = adminSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath);

    return { success: true, data: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('uploadPaymentProofImage exception:', err);
    return { success: true, data: fileBase64 };
  }
}
