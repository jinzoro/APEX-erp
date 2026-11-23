import React, { useState, useEffect, useContext } from 'react';
import { CreditNote, Sale } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';

const CreditNotes: React.FC = () => {
  const { currency: baseCurrency } = useContext(AppContext);
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [invoices, setInvoices] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [reason, setReason] = useState('');

  const fetch = async () => {
    const [n, s] = await Promise.all([backendService.getCreditNotes(), backendService.getSales()]);
    setNotes(n as CreditNote[]);
    setInvoices(s as Sale[]);
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv || !reason) return;
    const number = await backendService.generateNextCreditNoteNumber();
    const note: CreditNote = {
      id: Math.random().toString(36).substr(2, 9),
      number,
      originalInvoiceId: inv.id,
      originalInvoiceNumber: inv.orderNumber,
      customerName: inv.customerName,
      buyerIce: inv.buyerIce,
      date: new Date().toISOString().split('T')[0],
      currency: inv.currency || 'MAD',
      subtotalHt: inv.subtotalHt,
      totalVat: inv.totalVat,
      amount: inv.amount,
      items: inv.items.map(i => ({ ...i })),
      reason,
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
    };
    await backendService.addItem('creditNotes', note);
    setShowModal(false);
    setSelectedInvoiceId('');
    setReason('');
    fetch();
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Avoirs (Credit Notes)</h2>
          <p className="text-slate-500 font-medium">Corrections liées à une facture validée</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg flex items-center gap-2 text-sm uppercase tracking-widest">
          <Icons.Plus /> Nouvel avoir
        </button>
      </header>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">N°</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Facture origine</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant TTC</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notes.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-200 font-black uppercase text-xs tracking-widest">Aucun avoir</td></tr>
              ) : notes.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-black text-slate-900">{n.number}</td>
                  <td className="px-8 py-6 text-sm text-slate-700">{n.originalInvoiceNumber}</td>
                  <td className="px-8 py-6 text-sm text-slate-700">{n.customerName}</td>
                  <td className="px-8 py-6 font-black text-slate-900">{currencyService.format(n.amount, baseCurrency)}</td>
                  <td className="px-8 py-6 text-sm text-slate-500">{n.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="bg-slate-900 p-10 text-white">
                 <h3 className="text-3xl font-black tracking-tight">Nouvel avoir</h3>
              </div>
              <div className="p-10 space-y-6">
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={selectedInvoiceId} onChange={e => setSelectedInvoiceId(e.target.value)}>
                    <option value="">Sélectionner une facture...</option>
                    {invoices.map(i => <option key={i.id} value={i.id}>{i.orderNumber} - {i.customerName}</option>)}
                 </select>
                 <textarea placeholder="Motif de l'avoir" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold h-24" />
                 <div className="flex gap-6">
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

export default CreditNotes;
