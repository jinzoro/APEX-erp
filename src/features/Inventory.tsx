
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Product, ItemType } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';
import { currencyService } from '@/services/currencyService';

const Inventory: React.FC = () => {
  const { t, currency } = useContext(AppContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<ItemType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: '', type: 'CONSUMABLE', cost: 0, price: 0, stock: 0, minStock: 5, warehouse: 'Primary', image: ''
  });

  const fetch = async () => {
    const data = await backendService.getProducts();
    setProducts(data);
    
  };

  useEffect(() => {
    fetch();
  }, []);

  const openAddModal = async () => {
    const newSku = await backendService.generateUniqueSKU();
    setFormData({
      name: '', sku: newSku, category: '', type: 'CONSUMABLE', cost: 0, price: 0, stock: 0, minStock: 5, warehouse: 'Primary', image: ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (p: Product) => {
    setFormData({ ...p });
    setEditId(p.id);
    setShowModal(true);
  };

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

  const suggestPrice = (margin: number = 1.35) => {
    if (formData.cost) {
      setFormData(prev => ({ ...prev, price: Math.ceil((prev.cost || 0) * margin) }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    if (editId) {
      await backendService.updateItem('products', editId, formData);
    } else {
      await backendService.addItem('products', formData);
    }
    setShowModal(false);
    fetch();
  };

  const filtered = useMemo(() => 
    products.filter(p => activeTab === 'ALL' || p.type === activeTab)
  , [products, activeTab]);

  return (
    <div className="p-10 h-full flex flex-col overflow-hidden bg-slate-50/20">
      <header className="flex items-center justify-between mb-12 shrink-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t.inventory}</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t.asset_status}</p>
        </div>
        <button onClick={openAddModal} className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs shadow-2xl transition-all uppercase tracking-widest active:scale-95 flex items-center gap-2">
          <Icons.Plus /> {t.add_item}
        </button>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
             {(['ALL', 'CONSUMABLE', 'FIXED_ASSET'] as const).map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
               >
                 {tab.replace('_', ' ')}
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
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.cost}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.stock}</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black overflow-hidden border border-slate-200 shadow-inner">
                        {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Icons.Inventory />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{p.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-mono font-black text-slate-400 text-[11px]">{p.sku}</td>
                  <td className="px-10 py-6 font-black text-slate-900">{currencyService.format(p.cost, currency)}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${p.stock <= p.minStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {p.stock} Units
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                     <button onClick={() => handleEdit(p)} className="p-3 text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 text-xs font-black uppercase tracking-widest">
                       Edit
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto max-h-[90vh]">
             {/* Left Panel: Image Mastering */}
             <div className="w-full lg:w-80 bg-slate-900 p-10 text-white flex flex-col shrink-0">
                <h3 className="text-3xl font-black tracking-tight mb-8 leading-none">{editId ? 'Refine Asset' : 'Forge Asset'}</h3>
                
                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Profile</p>
                    <div className="w-full aspect-square bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group hover:border-indigo-500 transition-all shadow-inner">
                       {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Icons.Plus />}
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                    </div>
                    <p className="text-[9px] text-slate-500 text-center italic">Supported: JPG, PNG, WEBP</p>
                  </div>

                  <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Master SKU</p>
                    <p className="font-mono text-lg text-indigo-400 font-bold tracking-[0.2em]">{formData.sku}</p>
                  </div>
                </div>
             </div>

             {/* Right Panel: Data Forge */}
             <div className="flex-1 p-10 lg:p-12 overflow-y-auto custom-scroll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Official Asset Designation</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Industrial Server Rack v4" />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category Hub</label>
                      <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:bg-white" placeholder="e.g. Electronics" />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Item Classification</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ItemType})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:bg-white appearance-none">
                         <option value="CONSUMABLE">Consumable Goods</option>
                         <option value="FIXED_ASSET">Fixed Capital Asset</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Acquisition Cost ({currency})</label>
                      <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:bg-white" />
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 pr-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Market Price ({currency})</label>
                        <button onClick={() => suggestPrice()} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Suggest +35%</button>
                      </div>
                      <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-5 bg-indigo-50 border border-indigo-100 rounded-3xl font-black text-indigo-600 focus:bg-white" />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Initial Inventory</label>
                      <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold" />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Safety Threshold</label>
                      <input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold" />
                   </div>
                </div>

                <div className="flex gap-6 pt-8 border-t border-slate-100">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-5 font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-900 transition-colors">Abort Process</button>
                    <button onClick={handleSubmit} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-2xl text-xs tracking-[0.2em] active:scale-95 transition-all">Authorize Asset</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
