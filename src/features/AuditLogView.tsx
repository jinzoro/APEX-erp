
import React, { useState, useEffect, useContext } from 'react';
import { AuditLog } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { AppContext } from '@/lib/context';

const AuditLogView: React.FC = () => {
  const { t } = useContext(AppContext);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await backendService.getAuditLogs();
      setLogs(data);
    };
    fetch();
  }, []);

  return (
    <div className="p-10 h-full flex flex-col overflow-hidden">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t.audit_log}</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Master Ledger of Operations</p>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="py-32 text-center text-slate-200 font-black uppercase tracking-[0.4em] text-xs">No Audit Entries</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6 text-[11px] font-mono font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{log.user}</span>
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900 text-sm tracking-tight">{log.action}</td>
                  <td className="px-10 py-6 text-xs text-slate-500 font-medium">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
