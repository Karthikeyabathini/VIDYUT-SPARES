import React from 'react';
import { getAdminAuditLogs, getStoreConfig } from '@/lib/actions/adminActions';
import AdminSettingsView from './AdminSettingsView';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [storeConfig, auditLogs] = await Promise.all([
    getStoreConfig(),
    getAdminAuditLogs(),
  ]);

  return <AdminSettingsView initialConfig={storeConfig} initialAuditLogs={auditLogs} />;
}
