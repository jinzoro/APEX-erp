
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Language, CurrencyCode } from '@/lib/types';
import { currencyService } from '@/services/currencyService';
import { translations } from '@/i18n/translations';
import { AppContext } from '@/lib/context';

import Sidebar from '@/components/Sidebar';
import LicenseActivation from '@/components/LicenseActivation';
import Dashboard from '@/features/Dashboard';
import Inventory from '@/features/Inventory';
import Suppliers from '@/features/Suppliers';
import HR from '@/features/HR';
import Sales from '@/features/Sales';
import Customers from '@/features/Customers';
import Finance from '@/features/Finance';
import Settings from '@/features/Settings';
import AuditLogView from '@/features/AuditLogView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(localStorage.getItem('APEX_LIC_ACTIVE') === 'true');
  const [lang, setLang] = useState<Language>((localStorage.getItem('APEX_LANG') as Language) || 'EN');
  const [currency, setCurrency] = useState<CurrencyCode>((localStorage.getItem('APEX_CURR') as CurrencyCode) || 'MAD');
  const [rates, setRates] = useState<Record<string, number>>({ MAD: 10.05, USD: 1 });

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    const init = async () => {
      const liveRates = await currencyService.getRates();
      setRates(liveRates);
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
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
          <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
          </div>
        </motion.div>
        <p className="mt-8 text-slate-900 font-black tracking-[0.4em] text-[11px] uppercase">Apex Kernel Loading</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <LicenseActivation onActivated={() => setIsAuthorized(true)} />;
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
    <AppContext.Provider value={{ lang, currency, rates, t }}>
      <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 ${lang === 'AR' ? 'font-arabic' : ''}`}>
        <Sidebar currentView={view} onViewChange={setView} />

        <main className="flex-1 relative overflow-hidden flex flex-col bg-white/40 shadow-inner">
          <header className="h-16 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-10">
            <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>Global Apex</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-black">
                {t[view.toLowerCase() as keyof typeof t] || view}
              </span>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="px-4 py-2 bg-emerald-50 rounded-full flex items-center gap-3 border border-emerald-100/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">{t.active}</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Global Base</p>
                    <p className="text-[11px] font-black text-slate-900">{currency}</p>
                  </div>
               </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'circOut' }}
                className="h-full w-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
