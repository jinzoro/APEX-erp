
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Sale, Customer, Supplier, Product, CompanyInfo, SaleItem, Language } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { Icons } from '../constants';
import { AppContext } from '../context';

const Sales: React.FC = () => {
  const { currency: baseCurrency, t } = useContext(AppContext);
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  const [orderType, setOrderType] = useState<'SALE' | 'PURCHASE'>('SALE');
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [tvaRate, setTvaRate] = useState<number>(20); 
  
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    customerName: '',
    status: 'PAID',
    date: new Date().toISOString().split('T')[0]
  });

  const fetch = async () => {
    const [s, c, supp, p, co] = await Promise.all([
      backendService.getSales(),
      backendService.getCustomers(),
      backendService.getSuppliers(),
      backendService.getProducts(),
      backendService.getCompanyInfo()
    ]);
    setSales(s);
    setCustomers(c);
    setSuppliers(supp);
    setProducts(p);
    setCompany(co);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleAddItemToOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = selectedItems.find(i => i.productId === productId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: orderType === 'SALE' ? (product.price || 0) : (product.cost || 0)
      }]);
    }
  };

  const updateItemQty = (productId: string, qty: number) => {
    setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.productId !== productId));
  };

  const totalTTC = useMemo(() => selectedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0), [selectedItems]);
  const subtotalHT = useMemo(() => totalTTC / (1 + (tvaRate / 100)), [totalTTC, tvaRate]);

  const handleCreate = async () => {
    if (!newSale.customerName || selectedItems.length === 0) return;
    
    const orderNumber = await backendService.generateNextOrderNumber();
    const saleData = {
      ...newSale,
      orderNumber,
      amount: totalTTC, 
      tva: tvaRate,
      items: [...selectedItems],
      type: orderType,
      status: 'PAID'
    } as Sale;

    await backendService.addItem('sales', saleData);
    setShowAddModal(false);
    setSelectedItems([]);
    setNewSale({
      customerName: '',
      status: 'PAID',
      date: new Date().toISOString().split('T')[0]
    });
    fetch();
  };

  const triggerPrint = (sale: Sale) => {
    setSelectedSaleForPrint(sale);
    setShowLangModal(true);
  };

  const generateInvoice = (lang: Language) => {
    const sale = selectedSaleForPrint;
    if (!sale) return;
    
    const win = window.open('', '_blank');
    if (!win) return;

    const labels = (translations: any) => {
      const l = {
        EN: { inv: 'INVOICE', desc: 'Description', qty: 'Qty', price: 'Unit Price', total: 'Total TTC', subtotal: 'Subtotal HT', tax: `Tax (TVA ${sale.tva}%)`, ref: 'Ref #' },
        FR: { inv: 'FACTURE', desc: 'Désignation', qty: 'Qté', price: 'Prix Unitaire', total: 'Total TTC', subtotal: 'Sous-total HT', tax: `TVA (${sale.tva}%)`, ref: 'N° de Facture' },
        AR: { inv: 'فاتورة', desc: 'الوصف', qty: 'الكمية', price: 'سعر الوحدة', total: 'الإجمالي TTC', subtotal: 'المجموع HT', tax: `الضريبة (${sale.tva}%)`, ref: 'رقم المرجع' }
      };
      return l[lang] || l.EN;
    };

    const l = labels({});
    const isRtl = lang === 'AR';
    const sHT = sale.amount / (1 + (sale.tva / 100));
    const tvaA = sale.amount - sHT;

    const content = `
      <html>
        <head>
          <title>${l.inv} - ${sale.orderNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Cairo:wght@400;700;900&display=swap');
            body { font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"}; direction: ${isRtl ? 'rtl' : 'ltr'}; padding: 50px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; margin-bottom: 50px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 15px; border-bottom: 1px solid #f1f5f9; text-align: ${isRtl ? 'right' : 'left'}; }
            th { font-weight: 900; text-transform: uppercase; font-size: 10px; color: #64748b; }
            .summary { width: 300px; margin-left: auto; margin-right: ${isRtl ? '0' : 'auto'}; }
            .summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; }
            .total { background: #1e293b; color: #fff; padding: 20px; border-radius: 15px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
             <div><h1>${company?.name || 'Apex'}</h1><p>${company?.address || ''}</p></div>
             <div style="text-align: end;"><h2>${l.inv}</h2><p>${l.ref} ${sale.orderNumber}</p></div>
          </div>
          <table>
            <thead><tr><th>${l.desc}</th><th>${l.qty}</th><th>${l.price}</th><th>Total</th></tr></thead>
            <tbody>${sale.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price}</td><td>${i.price * i.quantity}</td></tr>`).join('')}</tbody>
          </table>
          <div class="summary">
             <div class="summary-row"><span>${l.subtotal}</span><span>${currencyService.format(sHT, 'MAD')}</span></div>
             <div class="summary-row"><span>${l.tax}</span><span>${currencyService.format(tvaA, 'MAD')}</span></div>
             <div class="summary-row total"><span>TOTAL TTC</span><span>${currencyService.format(sale.amount, 'MAD')}</span></div>
          </div>
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
        </body>
      </html>
    `;
    win.document.write(content); win.document.close();
    setShowLangModal(false);
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.sales}</h2>
          <p className="text-slate-500 font-medium">{t.operational_log}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm uppercase tracking-widest transition-all hover:bg-blue-700 active:scale-95">
          <Icons.Plus /> {t.new_transaction}
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.order_ref}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.entity}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tax_config}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.final_settlement}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-200 font-black uppercase text-xs tracking-widest">No transaction history</td></tr>
              ) : sales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-black text-slate-900 uppercase tracking-tighter">{sale.orderNumber}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-800">{sale.customerName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{sale.date}</p>
                  </td>
                  <td className="px-8 py-6"><span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">TVA {sale.tva}%</span></td>
                  <td className="px-8 py-6 font-black text-slate-900">{currencyService.format(sale.amount, baseCurrency)}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => triggerPrint(sale)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-90"><Icons.Download /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex h-[85vh]">
              <div className="w-80 bg-slate-900 p-10 text-white shrink-0 flex flex-col">
                 <h3 className="text-3xl font-black mb-2 leading-none">{t.create_order}</h3>
                 <div className="space-y-6 flex-1 mt-10 overflow-y-auto custom-scroll pr-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase">{t.transaction_type}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => {setOrderType('SALE'); setSelectedItems([]);}} className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${orderType === 'SALE' ? 'bg-blue-600 border-blue-600' : 'border-slate-800 text-slate-400'}`}>Sales</button>
                        <button onClick={() => {setOrderType('PURCHASE'); setSelectedItems([]);}} className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${orderType === 'PURCHASE' ? 'bg-white text-slate-900' : 'border-slate-800 text-slate-400'}`}>Purchase</button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase">{t.entity}</span>
                       <select className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none font-bold text-xs" value={newSale.customerName} onChange={e => setNewSale({...newSale, customerName: e.target.value})}>
                          <option value="">Select...</option>
                          {orderType === 'SALE' ? customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>) : suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase">{t.tax_config}</span>
                       <div className="flex items-center gap-4">
                          <input type="range" min="0" max="30" step="1" value={tvaRate} onChange={e => setTvaRate(Number(e.target.value))} className="flex-1 accent-blue-600" />
                          <span className="font-black text-xl text-blue-400">{tvaRate}%</span>
                       </div>
                    </div>
                 </div>
                 <div className="mt-auto p-8 bg-slate-800/50 rounded-3xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t.final_settlement}</p>
                    <p className="text-3xl font-black text-blue-400 tracking-tighter">{currencyService.format(totalTTC, 'MAD')}</p>
                 </div>
              </div>
              <div className="flex-1 p-12 flex flex-col bg-slate-50/50">
                 <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.basket}</h4>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase">{t.subtotal_ht}</p>
                         <p className="text-lg font-black text-slate-900">{currencyService.format(subtotalHT, 'MAD')}</p>
                      </div>
                    </div>
                    <select className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm shadow-sm mb-8" onChange={(e) => handleAddItemToOrder(e.target.value)}>
                        <option value="">{t.add_item}...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                    </select>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scroll space-y-3">
                      {selectedItems.map(item => (
                        <div key={item.productId} className="flex items-center gap-6 p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
                           <div className="flex-1"><p className="text-sm font-black text-slate-900 truncate">{item.name}</p></div>
                           <div className="flex items-center gap-5">
                              <input type="number" value={item.quantity} className="w-20 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-sm" onChange={(e) => updateItemQty(item.productId, Number(e.target.value))}/>
                              <button onClick={() => handleRemoveItem(item.productId)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Icons.Alert /></button>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="flex gap-6 pt-10 border-t border-slate-100 mt-6 shrink-0">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95">Authorize Transaction</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showLangModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center">
              <h3 className="text-2xl font-black mb-8">Document Language</h3>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => generateInvoice('EN')} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">English</button>
                 <button onClick={() => generateInvoice('FR')} className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs">Français</button>
                 <button onClick={() => generateInvoice('AR')} className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs">العربية</button>
                 <button onClick={() => setShowLangModal(false)} className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
