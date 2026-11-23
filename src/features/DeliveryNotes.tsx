import React, { useState, useEffect, useContext } from 'react';
import { DeliveryNote, Sale } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { AppContext } from '@/lib/context';

const DeliveryNotes: React.FC = () => {
  const { } = useContext(AppContext);
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const fetch = async () => {
    const [n, s] = await Promise.all([backendService.getDeliveryNotes(), backendService.getSales()]);
    setNotes(n as DeliveryNote[]);
    setSales(s as Sale[]);
  };
  useEffect(() => { fetch(); }, []);

  const selectedSale = sales.find(s => s.id === selectedSaleId);

  const openModal = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    setSelectedSaleId(saleId);
    const q: Record<string, number> = {};
    for (const it of sale.items) q[it.productId] = it.quantity;
    setQtys(q);
    setShowModal(true);
  };

  const handleCreate = async () => {
    const sale = sales.find(s => s.id === selectedSaleId);
    if (!sale) return;
    const number = await backendService.generateNextDeliveryNoteNumber();
    const note: DeliveryNote = {
      id: Math.random().toString(36).substr(2, 9),
      number,
      date: new Date().toISOString().split('T')[0],
      saleId: sale.id,
      saleNumber: sale.orderNumber,
      customerName: sale.customerName,
      buyerIce: sale.buyerIce,
      items: sale.items.map(it => ({ productId: it.productId, name: it.name, quantity: it.quantity, delivered: qtys[it.productId] || 0 })),
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
    };
    await backendService.addItem('deliveryNotes', note);
    setShowModal(false);
    setSelectedSaleId('');
    fetch();
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bons de livraison</h2>
          <p className="text-slate-500 font-medium">Livraison partielle / totale</p>
        </div>
        <button onClick={() => { if (sales.length) openModal(sales[0].id); }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg flex items-center gap-2 text-sm uppercase tracking-widest">
          <span>+</span> Nouveau BL
        </button>
      </header>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">N°</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Facture</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notes.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-200 font-black uppercase text-xs tracking-widest">Aucun bon de livraison</td></tr>
              ) : notes.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-black text-slate-900">{n.number}</td>
                  <td className="px-8 py-6 text-sm text-slate-700">{n.saleNumber}</td>
                  <td className="px-8 py-6 text-sm text-slate-700">{n.customerName}</td>
                  <td className="px-8 py-6 text-sm text-slate-500">{n.date}</td>
                  <td className="px-8 py-6 text-sm text-emerald-600 font-black">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedSale && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-900 p-10 text-white">
                 <h3 className="text-3xl font-black tracking-tight">Nouveau BL</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{selectedSale.orderNumber} — {selectedSale.customerName}</p>
              </div>
              <div className="p-10 space-y-4">
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={selectedSaleId} onChange={e => openModal(e.target.value)}>
                    {sales.map(s => <option key={s.id} value={s.id}>{s.orderNumber} - {s.customerName}</option>)}
                 </select>
                 {selectedSale.items.map(it => (
                   <div key={it.productId} className="flex items-center gap-4">
                     <span className="flex-1 font-bold text-slate-700">{it.name} (commandé: {it.quantity})</span>
                     <input type="number" value={qtys[it.productId] || 0} onChange={e => setQtys({...qtys, [it.productId]: Number(e.target.value)})} className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center" />
                   </div>
                 ))}
                 <div className="flex gap-6 pt-4">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Annuler</button>
                    <button onClick={handleCreate} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Créer</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNotes;
