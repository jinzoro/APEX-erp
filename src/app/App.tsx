
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Language, CurrencyCode, CompanyInfo } from '@/lib/types';
import { currencyService } from '@/services/currencyService';
import { backendService } from '@/services/backendSimulator';
import { seedDemoData } from '@/services/seedData';
import { translations } from '@/i18n/translations';
import { AppContext } from '@/lib/context';

import { Sidebar } from '@/components/ui/Sidebar';
import { ToastProvider } from '@/components/ui/ToastProvider';
import Dashboard from '@/features/Dashboard';
import Inventory from '@/features/Inventory';
import Suppliers from '@/features/Suppliers';
import HR from '@/features/HR';
import Sales from '@/features/Sales';
import Customers from '@/features/Customers';
import Finance from '@/features/Finance';
import Settings from '@/features/Settings';
import AuditLogView from '@/features/AuditLogView';
import CreditNotes from '@/features/CreditNotes';
import Accounting from '@/features/Accounting';
import Payroll from '@/features/Payroll';
import DeliveryNotes from '@/features/DeliveryNotes';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>((localStorage.getItem('APEX_LANG') as Language) || 'EN');
  const [currency, setCurrency] = useState<CurrencyCode>((localStorage.getItem('APEX_CURR') as CurrencyCode) || 'MAD');
  const [rates, setRates] = useState<Record<string, number>>({ MAD: 10.05, USD: 1 });
  const [company, setCompany] = useState<CompanyInfo>(null!);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    const init = async () => {
      const [liveRates, companyInfo] = await Promise.all([
        currencyService.getRates(),
        backendService.getCompanyInfo()
      ]);
      setRates(liveRates);
      setCompany(companyInfo);
      try { await seedDemoData(); } catch (e) { console.warn('seed failed', e); }
      setTimeout(() => setIsLoading(false), 800);
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('APEX_LANG', lang);
    localStorage.setItem('APEX_CURR', currency);
    document.dir = lang === 'AR' ? 'rtl' : 'ltr';
  }, [lang, currency]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
          <div className="w-24 h-24 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
        </motion.div>
        <p className="mt-8 text-slate-600 font-medium tracking-widest text-xs uppercase">Loading System...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case AppView.INVENTORY: return <Inventory />;
      case AppView.SUPPLIERS: return <Suppliers />;
      case AppView.HR: return <HR />;
      case AppView.SALES: return <Sales />;
      case AppView.CUSTOMERS: return <Customers />;
      case AppView.FINANCE: return <Finance />;
      case AppView.AUDIT_LOG: return <AuditLogView />;
      case AppView.CREDIT_NOTES: return <CreditNotes />;
      case AppView.ACCOUNTING: return <Accounting />;
      case AppView.PAYROLL: return <Payroll />;
      case AppView.DELIVERY_NOTES: return <DeliveryNotes />;
      case AppView.SETTINGS:
        return <Settings
          lang={lang}
          setLang={setLang}
          currency={currency}
          setCurrency={setCurrency}
          onViewChange={setView}
        />;
      default: return <Dashboard onViewChange={setView} />;
    }
  };

  return (
    <AppContext.Provider value={{ lang, currency, rates, t, company }}>
      <ToastProvider>
        <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 ${lang === 'AR' ? 'font-arabic' : ''}`}>
          <Sidebar currentView={view} onViewChange={setView} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto bg-slate-50/50 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </ToastProvider>
    </AppContext.Provider>
  );
};

export default App;
