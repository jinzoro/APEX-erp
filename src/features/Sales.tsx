import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Sale, Customer, Supplier, Product, SaleItem, Language } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { toMinor, amountInWordsFr } from '@/lib/money';
import { invoiceToUbl } from '@/lib/ubl';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { useAppToast } from '@/components/ui/ToastProvider';

const Sales: React.FC = () => {
  const { currency: baseCurrency, t, company } = useContext(AppContext);
  const toast = useAppToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [orderType, setOrderType] = useState<'SALE' | 'PURCHASE'>('SALE');
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [origCurrency, setOrigCurrency] = useState<string>('MAD');
  const [exchangeRate, setExchangeRate] = useState<string>('1');
  const [rateDate, setRateDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [newSale, setNewSale] = useState<Partial<Sale>>({
    customerName: '',
    status: 'PAID',
    date: new Date().toISOString().split('T')[0],
  });

  const fetch = async () => {
    const [s, c, supp, p] = await Promise.all([
      backendService.getSales(),
      backendService.getCustomers(),
      backendService.getSuppliers(),
      backendService.getProducts(),
    ]);
    setSales(s);
    setCustomers(c);
    setSuppliers(supp);
    setProducts(p);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleAddItemToOrder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const unitPrice = orderType === 'SALE' ? (product.price || 0) : (product.cost || 0);
    const vatRate = 20;
    const makeLine = (qty: number) => {
      const lineHt = qty * unitPrice;
      const lineVat = Math.round(lineHt * vatRate) / 100;
      return { productId: product.id, name: product.name, quantity: qty, price: unitPrice, vatRate, lineHt, lineVat, lineTtc: lineHt + lineVat };
    };
    const existing = selectedItems.find((i) => i.productId === productId);
    if (existing) {
      setSelectedItems(selectedItems.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1, lineHt: (i.quantity + 1) * i.price, lineVat: Math.round((i.quantity + 1) * i.price * i.vatRate) / 100, lineTtc: (i.quantity + 1) * i.price + Math.round((i.quantity + 1) * i.price * i.vatRate) / 100 } : i));
    } else {
      setSelectedItems([...selectedItems, makeLine(1)]);
    }
  };

  const updateItemQty = (productId: string, qty: number) => {
    const q = Math.max(1, qty);
    setSelectedItems(selectedItems.map((i) => i.productId === productId ? { ...i, quantity: q, lineHt: q * i.price, lineVat: Math.round(q * i.price * i.vatRate) / 100, lineTtc: q * i.price + Math.round(q * i.price * i.vatRate) / 100 } : i));
  };

  const updateItemVat = (productId: string, rate: number) => {
    setSelectedItems(selectedItems.map((i) => i.productId === productId ? { ...i, vatRate: rate, lineVat: Math.round(i.quantity * i.price * rate) / 100, lineTtc: i.quantity * i.price + Math.round(i.quantity * i.price * rate) / 100 } : i));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.productId !== productId));
  };

  const totalHt = useMemo(() => selectedItems.reduce((acc, item) => acc + item.lineHt, 0), [selectedItems]);
  const totalVat = useMemo(() => selectedItems.reduce((acc, item) => acc + item.lineVat, 0), [selectedItems]);
  const totalTtc = useMemo(() => selectedItems.reduce((acc, item) => acc + item.lineTtc, 0), [selectedItems]);

  const handleCreate = async () => {
    if (!newSale.customerName || selectedItems.length === 0) return;

    const orderNumber = await backendService.generateNextOrderNumber();
    const customer = customers.find((c) => c.name === newSale.customerName);
    const saleData = {
      ...newSale,
      orderNumber,
      subtotalHt: totalHt,
      totalVat: totalVat,
      amount: totalTtc,
      items: [...selectedItems],
      type: orderType,
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
      paymentTerms: '30 jours',
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Virement',
      currency: 'MAD',
      originalCurrency: origCurrency !== 'MAD' ? origCurrency : undefined,
      exchangeRate: origCurrency !== 'MAD' ? Number(exchangeRate) : undefined,
      rateDate: origCurrency !== 'MAD' ? rateDate : undefined,
      buyerIce: (customer as any)?.ice,
      buyerAddress: (customer as any)?.address,
    } as Sale;

    await backendService.addItem('sales', saleData);
    setShowAddModal(false);
    setSelectedItems([]);
    setOrigCurrency('MAD');
    setExchangeRate('1');
    setRateDate(new Date().toISOString().split('T')[0]);
    setNewSale({
      customerName: '',
      status: 'PAID',
      date: new Date().toISOString().split('T')[0],
    });
    toast.success({ title: 'Transaction créée', description: `Commande ${orderNumber} validée` });
    fetch();
  };

  const triggerPrint = (sale: Sale) => {
    setSelectedSaleForPrint(sale);
    setShowPreviewModal(true);
  };

  const downloadUbl = async (sale: Sale) => {
    try {
      const xml = invoiceToUbl(sale, company);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sale.orderNumber}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error({ title: 'UBL Export', description: 'Échec de l\'export XML UBL 2.1' });
    }
  };

  const generateInvoiceHtml = React.useCallback((lang: Language) => {
    const sale = selectedSaleForPrint;
    if (!sale) return '';

    const labels = {
      EN: { inv: 'INVOICE', desc: 'Item description', qty: 'Quantity', price: 'Unit Price', total: 'Total Price', subtotal: 'Sub Total', tax: `TVA`, gtotal: 'Grand Total', to: 'Invoice To:', thanks: 'Thanks for your business!' },
      FR: { inv: 'FACTURE', desc: 'Désignation', qty: 'Quantité', price: 'Prix Unit.', total: 'Prix Total', subtotal: 'Sous Total', tax: `TVA`, gtotal: 'Total Général', to: 'Facturer à:', thanks: 'Merci de votre confiance !' },
      AR: { inv: 'فاتورة', desc: 'الوصف', qty: 'الكمية', price: 'سعر الوحدة', total: 'السعر الإجمالي', subtotal: 'المجموع الفرعي', tax: `الضريبة`, gtotal: 'المجموع الكلي', to: 'إلى:', thanks: 'شكراً لتعاملكم معنا' },
    };

    const l = labels[lang] || labels.EN;
    const isRtl = lang === 'AR';
    const sHT = sale.subtotalHt;
    const tvaA = sale.totalVat;
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
                  ${sale.dueDate ? `<p>Due Date: <span style="color:#64748b">${new Date(sale.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>` : ''}
                  ${sale.paymentTerms ? `<p>Payment terms: <span style="color:#64748b">${sale.paymentTerms}</span></p>` : ''}
                  ${sale.paymentMethod ? `<p>Payment method: <span style="color:#64748b">${sale.paymentMethod}</span></p>` : ''}
                  ${sale.originalCurrency ? `<p>Original currency: <span style="color:#64748b">${sale.originalCurrency} (rate ${sale.exchangeRate} on ${sale.rateDate})</span></p>` : ''}
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
                  ${sale.items.map((i) => `
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
            <p style="padding:0 60px 20px; font-size:10px; color:#94a3b8; text-align:center;">En cas de retard de paiement, une pénalité de retard pourra être appliquée conformément à la loi 69-21 (TO VERIFY).</p>

            <div class="footer-geometric">
              <div class="footer-accent-bar"></div>
              <div class="footer-red-bar"></div>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [selectedSaleForPrint, company]);

  React.useEffect(() => {
    setPreviewHtml(generateInvoiceHtml('FR'));
  }, [selectedSaleForPrint, generateInvoiceHtml]);

  const handleFinalPrint = () => {
    const iframe = document.getElementById('invoice-print-frame') as HTMLIFrameElement | null;
    if (iframe) {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 100);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.sales || 'Ventes (Sales)'}
        description={t.operational_log || 'Opérations de vente et facturation'}
        actions={
          <Button
            onClick={() => setShowAddModal(true)}
            variant="default"
            style={{ backgroundColor: company?.primaryColor }}
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            {t.new_transaction || 'Nouvelle transaction'}
          </Button>
        }
      />

      <iframe id="invoice-print-frame" style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '210mm', height: '297mm', border: 0 }} title="Print Frame" />

      <Card className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.order_ref || 'N° Commande'}</TableHead>
              <TableHead>{t.entity || 'Entité'}</TableHead>
              <TableHead>{t.tax_config || 'Configuration Taxe'}</TableHead>
              <TableHead className="text-right">{t.final_settlement || 'Montant Total'}</TableHead>
              <TableHead className="text-right">{t.actions || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Aucun historique de transaction
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell className="font-mono text-xs font-bold text-slate-900 uppercase tracking-tighter">{sale.orderNumber}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{sale.customerName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{new Date(sale.date).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" className="text-[10px] px-2 py-1">
                      TVA
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 text-right">
                    {currencyService.format(sale.amount, baseCurrency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => triggerPrint(sale)} className="!p-2 text-[10px]">
                      <Icons.Download className="w-3 h-3 mr-1" />
                      {t.download || 'Imprimer'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadUbl(sale)} className="ml-2 !p-2 text-[10px]" title="Export UBL 2.1">
                      UBL
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t.create_order || 'Créer une commande'}
        description="Sélectionnez un client, ajoutez des articles et validez la transaction"
        size="xl"
      >
        <div className="h-full flex">
          <div className="w-80 bg-slate-900 p-10 text-white shrink-0 flex flex-col border-r border-slate-800">
            <h3 className="text-3xl font-black mb-2 leading-none">{t.create_order || 'Nouvelle commande'}</h3>
            <div className="space-y-6 flex-1 mt-8 overflow-y-auto pr-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">{t.transaction_type || 'Type de transaction'}</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => { setOrderType('SALE'); setSelectedItems([]); }}
                    variant={orderType === 'SALE' ? 'default' : 'outline'}
                    className="text-[9px] py-3 uppercase tracking-widest"
                    style={{ backgroundColor: orderType === 'SALE' ? company?.primaryColor : 'transparent', borderColor: orderType === 'SALE' ? company?.primaryColor : 'transparent' }}
                  >
                    Sales
                  </Button>
                  <Button
                    onClick={() => { setOrderType('PURCHASE'); setSelectedItems([]); }}
                    variant={orderType === 'PURCHASE' ? 'default' : 'outline'}
                    className="text-[9px] py-3 uppercase tracking-widest"
                  >
                    Purchase
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">{t.entity || 'Entité'}</span>
                <Select
                  className="bg-slate-800 border-slate-700 text-white"
                  value={newSale.customerName || ''}
                  onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                >
                  <option value="">Select Account...</option>
                  {orderType === 'SALE' ? customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>) : suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">{t.tax_config || 'Configuration Taxe'}</span>
                <p className="text-[10px] text-slate-400">TVA par ligne (voir tax_rates)</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">Devise d'origine</span>
                <Input
                  type="text"
                  value={origCurrency}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrigCurrency(e.target.value.toUpperCase())}
                  className="bg-slate-800 border-slate-700 text-white font-bold text-xs"
                />
                {origCurrency !== 'MAD' && (
                  <>
                    <Input
                      type="number"
                      step="0.0001"
                      value={exchangeRate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExchangeRate(e.target.value)}
                      placeholder="Taux"
                      className="bg-slate-800 border-slate-700 text-white font-bold text-xs"
                    />
                    <Input
                      type="date"
                      value={rateDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRateDate(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white font-bold text-xs"
                    />
                  </>
                )}
              </div>
            </div>
            <div className="mt-auto p-8 bg-slate-800/50 rounded-3xl border border-slate-800">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{t.final_settlement || 'Montant Total'}</p>
              <p className="text-3xl font-bold tracking-tighter" style={{ color: company?.primaryColor }}>
                {currencyService.format(totalTtc, 'MAD')}
              </p>
            </div>
          </div>
          <div className="flex-1 p-12 flex flex-col bg-slate-50/50">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.basket || 'Panier'}</h4>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase">{t.subtotal_ht || 'Sous Total HT'}</p>
                  <p className="text-lg font-bold text-slate-900">{currencyService.format(totalHt, 'MAD')}</p>
                </div>
              </div>
              <Select
                className="w-full mb-8"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAddItemToOrder(e.target.value)}
              >
                <option value="">{t.add_item || 'Ajouter un article'} à la commande...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
              </Select>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {selectedItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItemQty(item.productId, Number(e.target.value))}
                        className="w-20 p-2 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-sm"
                      />
                      <Select
                        value={String(item.vatRate)}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItemVat(item.productId, Number(e.target.value))}
                        className="w-20 p-2 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-sm"
                      >
                        {[0, 7, 10, 14, 20].map((r) => <option key={r} value={String(r)}>{r}%</option>)}
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveItem(item.productId)} className="!p-2 text-rose-500 hover:bg-rose-50">
                        <Icons.Alert className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-8 border-t border-slate-200 mt-8 shrink-0">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleCreate} className="flex-1 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">
                {t.authorize_transaction || 'Autoriser la transaction'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Aperçu de facture"
        description="Document commercial certifié A4 - prêt à l'impression"
        size="full"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto bg-slate-100 p-12 flex justify-center">
            <div className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden" style={{ width: '210mm', minHeight: '297mm', pointerEvents: 'none' }}>
              <iframe srcDoc={previewHtml} className="w-full h-full border-0" title="Preview Frame" />
            </div>
          </div>
          <div className="p-8 bg-white border-t flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => setShowPreviewModal(false)}>
              Fermer
            </Button>
            <Button onClick={handleFinalPrint} className="bg-slate-900 text-white font-bold uppercase tracking-widest text-xs shadow-xl">
              <Icons.Download className="w-3 h-3 mr-2" />
              Imprimer / Télécharger PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
