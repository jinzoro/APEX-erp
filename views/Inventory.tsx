
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Product, ItemType } from '../types';
import { backendService } from '../services/backendSimulator';
import { Icons } from '../constants';
import { AppContext } from '../context';

const Inventory: React.FC = () => {
  const { t } = useContext(AppContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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
    setShowModal(true);
  };

  const handleEdit = (p: Product) => {
    setFormData({ ...p });
    setEditId(p.id);
    setShowModal(true);
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

  useEffect(() => {
    fetch();
  }, []);

  const filtered = useMemo(() => 
    products.filter(p => activeTab === 'ALL' || p.type === activeTab)
  , [products, activeTab]);

  return (
    <div className="p-10 h-full flex flex-col overflow-hidden">
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
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.stock}</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                        {p.image ? <img src={p.image} className="w-full h-full object-cover rounded-2xl" /> : <Icons.Inventory />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{p.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-mono font-black text-slate-400 text-[11px]">{p.sku}</td>
                  <td className="px-10 py-6 font-black text-slate-900">{p.stock}</td>
                  <td className="px-10 py-6 text-right">
                     <button onClick={() => handleEdit(p)} className="p-3 text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 text-xs font-black uppercase">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden">
             <div className="bg-slate-900 p-12 text-white">
                <h3 className="text-4xl font-black tracking-tight">{editId ? 'Modify Record' : 'Create Item'}</h3>
             </div>
             <div className="p-12 space-y-8">
                <input 
                  type="text" 
                  placeholder="Item Name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                />
                <div className="flex gap-6 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-5 font-black text-slate-400 uppercase tracking-widest text-xs">Discard</button>
                    <button onClick={handleSubmit} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-2xl text-xs tracking-widest">Commit Asset</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
