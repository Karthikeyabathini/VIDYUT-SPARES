import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/actions/productActions';
import { Package, Plus, Edit, CheckCircle2, XCircle } from 'lucide-react';
import ProductDeleteButton from './ProductDeleteButton';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts({ sortBy: 'newest', includeInactive: true });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-[#0F2C59]" /> Products & Stock Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage electrical spare catalog, prices, and stock inventory levels
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> Add New Electrical Product
        </Link>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="bg-[#0F2C59] text-white font-bold uppercase text-[11px] tracking-wider">
              <th className="p-4">SKU</th>
              <th className="p-4">Product Particulars</th>
              <th className="p-4">Brand</th>
              <th className="p-4 text-right">Price (₹)</th>
              <th className="p-4 text-center">Available Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const isOutOfStock = product.stock_quantity <= 0;
              const isLowStock = !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;

              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-700">{product.sku}</td>
                  <td className="p-4 font-bold text-slate-900">{product.name}</td>
                  <td className="p-4 font-semibold text-amber-800">{product.brand}</td>
                  <td className="p-4 text-right font-extrabold text-slate-900">
                    ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`font-mono font-extrabold px-2.5 py-1 rounded text-xs ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="p-4">
                    {product.is_active ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2C59] hover:underline"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit / Stock
                    </Link>
                    <ProductDeleteButton productId={product.id} productName={product.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
