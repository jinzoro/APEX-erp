
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';

const Finance: React.FC = () => {
  const { currency: baseCurrency, rates } = useContext(AppContext);
  
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    description: '', amount: 0, localAmount: 0, category: 'Operation', type: 'EXPENSE', 
    date: new Date().toISOString().split('T')[0],
    currency: 'MAD'
  });

  const fetch = async () => {
    const data = await backendService.getTransactions();
    setTxs(data);
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (newTx.localAmount !== undefined && newTx.currency) {
      const converted = currencyService.convert(
        newTx.localAmount, 
        newTx.currency, 
        baseCurrency, 
        rates
      );
      setNewTx(prev => prev.amount === converted ? prev : { ...prev, amount: converted });
    }
  }, [newTx.localAmount, newTx.currency, baseCurrency, rates]);

  const handleLog = async () => {
    if (!newTx.description || !newTx.amount) return;
    await backendService.logTransaction(newTx as Transaction);
    setShowAddModal(false);
    setNewTx({ 
      description: '', amount: 0, localAmount: 0, category: 'Operation', 
      type: 'EXPENSE', date: new Date().toISOString().split('T')[0], currency: 'MAD' 
    });
    fetch();
  };

  const totals = useMemo(() => ({
    income: txs.filter(v => v.type === 'INCOME').reduce((a, b) => a + b.amount, 0),
    expense: txs.filter(v => v.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0)
  }), [txs]);

  const allCurrencyCodes = useMemo(() => Object.keys(rates).sort(), [rates]);

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ledger & Finance</h2>
          <p className="text-slate-500 font-medium">Accounting base: <span className="text-emerald-600 font-black">{baseCurrency}</span></p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl flex items-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest">
           <Icons.Plus /> Log Interaction
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Inflow</p>
          <p className="text-4xl font-black tracking-tighter">{currencyService.format(totals.income, baseCurrency)}</p>
        </div>
        <div className="bg-rose-500 p-8 rounded-[2rem] text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Outflow</p>
          <p className="text-4xl font-black tracking-tighter">{currencyService.format(totals.expense, baseCurrency)}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl border border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Net Position</p>
          <p className="text-4xl font-black tracking-tighter">{currencyService.format(totals.income - totals.expense, baseCurrency)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="p-6 border-b border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50/30">Master Audit Ledger</div>
        <div className="flex-1 overflow-y-auto custom-scroll">
           {txs.length === 0 ? (
             <div className="py-24 text-center"><p className="text-slate-200 font-black uppercase text-[10px] tracking-widest">Vault is currently empty</p></div>
           ) : txs.map(t_item => (
             <div key={t_item.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all border-b border-slate-50 group">
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${t_item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {t_item.type === 'INCOME' ? '+' : '-'}
                 </div>
                 <div>
                   <p className="text-sm font-black text-slate-900">{t_item.description}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t_item.date}</p>
                 </div>
               </div>
               <div className="text-right">
                  <p className={`text-sm font-black ${t_item.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {currencyService.format(t_item.amount, baseCurrency)}
                  </p>
               </div>
             </div>
           ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden">
              <div className="bg-slate-900 p-10 text-white"><h3 className="text-3xl font-black tracking-tight">Post Ledger Entry</h3></div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setNewTx({...newTx, type: 'INCOME'})} className={`py-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${newTx.type === 'INCOME' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-100 text-slate-400'}`}>Income</button>
                    <button onClick={() => setNewTx({...newTx, type: 'EXPENSE'})} className={`py-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${newTx.type === 'EXPENSE' ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-100 text-slate-400'}`}>Expense</button>
                 </div>
                 <input type="text" placeholder="Description" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" />
                 <div className="grid grid-cols-2 gap-4">
                    <select value={newTx.currency} onChange={e => setNewTx({...newTx, currency: e.target.value})} className="w-full p-5 bg-slate-100 border rounded-2xl font-black">
                      {allCurrencyCodes.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                    <input type="number" value={newTx.localAmount} onChange={e => setNewTx({...newTx, localAmount: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border rounded-2xl font-black text-blue-600" />
                 </div>
                 <div className="flex gap-6 pt-6">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Cancel</button>
                    <button onClick={handleLog} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase shadow-2xl tracking-widest">Commit</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
