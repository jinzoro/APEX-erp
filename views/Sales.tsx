
import React, { useEffect, useState, useContext } from 'react';
import { Sale, Customer, Supplier, Product, CompanyInfo, SaleItem, Language } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => { fetch(); }, []);

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

  const updateItemPrice = (productId: string, price: number) => {
    setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, price: Math.max(0, price) } : i));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.productId !== productId));
  };

  const calculateTotalTTC = () => selectedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const calculateSubtotalHT = () => calculateTotalTTC() / (1 + (tvaRate / 100));
  const calculateTvaAmount = () => calculateTotalTTC() - calculateSubtotalHT();

  const handleCreate = async () => {
    if (!newSale.customerName || selectedItems.length === 0) return;
    
    const orderNumber = await backendService.generateNextOrderNumber();
    const ttc = calculateTotalTTC();
    const saleData = {
      ...newSale,
      orderNumber,
      amount: ttc, 
      tva: tvaRate,
      items: selectedItems,
      type: orderType,
      status: 'PAID'
    };

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
    if (!selectedSaleForPrint) return;
    const sale = selectedSaleForPrint;
    const isPurchase = sale.type === 'PURCHASE';
    const cust = (customers.find(c => c.name === sale.customerName) || suppliers.find(s => s.name === sale.customerName)) as any;
    const win = window.open('', '_blank');
    if (!win) return;

    const labels = {
      EN: { inv: 'INVOICE', from: 'From', to: 'Bill To', desc: 'Description', qty: 'Qty', price: 'Unit Price', total: 'Total TTC', subtotal: 'Subtotal HT', tax: `Tax (TVA ${sale.tva}%)`, date: 'Date', ref: 'Ref #' },
      FR: { inv: 'FACTURE', from: 'De', to: 'Facturé à', desc: 'Désignation', qty: 'Qté', price: 'Prix Unitaire', total: 'Total TTC', subtotal: 'Sous-total HT', tax: `TVA (${sale.tva}%)`, date: 'Date', ref: 'N° de Facture' },
      AR: { inv: 'فاتورة', from: 'من', to: 'إلى', desc: 'الوصف', qty: 'الكمية', price: 'سعر الوحدة', total: 'الإجمالي TTC', subtotal: 'المجموع HT', tax: `الضريبة (${sale.tva}%)`, date: 'التاريخ', ref: 'رقم المرجع' }
    }[lang];

    const isRtl = lang === 'AR';
    const subtotalHT = sale.amount / (1 + (sale.tva / 100));
    const tvaAmount = sale.amount - subtotalHT;

    const content = `
      <html>
        <head>
          <title>${labels.inv} - ${sale.orderNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Cairo:wght@400;700;900&display=swap');
            @page { margin: 0; size: auto; }
            body { 
              font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"}; 
              color: #334155; margin: 0; padding: 0; background: #fff;
              direction: ${isRtl ? 'rtl' : 'ltr'};
              -webkit-print-color-adjust: exact;
            }
            .wrapper { padding: 50px 70px; max-width: 950px; margin: 0 auto; position: relative; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
            .brand h1 { margin: 0; font-size: 26px; font-weight: 900; color: #1e293b; letter-spacing: -1px; }
            .brand-info { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; line-height: 1.6; margin-top: 4px; }
            .invoice-label { text-align: ${isRtl ? 'left' : 'right'}; }
            .invoice-label h2 { margin: 0; font-size: 48px; font-weight: 900; color: #2563eb; letter-spacing: -2px; }
            .invoice-label p { margin: 4px 0 0; font-size: 15px; font-weight: 800; color: #1e293b; }
            .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
            .party-card { padding: 30px; background: #f8fafc; border-radius: 20px; border: 1px solid #f1f5f9; }
            .party-card h4 { margin: 0 0 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #2563eb; letter-spacing: 1.5px; }
            .party-card .name { font-size: 18px; font-weight: 900; color: #1e293b; display: block; margin-bottom: 6px; }
            .party-card .details { font-size: 11px; color: #64748b; font-weight: 500; line-height: 1.6; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 50px; }
            th { padding: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #f1f5f9; text-align: ${isRtl ? 'right' : 'left'}; }
            td { padding: 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f8fafc; }
            .text-end { text-align: ${isRtl ? 'left' : 'right'}; }
            .footer-grid { display: flex; justify-content: flex-end; }
            .summary { width: 350px; }
            .summary-line { display: flex; justify-content: space-between; padding: 12px 0; font-size: 14px; font-weight: 700; color: #64748b; }
            .summary-line.total { 
              margin-top: 20px; padding: 25px; background: #2563eb; color: #fff; border-radius: 20px; font-size: 24px; font-weight: 900; 
            }
            .summary-line.total span { font-size: 12px; opacity: 0.8; font-weight: 800; }
            .stamp-zone { margin-top: 80px; text-align: center; border-top: 2px solid #f8fafc; padding-top: 40px; }
            @media print { .wrapper { padding: 40px; } }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div class="brand">
                ${company?.logo ? `<img src="${company.logo}" style="max-height:55px; margin-bottom:10px;">` : `<h1>${company?.name || 'APEX ERP'}</h1>`}
                <div class="brand-info">${company?.address || ''}<br>ICE: ${company?.ice || '-'} | IF: ${company?.if || '-'}</div>
              </div>
              <div class="invoice-label">
                <h2>${labels.inv}</h2>
                <p>${labels.ref} ${sale.orderNumber}</p>
                <div class="date">${labels.date}: ${new Date(sale.date).toLocaleDateString(isRtl ? 'ar-MA' : 'en-US')}</div>
              </div>
            </div>
            <div class="parties">
              <div class="party-card">
                <h4>${labels.from}</h4>
                <span class="name">${company?.name || 'Apex Systems'}</span>
                <div class="details">${company?.email || ''}<br>${company?.phone || ''}</div>
              </div>
              <div class="party-card">
                <h4>${isPurchase ? 'Supplier' : labels.to}</h4>
                <span class="name">${sale.customerName}</span>
                <div class="details">${cust?.email || ''}<br>${cust?.phone || ''}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr><th>${labels.desc}</th><th class="text-end">${labels.qty}</th><th class="text-end">${labels.price}</th><th class="text-end">${labels.total}</th></tr>
              </thead>
              <tbody>
                ${sale.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-end">${item.quantity}</td>
                    <td class="text-end">${currencyService.format(item.price, 'MAD')}</td>
                    <td class="text-end">${currencyService.format(item.price * item.quantity, 'MAD')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer-grid">
              <div class="summary">
                <div class="summary-line"><span>${labels.subtotal}</span> <span>${currencyService.format(subtotalHT, 'MAD')}</span></div>
                <div class="summary-line"><span>${labels.tax}</span> <span>${currencyService.format(tvaAmount, 'MAD')}</span></div>
                <div class="summary-line total"><span>${labels.total}</span> <div>${currencyService.format(sale.amount, 'MAD')}</div></div>
              </div>
            </div>
            <div class="stamp-zone"><div class="stamp-text">Official Signature & Cachet</div></div>
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

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
             <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }} className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex h-[85vh]">
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
                         <select className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none font-bold text-xs" onChange={e => setNewSale({...newSale, customerName: e.target.value})}>
                            <option value="">Select...</option>
                            {orderType === 'SALE' ? customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>) : suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                         </select>
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[9px] font-black text-slate-500 uppercase">{t.tax_config}</span>
                         <div className="flex items-center gap-4">
                            <input type="range" min="0" max="30" step="1" value={tvaRate} className="flex-1 accent-blue-600" onChange={e => setTvaRate(Number(e.target.value))} />
                            <span className="font-black text-xl text-blue-400">{tvaRate}%</span>
                         </div>
                         <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Inclusive logic enabled</p>
                      </div>
                   </div>
                   <div className="mt-auto p-8 bg-slate-800/50 rounded-3xl border border-slate-800">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t.final_settlement}</p>
                      <p className="text-3xl font-black text-blue-400 tracking-tighter">{currencyService.format(calculateTotalTTC(), 'MAD')}</p>
                   </div>
                </div>
                <div className="flex-1 p-12 flex flex-col bg-slate-50/50">
                   <div className="flex-1 overflow-hidden flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.basket}</h4>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase">{t.subtotal_ht}</p>
                           <p className="text-lg font-black text-slate-900">{currencyService.format(calculateSubtotalHT(), 'MAD')}</p>
                           <p className="text-[8px] font-black text-blue-500 uppercase mt-1">TVA Included: {currencyService.format(calculateTvaAmount(), 'MAD')}</p>
                        </div>
                      </div>
                      <select className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm shadow-sm mb-8" value="" onChange={e => handleAddItemToOrder(e.target.value)}>
                          <option value="">{t.add_item}...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                      </select>
                      <div className="flex-1 overflow-y-auto pr-2 custom-scroll space-y-3">
                        {selectedItems.length === 0 ? (
                          <div className="py-20 text-center border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-200 font-black uppercase text-xs">No assets selected</div>
                        ) : selectedItems.map(item => (
                          <div key={item.productId} className="flex items-center gap-6 p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
                             <div className="flex-1"><p className="text-sm font-black text-slate-900 truncate">{item.name}</p></div>
                             <div className="flex items-center gap-5">
                                <div className="space-y-1">
                                   <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Qty</span>
                                   <input type="number" value={item.quantity} className="w-20 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-sm" onChange={e => updateItemQty(item.productId, Number(e.target.value))}/>
                                </div>
                                <div className="space-y-1">
                                   <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Price</span>
                                   <input type="number" value={item.price} className="w-28 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-sm text-blue-600" onChange={e => updateItemPrice(item.productId, Number(e.target.value))}/>
                                </div>
                                <button onClick={() => handleRemoveItem(item.productId)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl mt-4 transition-all opacity-0 group-hover:opacity-100"><Icons.Alert /></button>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="flex gap-6 pt-10 border-t border-slate-100 mt-6 shrink-0">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">{t.cancel}</button>
                      <button onClick={handleCreate} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/30 active:scale-95">Authorize Transaction</button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
        {showLangModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-sm p-12 shadow-2xl">
                <div className="text-center mb-10"><h3 className="text-3xl font-black text-slate-900 tracking-tighter">Document Lang</h3></div>
                <div className="space-y-3">
                   {['EN', 'FR', 'AR'].map(l => (
                     <button key={l} onClick={() => generateInvoice(l as Language)} className="w-full py-5 bg-slate-50 hover:bg-slate-100 rounded-2xl font-black text-sm text-slate-900 border border-slate-100 uppercase tracking-widest transition-all">{l}</button>
                   ))}
                </div>
                <button onClick={() => setShowLangModal(false)} className="w-full mt-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.cancel}</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
