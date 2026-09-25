'use client';

import React, { useState } from 'react';
import { updateAdminOrderStatus } from '@/lib/actions/orderActions';
import { OrderStatus } from '@/types';

export default function AdminOrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setLoading(true);

    const res = await updateAdminOrderStatus({
      orderId,
      newStatus,
    });

    setLoading(false);

    if (!res.success) {
      alert(res.error || 'Failed to update order status');
    } else {
      setStatus(newStatus);
    }
  };

  return (
    <select
      value={status}
      disabled={loading}
      onChange={handleStatusChange}
      className={`text-xs font-bold p-1.5 rounded border transition-colors ${
        loading ? 'opacity-50 cursor-wait' : ''
      } ${
        status === 'DELIVERED'
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : status === 'CANCELLED'
          ? 'bg-red-100 text-red-900 border-red-300'
          : 'bg-blue-50 text-[#0F2C59] border-blue-200'
      }`}
    >
      <option value="PENDING">PENDING</option>
      <option value="CONFIRMED">CONFIRMED</option>
      <option value="PROCESSING">PROCESSING</option>
      <option value="PACKED">PACKED</option>
      <option value="SHIPPED">SHIPPED</option>
      <option value="DELIVERED">DELIVERED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}
