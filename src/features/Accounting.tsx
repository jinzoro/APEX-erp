import React, { useState, useEffect, useContext } from 'react';
import { Account, JournalEntry } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { AppContext } from '@/lib/context';

const Accounting: React.FC = () => {
  const { currency: baseCurrency } = useContext(AppContext);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tab, setTab] = useState<'ledger' | 'journal' | 'trial'>('ledger');

  const fetch = async () => {
    const [a, j] = await Promise.all([
      backendService.getCollection('accounts' as any),
      backendService.getCollection('journalEntries' as any),
    ]);
    setAccounts(a as Account[]);
    setEntries(j as JournalEntry[]);
  };
  useEffect(() => { fetch(); }, []);

  // trial balance
  const balances: Record<string, { debit: number; credit: number }> = {};
  for (const e of entries) {
    for (const l of e.lines) {
      if (!balances[l.accountCode]) balances[l.accountCode] = { debit: 0, credit: 0 };
      balances[l.accountCode].debit += l.debit;
      balances[l.accountCode].credit += l.credit;
    }
  }

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Comptabilité (CGNC)</h2>
          <p className="text-slate-500 font-medium">Plan comptable, journal, balance</p>
        </div>
        <div className="flex gap-2">
          {(['ledger', 'journal', 'trial'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </header>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scroll p-6">
          {tab === 'ledger' && (
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-50"><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Code</th><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Compte</th><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Type</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {accounts.map(a => (
                  <tr key={a.id}><td className="px-4 py-3 font-black text-slate-900">{a.code}</td><td className="px-4 py-3 text-slate-700">{a.name}</td><td className="px-4 py-3 text-slate-500 text-xs">{a.type}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'journal' && (
            <div className="space-y-4">
              {entries.length === 0 && <p className="text-slate-300 font-black uppercase text-xs tracking-widest text-center py-20">Aucune écriture</p>}
              {entries.map(e => (
                <div key={e.id} className="border border-slate-100 rounded-2xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-black text-slate-900">{e.number} — {e.journal}</span>
                    <span className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{e.description}</p>
                  <table className="w-full text-xs">
                    <thead><tr><th className="text-left text-slate-400">Compte</th><th className="text-right text-slate-400">Débit</th><th className="text-right text-slate-400">Crédit</th></tr></thead>
                    <tbody>
                      {e.lines.map(l => (
                        <tr key={l.id}><td className="py-1">{l.accountCode} {l.accountName}</td><td className="text-right">{l.debit ? currencyService.format(l.debit, baseCurrency) : ''}</td><td className="text-right">{l.credit ? currencyService.format(l.credit, baseCurrency) : ''}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
          {tab === 'trial' && (
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-50"><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Code</th><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Compte</th><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Débit</th><th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Crédit</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {accounts.map(a => {
                  const b = balances[a.code] || { debit: 0, credit: 0 };
                  if (b.debit === 0 && b.credit === 0) return null;
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-3 font-black text-slate-900">{a.code}</td>
                      <td className="px-4 py-3 text-slate-700">{a.name}</td>
                      <td className="px-4 py-3 text-right">{currencyService.format(b.debit, baseCurrency)}</td>
                      <td className="px-4 py-3 text-right">{currencyService.format(b.credit, baseCurrency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounting;
