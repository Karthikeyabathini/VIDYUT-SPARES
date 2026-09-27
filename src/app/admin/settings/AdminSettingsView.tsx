'use client';

import React, { useState } from 'react';
import { StoreConfig, AdminAuditLog } from '@/types';
import EditStoreProfileModal from './EditStoreProfileModal';
import { ShieldCheck, Store, Lock, Edit3, Phone, Mail, MapPin, FileText, Clock, RefreshCw, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminSettingsViewProps {
  initialConfig: StoreConfig;
  initialAuditLogs: AdminAuditLog[];
}

export default function AdminSettingsView({
  initialConfig,
  initialAuditLogs,
}: AdminSettingsViewProps) {
  const router = useRouter();
  const [config, setConfig] = useState<StoreConfig>(initialConfig);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(initialAuditLogs);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSaved = () => {
    router.refresh();
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('APPROVE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#0F2C59]" /> Store Settings & Admin Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official business contact information and inspect tamper-evident administrative action history
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#0F2C59]' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* STORE INFO SUMMARY & EDIT BUTTON */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs h-fit relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Store className="h-4 w-4 text-[#0F2C59]" /> Store Profile Config
            </h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#0F2C59] hover:bg-blue-900 text-white font-extrabold text-xs py-1.5 px-3 rounded-xl shadow-sm transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-amber-400" /> Edit Profile
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Business / Store Name</span>
              <span className="font-extrabold text-slate-900 text-sm">{config.business_name}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                <Phone className="h-3 w-3 text-blue-900" /> Customer Care Phone
              </span>
              <span className="font-extrabold text-slate-900 text-xs">{config.store_phone}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                <Mail className="h-3 w-3 text-emerald-600" /> Official Email Address
              </span>
              <span className="font-bold text-slate-900 text-xs">{config.store_email}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-600" /> Store Physical Address
              </span>
              <p className="font-medium text-slate-800 leading-relaxed text-xs">
                {config.store_address}
              </p>
            </div>

            {config.gstin && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                  <FileText className="h-3 w-3 text-purple-600" /> GSTIN Number
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs">{config.gstin}</span>
              </div>
            )}

            {config.support_hours && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                  <Clock className="h-3 w-3 text-indigo-600" /> Operating / Support Hours
                </span>
                <span className="font-semibold text-slate-900 text-xs">{config.support_hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* AUDIT LOGS TABLE */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-600" /> Admin Audit Trail
            </h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500" /> {auditLogs.length} Actions Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 space-y-1.5 hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-[10px] tracking-wide ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.entity_type}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-xs leading-relaxed">{log.description}</p>
                  <p className="text-[10px] text-slate-400">
                    Admin User: <span className="font-bold text-slate-700">{log.admin?.name || log.admin_user_id}</span> ({log.admin?.email || 'System Admin'})
                  </p>
                </div>
              ))
            ) : (
              <div className="text-slate-500 py-12 text-center space-y-2">
                <Lock className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="font-medium">No administrative audit logs recorded yet.</p>
                <p className="text-[11px] text-slate-400">Any product updates, payment approvals, status changes, or store profile edits will be automatically recorded here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditStoreProfileModal
        initialConfig={config}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
