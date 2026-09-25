'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, updateProduct, getCategories } from '@/lib/actions/productActions';
import { adjustProductStock } from '@/lib/actions/adminActions';
import { Category, Product } from '@/types';
import { Package, Edit, ArrowLeft, RefreshCw, Save } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Stock Adjustment State
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [stockReason, setStockReason] = useState('');
  const [adjustingStock, setAdjustingStock] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    category_id: '',
    brand: '',
    price: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    async function loadData() {
      const cats = await getCategories();
      setCategories(cats);

      const prod = await getProductById(productId);
      if (prod) {
        setProduct(prod);
        setForm({
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          category_id: prod.category_id,
          brand: prod.brand,
          price: prod.price,
          stock_quantity: prod.stock_quantity,
          low_stock_threshold: prod.low_stock_threshold,
          description: prod.description || '',
          image_url: prod.image_url || '',
          is_active: prod.is_active,
        });
      }
    }
    loadData();
  }, [productId]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size exceeds 10MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setForm((prev) => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = form.image_url;
    if (form.image_url && form.image_url.startsWith('data:image')) {
      const { uploadProductImage } = await import('@/lib/actions/storageActions');
      const uploadRes = await uploadProductImage(form.image_url, form.name);
      if (uploadRes.success && uploadRes.data) {
        finalImageUrl = uploadRes.data;
      }
    }

    const res = await updateProduct(productId, {
      ...form,
      image_url: finalImageUrl,
    });
    setLoading(false);

    if (res.success) {
      alert('Product updated successfully!');
      router.push('/admin/products');
    } else {
      alert(res.error || 'Failed to update product');
    }
  };

  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockAdjustment === 0) return;
    if (!stockReason.trim()) {
      alert('Stock adjustment reason is required for audit logs.');
      return;
    }

    setAdjustingStock(true);
    const res = await adjustProductStock({
      product_id: productId,
      adjustment_quantity: stockAdjustment,
      reason: stockReason.trim(),
    });
    setAdjustingStock(false);

    if (res.success) {
      alert('Stock adjusted and recorded in inventory logs!');
      const updated = await getProductById(productId);
      if (updated) {
        setProduct(updated);
        setForm((prev) => ({ ...prev, stock_quantity: updated.stock_quantity }));
      }
      setStockAdjustment(0);
      setStockReason('');
    } else {
      alert(res.error || 'Stock adjustment failed');
    }
  };

  if (!product) {
    return <div className="p-8 text-center text-slate-500">Loading product data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Edit className="h-6 w-6 text-[#0F2C59]" /> Edit Product #{product.sku}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Modify price, stock quantity, and product attributes</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EDIT FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Product Particulars Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">SKU Code (Unique) *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-amber-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Category *</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-extrabold text-[#0F2C59]"
              />
            </div>

            {/* IMAGE UPLOAD FIELD */}
            <div className="sm:col-span-2 space-y-2">
              <label className="font-bold text-slate-700 block">Product Photo / Image Upload</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#0F2C59] rounded-xl p-4 text-center bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageFileUpload}
                  className="hidden"
                  id="editProductImageUploadInput"
                />
                <label htmlFor="editProductImageUploadInput" className="cursor-pointer space-y-2 block">
                  <p className="text-xs font-bold text-[#0F2C59]">
                    Click to change / upload new product photo from device
                  </p>
                  <p className="text-[10px] text-slate-400">Supported formats: JPG, JPEG, PNG, WEBP (Max 10MB)</p>
                </label>
              </div>

              {(imagePreview || form.image_url) && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-4">
                  <div className="w-16 h-16 relative border border-slate-300 rounded overflow-hidden shrink-0 bg-white">
                    <img src={imagePreview || form.image_url} alt="Product Photo Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {imagePreview ? 'New Image Selected' : 'Current Product Image'}
                    </p>
                    <p className="text-slate-500 text-[11px]">Will be preserved upon saving product changes</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeStatus"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 text-[#0F2C59]"
              />
              <label htmlFor="activeStatus" className="font-bold text-slate-900">
                Active in Catalog
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl font-bold text-xs bg-[#0F2C59] hover:bg-blue-900 text-white flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Save className="h-4 w-4" /> Save Product Changes
          </button>
        </form>

        {/* MANUAL STOCK ADJUSTMENT BOX */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleStockAdjustSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-amber-600" /> Stock Adjustment
            </h3>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Current Stock:</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">
                {product.stock_quantity} units
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Adjustment Quantity (+ Restock / - Deduction)
              </label>
              <input
                type="number"
                required
                placeholder="Quantity number"
                value={stockAdjustment}
                onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-extrabold font-mono text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Adjustment Reason *</label>
              <input
                type="text"
                required
                placeholder="Reason for adjustment"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={adjustingStock || stockAdjustment === 0}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              Record Stock Adjustment & Log
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
