import React from 'react';
import { getAdminAuditLogs } from '@/lib/actions/adminActions';
import { ShieldCheck, Store, Lock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const auditLogs = await getAdminAuditLogs();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#0F2C59]" /> Store Settings & Admin Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View official business parameters and inspect tamper-evident administrative action history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* STORE INFO SUMMARY */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs h-fit">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Store className="h-4 w-4 text-[#0F2C59]" /> Store Profile Config
          </h2>
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 font-semibold block">Business Name:</span>
              <span className="font-bold text-slate-900">VIDYUT SPARES</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Store Phone:</span>
              <span className="font-bold text-slate-900">9440146599</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Store Email:</span>
              <span className="font-bold text-slate-900">vidyutspares@gmail.com</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Store Address:</span>
              <span className="font-bold text-slate-900 leading-relaxed block">
                11-39-15, Katurivari St, Beside 1 Town Police Station, Tarapet, Vijayawada, Andhra Pradesh 520001, India
              </span>
            </div>
          </div>
        </div>

        {/* AUDIT LOGS TABLE */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-amber-600" /> Admin Audit Trail
          </h2>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {log.action}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">{log.description}</p>
                  <p className="text-[10px] text-slate-400">
                    Admin User: <span className="font-bold text-slate-600">{log.admin?.name || log.admin_user_id}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 py-6 text-center">No administrative audit logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
