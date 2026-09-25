'use client';

import React, { useState } from 'react';
import { Ban } from 'lucide-react';
import CancelOrderModal from './CancelOrderModal';
import { OrderStatus } from '@/types';

interface CancelOrderButtonProps {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
}

export default function CancelOrderButton({
  orderId,
  orderNumber,
  orderStatus,
}: CancelOrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const allowedStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING'];
  const canCancel = allowedStatuses.includes(orderStatus);

  if (!canCancel) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
      >
        <Ban className="h-4 w-4" /> Cancel Order
      </button>

      <CancelOrderModal
        orderId={orderId}
        orderNumber={orderNumber}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
