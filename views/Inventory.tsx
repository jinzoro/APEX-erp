
import React, { useEffect, useState, useContext } from 'react';
import { Product, ItemType } from '../types';
import { backendService } from '../services/backendSimulator';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory: React.FC = () => {
  const { t } = useContext(AppContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: '', type: 'CONSUMABLE', cost: 0, price: 0, stock: 0, minStock: 5, warehouse: 'Primary', image: ''
  });

  const fetch = async () => {
    const data = await backendService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const openAddModal = async () => {
    const newSku = await backendService.generateUniqueSKU();
    setFormData({
      name: '', sku: newSku, category: '', type: 'CONSUMABLE', cost: 0, price: 0, stock: 0, minStock: 5, warehouse: 'Primary', image: ''
    });
    setEditId(null);
    setError(null);
    setShowModal(true);
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
    if (!formData.name || !formData.sku) return;
    setError(null);
    
    let result;
    if (editId) {
      result = await backendService.updateItem('products', editId, formData);
    } else {
      result = await backendService.addItem('products', formData);
    }

    if (result.success) {
      setShowModal(false);
      setEditId(null);
      fetch();
    } else {
      setError("Critical Collision: System failed to sync this SKU.");
    }
  };

  const handleEdit = (p: Product) => {
    setFormData(p);
    setEditId(p.id);
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently archive this product record?")) {
      await backendService.deleteItem('products', id);
      fetch();
    }
  };

  const filtered = products.filter(p => activeTab === 'ALL' || p.type === activeTab);

  return (
    <div className="p-10 h-full flex flex-col overflow-hidden">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-12 shrink-0"
      >
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t.inventory}</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t.asset_status}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 font-black text-xs shadow-2xl shadow-indigo-500/30 transition-all flex items-center gap-3 uppercase tracking-widest active:scale-95"
        >
          <Icons.Plus /> {t.add_item}
        </button>
      </motion.header>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
             {['ALL', 'CONSUMABLE', 'FIXED_ASSET'].map(tabType => (
               <button 
                 key={tabType}
                 onClick={() => setActiveTab(tabType as any)}
                 className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tabType ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {tabType.replace('_', ' ')}
               </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30 sticky top-0 z-10">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.official_name}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.sku}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.stock}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.min_stock}</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="py-32 text-center text-slate-300 font-black uppercase text-[11px] tracking-[0.4em]">No Items in Asset Portfolio</td>
                  </motion.tr>
                ) : filtered.map((p, i) => (
                  <motion.tr 
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 transition-all group cursor-default"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-sm overflow-hidden ${p.type === 'FIXED_ASSET' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                          {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : (p.type === 'FIXED_ASSET' ? <Icons.Assets /> : <Icons.Inventory />)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="text-[11px] font-mono font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 select-all cursor-copy">{p.sku}</span>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                          <span className={`text-lg font-black ${p.stock <= p.minStock ? 'text-rose-600' : 'text-slate-900'}`}>{p.stock}</span>
                          {p.stock <= p.minStock && (
                            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-[9px] font-black bg-rose-600 text-white px-3 py-1 rounded-lg uppercase shadow-lg shadow-rose-500/30">Low</motion.span>
                          )}
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="text-sm font-bold text-slate-400 tracking-tight">{p.minStock} Units</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
                <div className="bg-slate-900 p-12 text-white relative">
                   <div className="relative z-10">
                      <h3 className="text-4xl font-black tracking-tight">{editId ? 'Modify Record' : 'Create Item'}</h3>
                      <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Engine Data Synchronization</p>
                   </div>
                   <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 blur-[80px]" />
                </div>
                
                <div className="p-12 space-y-8">
                   <div className="flex gap-8 items-start">
                     <div className="space-y-4">
                        <div className="w-32 h-32 bg-slate-100 rounded-3xl border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-indigo-500 transition-all relative shadow-inner">
                           {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Icons.Plus />}
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Product Shot</p>
                     </div>
                     <div className="flex-1 space-y-5">
                       <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">General Information</label>
                       <div className="grid grid-cols-2 gap-5">
                         <div className="space-y-1">
                           <span className="text-[9px] font-black text-slate-500 uppercase ml-2">Official Name</span>
                           <input type="text" placeholder="e.g. Server Blade" value={formData.name} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold text-sm transition-all" onChange={e => setFormData({...formData, name: e.target.value})}/>
                         </div>
                         <div className="space-y-1">
                           <span className="text-[9px] font-black text-slate-500 uppercase ml-2">SKU (System Locked)</span>
                           <input type="text" readOnly value={formData.sku} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-mono text-sm uppercase text-slate-400 cursor-not-allowed"/>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-2">
                         <div className="space-y-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Sale Price ($)</span>
                           <input type="number" value={formData.price} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs text-blue-600" onChange={e => setFormData({...formData, price: Number(e.target.value)})}/>
                         </div>
                         <div className="space-y-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Purchase Cost ($)</span>
                           <input type="number" value={formData.cost} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs text-slate-500" onChange={e => setFormData({...formData, cost: Number(e.target.value)})}/>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-8">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Inventory Levels</label>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase ml-2">Current Count</span>
                             <input type="number" value={formData.stock} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm text-slate-900" onChange={e => setFormData({...formData, stock: Number(e.target.value)})}/>
                           </div>
                           <div className="space-y-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase ml-2">Low Alert at</span>
                             <input type="number" value={formData.minStock} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm text-rose-500" onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}/>
                           </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Classification</label>
                        <span className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Item Class</span>
                        <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                            <option value="CONSUMABLE">Trading Asset (Consumable)</option>
                            <option value="FIXED_ASSET">Enterprise Asset (Fixed)</option>
                        </select>
                      </div>
                   </div>

                   <div className="flex gap-6 pt-6">
                      <button onClick={() => {setShowModal(false); setEditId(null); setError(null);}} className="flex-1 py-5 text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Discard changes</button>
                      <button onClick={handleSubmit} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 active:scale-95 transition-transform">Commit Asset</button>
                   </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
