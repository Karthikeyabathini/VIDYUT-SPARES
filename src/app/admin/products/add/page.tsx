'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, createProduct, createCategory } from '@/lib/actions/productActions';
import { uploadProductImage } from '@/lib/actions/storageActions';
import { Category } from '@/types';
import { Package, Plus, ArrowLeft, FolderPlus, Check, FileImage, CheckCircle2 } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Quick Add Category State
  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Image Upload Preview State
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    brand: 'Anchor',
    price: 0,
    stock_quantity: 50,
    low_stock_threshold: 5,
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    async function loadCats() {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setForm((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    }
    loadCats();
  }, []);

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

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    const res = await createCategory({ name: newCatName.trim() });
    setCreatingCat(false);

    if (res.success && res.data) {
      const created = res.data;
      setCategories((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, category_id: created.id }));
      setNewCatName('');
      setShowQuickAddCat(false);
    } else {
      alert(res.error || 'Failed to create category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Product name is required.');
      return;
    }
    if (!form.category_id) {
      alert('Please select or create a category first.');
      return;
    }

    setLoading(true);

    let finalImageUrl = form.image_url;
    if (form.image_url && form.image_url.startsWith('data:image')) {
      const uploadRes = await uploadProductImage(form.image_url, form.name);
      if (uploadRes.success && uploadRes.data) {
        finalImageUrl = uploadRes.data;
      }
    }

    const payload = {
      ...form,
      image_url: finalImageUrl,
    };

    const res = await createProduct(payload);
    setLoading(false);

    if (res.success) {
      alert('Product saved successfully to catalog!');
      router.push('/admin/products');
    } else {
      alert(res.error || 'Failed to create product');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-[#0F2C59]" /> Add New Product
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Register a new electrical spare part into catalog</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">Product Particulars Name *</label>
            <input
              type="text"
              required
              placeholder="Product Particulars Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-sm"
            />
          </div>

          {/* CATEGORY SELECTOR & QUICK ADD BUTTON */}
          <div className="sm:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 block">Category *</label>
              <button
                type="button"
                onClick={() => setShowQuickAddCat(!showQuickAddCat)}
                className="text-[11px] font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
              >
                <FolderPlus className="h-3.5 w-3.5 text-amber-600" />
                {showQuickAddCat ? 'Close Category Form' : '+ Create New Category'}
              </button>
            </div>

            {showQuickAddCat && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="font-bold text-amber-900 block text-[11px]">
                  New Category Name:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter category name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-amber-300 bg-white font-bold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddCategory}
                    disabled={creatingCat || !newCatName.trim()}
                    className="bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Check className="h-4 w-4" /> Save & Select
                  </button>
                </div>
              </div>
            )}

            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white text-xs"
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
              placeholder="Brand Name"
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

          <div>
            <label className="font-bold text-slate-700 block mb-1">Initial Available Stock *</label>
            <input
              type="number"
              required
              min="0"
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Low Stock Threshold Alert</label>
            <input
              type="number"
              required
              min="0"
              value={form.low_stock_threshold}
              onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
            />
          </div>

          {/* IMAGE UPLOAD FIELD */}
          <div className="sm:col-span-2 space-y-2">
            <label className="font-bold text-slate-700 block">Product Photo / Image Upload *</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[#0F2C59] rounded-xl p-4 text-center bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageFileUpload}
                className="hidden"
                id="productImageUploadInput"
              />
              <label htmlFor="productImageUploadInput" className="cursor-pointer space-y-2 block">
                <FileImage className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-[#0F2C59]">
                  Click here to browse & upload product photo from device
                </p>
                <p className="text-[10px] text-slate-400">Supported formats: JPG, JPEG, PNG, WEBP (Max 10MB)</p>
              </label>
            </div>

            {imagePreview && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
                <div className="w-16 h-16 relative border border-emerald-300 rounded overflow-hidden shrink-0">
                  <img src={imagePreview} alt="Product Photo Preview" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Image Selected & Attached
                  </p>
                  <p className="text-slate-500 text-[11px]">Will be saved with product catalog entry</p>
                </div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">Description & Specifications</label>
            <textarea
              rows={3}
              placeholder="Detailed product description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.name.trim() || !form.category_id}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-[#0F2C59] hover:bg-blue-900 text-white flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Save New Product to Catalog
        </button>
      </form>
    </div>
  );
}
