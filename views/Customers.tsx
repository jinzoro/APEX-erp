
import React, { useEffect, useState, useContext } from 'react';
import { Customer } from '../types';
import { backendService } from '../services/backendSimulator';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { currencyService } from '../services/currencyService';
import { motion, AnimatePresence } from 'framer-motion';

const Customers: React.FC = () => {
  const { t, currency } = useContext(AppContext);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', email: '', phone: '', tier: 'LEAD', totalSales: 0, lastOrderDate: 'Never', image: ''
  });

  const fetch = async () => {
    const data = await backendService.getCustomers();
    setCustomers(data);
  };

  useEffect(() => { fetch(); }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email) return;
    if (editId) {
      await backendService.updateItem('customers', editId, formData);
    } else {
      await backendService.addItem('customers', formData);
    }
    setShowAddModal(false);
    setEditId(null);
    fetch();
  };

  const handleEdit = (c: Customer) => {
    setFormData(c);
    setEditId(c.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove client from registry?")) {
      await backendService.deleteItem('customers', id);
      fetch();
    }
  };

  return (
    <div className="p-10 h-full flex flex-col bg-slate-50/20 overflow-hidden">
      <header className="flex items-center justify-between mb-12 shrink-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t.customers}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Lifecycle Relation Management</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({ name: '', email: '', phone: '', tier: 'LEAD', totalSales: 0, lastOrderDate: 'Never', image: '' }); setShowAddModal(true); }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-500/30 flex items-center gap-3 text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          <Icons.Plus /> {t.save} Client
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pb-10 flex-1 custom-scroll">
        {customers.length === 0 ? (
           <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-200 rounded-[4rem]">
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">No Active CRM Profiles</p>
           </div>
        ) : customers.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group relative">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(c)} className="text-slate-400 hover:text-indigo-600 transition-colors p-3 bg-slate-50 rounded-2xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-3 bg-rose-50 rounded-2xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-inner overflow-hidden">
                {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : c.name[0]}
              </div>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${c.tier === 'VIP' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
                {c.tier}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{c.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-8">{c.email}</p>
            <div className="flex justify-between items-center pt-8 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Impact</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{currencyService.format(c.totalSales, currency)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <Icons.Sales />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[4rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="bg-slate-900 p-10 text-white">
                   <h3 className="text-3xl font-black tracking-tight">{editId ? t.edit : 'Onboard Account'}</h3>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">CRM profile configuration</p>
                </div>
                <div className="p-10 space-y-5">
                   <div className="flex justify-center mb-4">
                     <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-4 border-dashed border-slate-100 flex items-center justify-center overflow-hidden relative group hover:border-indigo-500 transition-all cursor-pointer">
                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Icons.Plus />}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                     </div>
                   </div>
                   <input type="text" placeholder="Full Client Name" value={formData.name} className="w-full p-5 bg-slate-50 border rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-indigo-500" onChange={e => setFormData({...formData, name: e.target.value})}/>
                   <input type="email" placeholder="Email Contact" value={formData.email} className="w-full p-5 bg-slate-50 border rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-indigo-500" onChange={e => setFormData({...formData, email: e.target.value})}/>
                   <input type="text" placeholder="Phone Number" value={formData.phone} className="w-full p-5 bg-slate-50 border rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-indigo-500" onChange={e => setFormData({...formData, phone: e.target.value})}/>
                   <select className="w-full p-5 bg-slate-50 border rounded-[2rem] outline-none font-black text-xs uppercase tracking-widest" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value as any})}>
                      <option value="LEAD">Unqualified Lead</option>
                      <option value="RECURRING">Recurring Customer</option>
                      <option value="VIP">Premium VIP</option>
                   </select>
                   <div className="flex gap-6 pt-6">
                      <button onClick={() => { setShowAddModal(false); setEditId(null); }} className="flex-1 py-5 text-xs font-black uppercase text-slate-400 hover:text-slate-900">{t.cancel}</button>
                      <button onClick={handleRegister} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95">Commit Profile</button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
