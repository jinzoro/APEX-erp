
import React, { useEffect, useState, useContext } from 'react';
import { Transaction, Customer, Supplier, Product } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { Icons } from '../constants';
import { AppContext } from '../context';

const Finance: React.FC = () => {
  const { t, currency: baseCurrency, rates } = useContext(AppContext);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    description: '', amount: 0, localAmount: 0, category: 'Operation', type: 'EXPENSE', 
    date: new Date().toISOString().split('T')[0],
    linkedEntityId: '', linkedSku: '', quantity: 0, currency: 'MAD'
  });

  const fetch = async () => {
    const [t_data, c, s, p] = await Promise.all([
      backendService.getTransactions(),
      backendService.getCustomers(),
      backendService.getSuppliers(),
      backendService.getProducts()
    ]);
    setTxs(t_data);
    setCustomers(c);
    setSuppliers(s);
    setProducts(p);
  };

  useEffect(() => { fetch(); }, []);

  // Update base amount when local amount or currency changes
  useEffect(() => {
    if (newTx.localAmount && newTx.currency) {
      const baseAmt = currencyService.convert(newTx.localAmount, newTx.currency, baseCurrency, rates);
      setNewTx(prev => ({ ...prev, amount: baseAmt }));
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

  const income = txs.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
  const expense = txs.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);

  const allCurrencyCodes = Object.keys(rates).sort();

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ledger & Finance</h2>
          <p className="text-slate-500 font-medium">Accounting base: <span className="text-emerald-600 font-black">{baseCurrency}</span>. All multi-currency entries auto-converted.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 text-sm uppercase tracking-widest flex items-center gap-2 transition-transform active:scale-95">
           <Icons.Plus /> Log Interaction
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Cash Inflow ({baseCurrency})</p>
          <p className="text-4xl font-black tracking-tighter">{currencyService.format(income, baseCurrency)}</p>
        </div>
        <div className="bg-rose-500 p-8 rounded-[2rem] text-white shadow-xl shadow-rose-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Cash Outflow ({baseCurrency})</p>
          <p className="text-4xl font-black tracking-tighter">{currencyService.format(expense, baseCurrency)}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-900/20 border border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Net Position</p>
          <p className="text-4xl font-black tracking-tighter">{currencyService.format(income - expense, baseCurrency)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="p-6 border-b border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50/30">Master Audit Ledger</div>
        <div className="flex-1 overflow-y-auto">
           {txs.length === 0 ? (
             <div className="py-24 text-center">
                <p className="text-slate-200 font-black uppercase tracking-[0.3em] text-[10px]">Vault is currently empty</p>
             </div>
           ) : txs.map(t_item => (
             <div key={t_item.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all border-b border-slate-50 group">
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${t_item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {t_item.type === 'INCOME' ? '+' : '-'}
                 </div>
                 <div>
                   <p className="text-sm font-black text-slate-900">{t_item.description}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                     {t_item.category} • {t_item.date} {t_item.linkedSku ? `• SKU: ${t_item.linkedSku}` : ''}
                   </p>
                 </div>
               </div>
               <div className="text-right">
                  <p className={`text-sm font-black ${t_item.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {currencyService.format(t_item.amount, baseCurrency)}
                  </p>
                  {t_item.currency !== baseCurrency && (
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Orig: {currencyService.format(t_item.localAmount || 0, t_item.currency)}
                    </p>
                  )}
               </div>
             </div>
           ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-slate-900 p-10 text-white">
                 <h3 className="text-3xl font-black tracking-tight">Post Ledger Entry</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Interactive Multi-Currency Impact System</p>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setNewTx({...newTx, type: 'INCOME', linkedEntityId: ''})}
                      className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${newTx.type === 'INCOME' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-100 text-slate-400'}`}
                    >Sell (Income)</button>
                    <button 
                      onClick={() => setNewTx({...newTx, type: 'EXPENSE', linkedEntityId: ''})}
                      className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${newTx.type === 'EXPENSE' ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-100 text-slate-400'}`}
                    >Buy (Expense)</button>
                 </div>

                 <input type="text" placeholder="Entry Memo/Description" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" onChange={e => setNewTx({...newTx, description: e.target.value})}/>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <select 
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
                      onChange={e => setNewTx({...newTx, linkedEntityId: e.target.value})}
                    >
                      <option value="">{newTx.type === 'INCOME' ? 'Select Customer' : 'Select Supplier'}</option>
                      {newTx.type === 'INCOME' 
                        ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                      }
                    </select>
                    <select 
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
                      onChange={e => {
                        const p = products.find(prod => prod.sku === e.target.value);
                        setNewTx({...newTx, linkedSku: e.target.value, localAmount: p ? (newTx.type === 'INCOME' ? p.price : p.cost) : 0, currency: 'MAD'})
                      }}
                    >
                      <option value="">Select Item (SKU)</option>
                      {products.map(p => <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1">Currency</p>
                      <select 
                        className="w-full p-5 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-black text-sm"
                        value={newTx.currency}
                        onChange={e => setNewTx({...newTx, currency: e.target.value})}
                      >
                        {allCurrencyCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1">Local Amount</p>
                      <input 
                        type="number" 
                        value={newTx.localAmount} 
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm text-blue-600" 
                        onChange={e => setNewTx({...newTx, localAmount: Number(e.target.value)})}
                      />
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex justify-between items-center">
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase">Conversion Result</p>
                       <p className="text-xl font-black text-slate-900">{currencyService.format(newTx.amount || 0, baseCurrency)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Real-time Rate</p>
                       <p className="text-xs font-mono text-slate-500">1 {newTx.currency} = {(newTx.amount! / newTx.localAmount!).toFixed(4)} {baseCurrency}</p>
                    </div>
                 </div>

                 <div className="flex gap-6 pt-6">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-xs font-black uppercase text-slate-400">Cancel</button>
                    <button onClick={handleLog} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase shadow-2xl shadow-slate-900/30">Commit To Engine</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
