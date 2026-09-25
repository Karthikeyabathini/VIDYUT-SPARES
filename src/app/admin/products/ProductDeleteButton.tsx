'use client';

import React, { useState } from 'react';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { deleteProduct } from '@/lib/actions/productActions';
import { useRouter } from 'next/navigation';

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
}

export default function ProductDeleteButton({ productId, productName }: ProductDeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const res = await deleteProduct(productId);
    setLoading(false);

    if (res.success) {
      setConfirming(false);
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete product');
    }
  };

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1.5 ml-2 bg-red-50 border border-red-300 px-2 py-1 rounded-lg text-xs shadow-sm">
        <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-red-600" /> Delete?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          type="button"
          className="text-[11px] font-extrabold bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          type="button"
          className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      type="button"
      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 hover:underline transition-colors ml-3"
      title={`Delete ${productName}`}
    >
      <Trash2 className="h-3.5 w-3.5 text-red-500" />
      Delete
    </button>
  );
}
