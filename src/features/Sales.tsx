
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Sale, Customer, Supplier, Product, CompanyInfo, SaleItem, Language } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { toMinor, amountInWordsFr } from '@/lib/money';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';

const Sales: React.FC = () => {
  const { currency: baseCurrency, t } = useContext(AppContext);
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  const [orderType, setOrderType] = useState<'SALE' | 'PURCHASE'>('SALE');
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [tvaRate, setTvaRate] = useState<number>(20); 
  const [previewHtml, setPreviewHtml] = useState<string>('');
  
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

  // Logic: Price is already TTC. Subtotal HT and TVA are calculated from the total.
  const totalTTC = useMemo(() => selectedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0), [selectedItems]);
  const subtotalHT = useMemo(() => totalTTC / (1 + (tvaRate / 100)), [totalTTC, tvaRate]);

  const handleCreate = async () => {
    if (!newSale.customerName || selectedItems.length === 0) return;
    
    const orderNumber = await backendService.generateNextOrderNumber();
    const customer = customers.find(c => c.name === newSale.customerName);
    const saleData = {
      ...newSale,
      orderNumber,
      amount: totalTTC, 
      tva: tvaRate,
      items: [...selectedItems],
      type: orderType,
      status: 'PAID',
      buyerIce: (customer as any)?.ice,
      buyerAddress: (customer as any)?.address,
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

  const generateInvoiceHtml = (lang: Language) => {
    const sale = selectedSaleForPrint;
    if (!sale) return '';
    
    const labels = {
      EN: { inv: 'INVOICE', desc: 'Item description', qty: 'Quantity', price: 'Unit Price', total: 'Total Price', subtotal: 'Sub Total', tax: `Vat & Tax (${sale.tva}%)`, gtotal: 'Grand Total', to: 'Invoice To:', thanks: 'Thanks for your business!' },
      FR: { inv: 'FACTURE', desc: 'Désignation', qty: 'Quantité', price: 'Prix Unit.', total: 'Prix Total', subtotal: 'Sous Total', tax: `TVA (${sale.tva}%)`, gtotal: 'Total Général', to: 'Facturer à:', thanks: 'Merci de votre confiance !' },
      AR: { inv: 'فاتورة', desc: 'الوصف', qty: 'الكمية', price: 'سعر الوحدة', total: 'السعر الإجمالي', subtotal: 'المجموع الفرعي', tax: `الضريبة (${sale.tva}%)`, gtotal: 'المجموع الكلي', to: 'إلى:', thanks: 'شكراً لتعاملكم معنا' }
    };

    const l = labels[lang] || labels.EN;
    const isRtl = lang === 'AR';
    const sHT = sale.amount / (1 + (sale.tva / 100));
    const tvaA = sale.amount - sHT;
    const themeColor = company?.primaryColor || '#e11d48';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Cairo:wght@400;700;900&display=swap');
            
            @page {
              margin: 0;
              size: A4;
            }

            body {
              font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
              direction: ${isRtl ? 'rtl' : 'ltr'};
              margin: 0;
              padding: 0;
              background: #fff;
              color: #334155;
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
            }

            .invoice-wrapper {
              position: relative;
              height: 100%;
              display: flex;
              flex-direction: column;
              background: #fff;
            }

            /* Geometric Header Elements */
            .header-strip {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 70px 60px 40px;
            }

            .header-design-box {
              position: absolute;
              top: 0;
              right: 0;
              width: 420px;
              height: 200px;
              background: #1e1e1e;
              clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
              z-index: 1;
              display: flex;
              align-items: flex-end;
              justify-content: flex-start;
            }

            .header-design-accent {
              position: absolute;
              top: 0;
              right: 0;
              width: 420px;
              height: 80px;
              background: ${themeColor};
              clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
              z-index: 2;
            }

            .header-label {
              position: relative;
              z-index: 3;
              color: #fff;
              font-size: 58px;
              font-weight: 900;
              margin-bottom: 30px;
              margin-left: 80px;
              letter-spacing: 3px;
              line-height: 1;
              text-transform: uppercase;
            }

            .logo-area {
              display: flex;
              align-items: center;
              gap: 15px;
              position: relative;
              z-index: 10;
            }

            .logo-img {
              height: 80px;
              max-width: 220px;
              object-fit: contain;
            }

            /* Billing Info Area */
            .info-section {
              padding: 0 60px;
              display: flex;
              justify-content: space-between;
              margin-bottom: 50px;
            }

            .bill-to h4 {
              color: ${themeColor};
              font-size: 14px;
              text-transform: uppercase;
              margin-bottom: 10px;
              font-weight: 700;
            }

            .bill-to p {
              margin: 4px 0;
              font-size: 14px;
              font-weight: 600;
            }

            .invoice-meta {
              text-align: right;
            }

            .meta-box {
              background: #1e1e1e;
              color: #fff;
              padding: 12px 25px;
              border-radius: 4px;
              display: inline-block;
              margin-bottom: 15px;
            }

            .meta-box span {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              display: block;
              letter-spacing: 1px;
              opacity: 0.7;
            }

            .meta-box p {
              margin: 0;
              font-size: 18px;
              font-weight: 900;
              letter-spacing: 1px;
            }

            .meta-details p {
              margin: 6px 0;
              font-size: 13px;
              font-weight: 700;
            }

            /* Table Design */
            .table-container {
              padding: 0 60px;
              flex: 1;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            thead th {
              background: ${themeColor};
              color: #fff;
              padding: 18px 20px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              text-align: left;
            }

            tbody td {
              padding: 22px 20px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
              font-weight: 600;
            }

            .item-desc {
              font-weight: 700;
              color: #1e1e1e;
              margin-bottom: 4px;
              font-size: 15px;
            }

            .item-sub {
              font-size: 11px;
              color: #94a3b8;
              font-weight: 500;
            }

            /* Summary Area */
            .summary-footer {
              padding: 40px 60px;
              display: flex;
              justify-content: flex-end;
              align-items: flex-start;
            }

            .calculation-stack {
              width: 320px;
            }

            .calc-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 14px;
              font-weight: 700;
              color: #64748b;
            }

            .grand-total-box {
              background: ${themeColor};
              color: #fff;
              padding: 20px 25px;
              border-radius: 4px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }

            .grand-total-box span:first-child {
              font-size: 14px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .grand-total-box span:last-child {
              font-size: 24px;
              font-weight: 900;
            }

            /* Footer Design */
            .footer-geometric {
              position: relative;
              background: #fff;
              height: 120px;
            }

            .footer-accent-bar {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 100px;
              background: #1e1e1e;
              clip-path: polygon(0 40%, 80% 40%, 85% 100%, 0 100%);
              z-index: 1;
            }

            .footer-red-bar {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 60px;
              background: ${themeColor};
              clip-path: polygon(0 0, 75% 0, 80% 100%, 0 100%);
              z-index: 2;
            }

            .thanks-note {
              font-size: 14px;
              font-weight: 800;
              color: #1e1e1e;
              padding: 0 60px 40px;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <div class="header-design-accent"></div>
            <div class="header-design-box">
              <h1 class="header-label">${l.inv}</h1>
            </div>

            <div class="header-strip">
              <div class="logo-area">
                ${company?.logo ? `<img src="${company.logo}" class="logo-img" />` : `<div style="width:80px; height:80px; background:${themeColor}; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:40px; font-weight:900;">A</div>`}
              </div>
            </div>

            <div class="info-section">
              <div class="bill-to">
                <h4>${l.to}</h4>
                <p style="font-size: 18px; font-weight: 900; color: #1e1e1e; margin-bottom: 8px;">${sale.customerName}</p>
                ${sale.buyerIce ? `<p>ICE: ${sale.buyerIce}</p>` : ''}
                ${sale.buyerAddress ? `<p>${sale.buyerAddress}</p>` : ''}
              </div>
              <div class="seller-block" style="font-size:12px; color:#64748b; max-width:260px;">
                <p style="font-weight:900; color:#1e1e1e; margin-bottom:4px;">${company?.name || ''}</p>
                ${company?.legalForm ? `<p>Forme: ${company.legalForm}${company.shareCapital ? ' - Capital: ' + company.shareCapital + ' MAD' : ''}</p>` : ''}
                ${company?.address ? `<p>${company.address}</p>` : ''}
                ${company?.ice ? `<p>ICE: ${company.ice}</p>` : ''}
                ${company?.if ? `<p>IF: ${company.if}</p>` : ''}
                ${company?.rc ? `<p>RC: ${company.rc}${company.rcCourt ? ' - ' + company.rcCourt : ''}</p>` : ''}
                ${company?.patente ? `<p>TP: ${company.patente}</p>` : ''}
                ${company?.cnssNumber ? `<p>CNSS: ${company.cnssNumber}</p>` : ''}
                ${company?.bankRib ? `<p>RIB: ${company.bankRib}</p>` : ''}
              </div>
              <div class="invoice-meta">
                <div class="meta-box">
                  <span>Reference ID:</span>
                  <p>${sale.orderNumber}</p>
                </div>
                <div class="meta-details">
                  <p>Issue Date: <span style="color:#64748b">${new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                  <p>Account Type: <span style="color:#64748b">Verified Business Account</span></p>
                </div>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 50%">${l.desc}</th>
                    <th style="text-align: center;">${l.qty}</th>
                    <th style="text-align: center;">${l.price}</th>
                    <th style="text-align: right;">${l.total}</th>
                  </tr>
                </thead>
                <tbody>
                  ${sale.items.map(i => `
                    <tr>
                      <td>
                        <div class="item-desc">${i.name}</div>
                        <div class="item-sub">Trade transaction logged via Apex Kernel.</div>
                      </td>
                      <td style="text-align: center;">${String(i.quantity).padStart(2, '0')}</td>
                      <td style="text-align: center;">${currencyService.format(i.price, 'MAD')}</td>
                      <td style="text-align: right; color: ${themeColor}; font-weight: 800; font-size: 15px;">${currencyService.format(i.price * i.quantity, 'MAD')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="summary-footer">
              <div class="calculation-stack">
                <div class="calc-row">
                  <span>${l.subtotal}</span>
                  <span>${currencyService.format(sHT, 'MAD')}</span>
                </div>
                <div class="calc-row">
                  <span>${l.tax}</span>
                  <span>${currencyService.format(tvaA, 'MAD')}</span>
                </div>
                <div class="grand-total-box">
                  <span>${l.gtotal}</span>
                  <span>${currencyService.format(sale.amount, 'MAD')}</span>
                </div>
                <p style="margin-top:12px; font-size:11px; color:#64748b; font-style:italic;">${amountInWordsFr(toMinor(String(sale.amount)), 'MAD')}</p>
              </div>
            </div>

            <p class="thanks-note">${l.thanks}</p>

            <div class="footer-geometric">
              <div class="footer-accent-bar"></div>
              <div class="footer-red-bar"></div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleLangSelect = (lang: Language) => {
    const html = generateInvoiceHtml(lang);
    setPreviewHtml(html);
    setShowLangModal(false);
    setShowPreviewModal(true);
  };

  const handleFinalPrint = () => {
    const iframe = document.getElementById('invoice-print-frame') as HTMLIFrameElement;
    if (iframe) {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
        
        // Wait for rendering to complete before triggering print
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 100);
      }
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.sales}</h2>
          <p className="text-slate-500 font-medium">{t.operational_log}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm uppercase tracking-widest transition-all hover:bg-blue-700 active:scale-95" style={{ backgroundColor: company?.primaryColor }}>
          <Icons.Plus /> {t.new_transaction}
        </button>
      </header>

      {/* Robust hidden frame for printing */}
      <iframe id="invoice-print-frame" style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '210mm', height: '297mm', border: 0 }} title="Print Frame" />

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
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{new Date(sale.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6"><span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg" style={{ color: company?.primaryColor, backgroundColor: (company?.primaryColor || '#2563eb') + '10' }}>TVA {sale.tva}%</span></td>
                  <td className="px-8 py-6 font-black text-slate-900">{currencyService.format(sale.amount, baseCurrency)}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => triggerPrint(sale)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-90" style={{ color: company?.primaryColor }}><Icons.Download /></button>
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
                        <button onClick={() => {setOrderType('SALE'); setSelectedItems([]);}} className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${orderType === 'SALE' ? 'bg-blue-600 border-blue-600' : 'border-slate-800 text-slate-400'}`} style={{ backgroundColor: orderType === 'SALE' ? company?.primaryColor : '', borderColor: orderType === 'SALE' ? company?.primaryColor : '' }}>Sales</button>
                        <button onClick={() => {setOrderType('PURCHASE'); setSelectedItems([]);}} className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${orderType === 'PURCHASE' ? 'bg-white text-slate-900' : 'border-slate-800 text-slate-400'}`}>Purchase</button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase">{t.entity}</span>
                       <select className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none font-bold text-xs focus:border-blue-500" value={newSale.customerName} onChange={e => setNewSale({...newSale, customerName: e.target.value})}>
                          <option value="">Select Account...</option>
                          {orderType === 'SALE' ? customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>) : suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase">{t.tax_config}</span>
                       <div className="flex items-center gap-4">
                          <input type="range" min="0" max="30" step="1" value={tvaRate} onChange={e => setTvaRate(Number(e.target.value))} className="flex-1 accent-blue-600" style={{ accentColor: company?.primaryColor }} />
                          <span className="font-black text-xl" style={{ color: company?.primaryColor }}>{tvaRate}%</span>
                       </div>
                    </div>
                 </div>
                 <div className="mt-auto p-8 bg-slate-800/50 rounded-3xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t.final_settlement}</p>
                    <p className="text-3xl font-black tracking-tighter" style={{ color: company?.primaryColor }}>{currencyService.format(totalTTC, 'MAD')}</p>
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
                    <select className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm shadow-sm mb-8 focus:border-blue-600" onChange={(e) => handleAddItemToOrder(e.target.value)}>
                        <option value="">{t.add_item} to order...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
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
                    <button onClick={handleCreate} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Authorize Transaction</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showLangModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center">
              <h3 className="text-2xl font-black mb-8">Select Language</h3>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => handleLangSelect('EN')} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">English</button>
                 <button onClick={() => handleLangSelect('FR')} className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 active:scale-95 transition-all">Français</button>
                 <button onClick={() => handleLangSelect('AR')} className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 active:scale-95 transition-all">العربية</button>
                 <button onClick={() => setShowLangModal(false)} className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-slate-100 w-full max-w-5xl h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-700">
             <header className="p-8 bg-white border-b flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Invoice Intelligence Preview</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A4 Certified Trade Document</p>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setShowPreviewModal(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Close</button>
                   <button onClick={handleFinalPrint} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center gap-2" style={{ backgroundColor: company?.primaryColor }}>
                      <Icons.Download /> Download PDF / Print
                   </button>
                </div>
             </header>
             <div className="flex-1 overflow-y-auto bg-slate-300 p-12 flex justify-center custom-scroll">
                <div className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden" style={{ width: '210mm', minHeight: '297mm', pointerEvents: 'none' }}>
                   <iframe srcDoc={previewHtml} className="w-full h-full border-0" title="Preview Frame" />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
