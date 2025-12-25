
import React, { useEffect, useState, useContext } from 'react';
import { Supplier } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { motion, AnimatePresence } from 'framer-motion';

const Suppliers: React.FC = () => {
  const { t, currency } = useContext(AppContext);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '', contact: '', email: '', category: 'Wholesale', rating: 5, totalSpent: 0, image: ''
  });

  const fetch = async () => {
    const data = await backendService.getSuppliers();
    setSuppliers(data);
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;
    if (editId) {
      await backendService.updateItem('suppliers', editId, formData);
    } else {
      await backendService.addItem('suppliers', formData);
    }
    setShowModal(false);
    setEditId(null);
    setFormData({ name: '', contact: '', email: '', category: 'Wholesale', rating: 5, totalSpent: 0, image: '' });
    fetch();
  };

  const handleEdit = (s: Supplier) => {
    setFormData(s);
    setEditId(s.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Blacklist this supplier?")) {
      await backendService.deleteItem('suppliers', id);
      fetch();
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/20">
      <header className="flex items-center justify-between mb-10 shrink-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t.suppliers}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Vendor Network Management</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({ name: '', contact: '', email: '', category: 'Wholesale', rating: 5, totalSpent: 0, image: '' }); setShowModal(true); }}
          className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black shadow-2xl shadow-slate-900/30 flex items-center gap-3 text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          <Icons.Plus /> {t.save} Partner
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pb-8 flex-1 custom-scroll">
        {suppliers.length === 0 ? (
           <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-200 rounded-[4rem]">
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">No Supply Partners Identified</p>
           </div>
        ) : suppliers.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group relative">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(s)} className="text-slate-400 hover:text-blue-600 transition-colors p-3 bg-slate-50 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-3 bg-rose-50 rounded-2xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl overflow-hidden">
                {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : s.name[0]}
              </div>
              <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                {s.category}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{s.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-8">{s.email}</p>
            <div className="flex justify-between items-center pt-8 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.revenue}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{currencyService.format(s.totalSpent, currency)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[4rem] w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="bg-slate-900 p-10 text-white">
                   <h3 className="text-3xl font-black tracking-tight">{editId ? t.edit : 'Register Vendor'}</h3>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Supply Chain Node Configuration</p>
                </div>
                <div className="p-10 space-y-6">
                   <div className="flex justify-center mb-4">
                     <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-4 border-dashed border-slate-100 flex items-center justify-center overflow-hidden relative group hover:border-blue-500 transition-all cursor-pointer">
                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Icons.Plus />}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                     </div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase ml-2">{t.official_name}</span>
                      <input type="text" placeholder="Vendor Entity" value={formData.name} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-slate-900 transition-all" onChange={e => setFormData({...formData, name: e.target.value})}/>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase ml-2">Electronic Mail</span>
                      <input type="email" placeholder="contact@provider.com" value={formData.email} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-slate-900 transition-all" onChange={e => setFormData({...formData, email: e.target.value})}/>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase ml-2">Market Segment</span>
                      <input type="text" placeholder="e.g. Technology, Raw Materials" value={formData.category} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-slate-900 transition-all" onChange={e => setFormData({...formData, category: e.target.value})}/>
                   </div>
                   <div className="flex gap-6 pt-6">
                      <button onClick={() => {setShowModal(false); setEditId(null);}} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">{t.cancel}</button>
                      <button onClick={handleSubmit} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Persist Partner</button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Suppliers;
