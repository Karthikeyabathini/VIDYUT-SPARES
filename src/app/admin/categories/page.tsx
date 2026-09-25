import React from 'react';
import { getCategories } from '@/lib/actions/productActions';
import CategoryManager from './CategoryManager';
import { FolderTree } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FolderTree className="h-6 w-6 text-[#0F2C59]" /> Electrical Category Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Organize products into categories such as Switches, Wires, MCBs, LED Lights, Conduits, and AC Boxes
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
