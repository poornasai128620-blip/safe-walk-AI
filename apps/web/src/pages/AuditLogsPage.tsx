import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Filter, Lock, Key, Activity } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '@safewalk/shared-types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Cryptographic Security Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of every sensitive action, emergency dispatch, role authorization, and CCTV evidence request
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Security Action</th>
                <th className="p-4">Resource & ID</th>
                <th className="p-4">Actor ID</th>
                <th className="p-4">Cryptographic Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 whitespace-nowrap">
                    <span className="text-slate-500">{log.resource_type}/</span>
                    <span className="text-cyan-400 font-bold">{log.resource_id?.slice(0, 8)}...</span>
                  </td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    {log.actor_id.slice(0, 10)}...
                  </td>
                  <td className="p-4 text-slate-500 text-[11px] font-sans truncate max-w-xs">
                    {JSON.stringify(log.metadata || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
