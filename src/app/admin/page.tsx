import React from 'react';
import { getAdminDashboardStats } from '@/lib/actions/adminActions';
import AdminDashboardView from './AdminDashboardView';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return <AdminDashboardView stats={stats} />;
}
