
import React, { useState, useEffect } from 'react';
import { AppView, Language, CurrencyCode } from './types';
import { backendService } from './services/backendSimulator';
import { currencyService } from './services/currencyService';
import { translations } from './translations';
import { AppContext } from './context';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Inventory from './views/Inventory';
import Suppliers from './views/Suppliers';
import HR from './views/HR';
import Sales from './views/Sales';
import Customers from './views/Customers';
import Finance from './views/Finance';
import Settings from './views/Settings';
import AuditLogView from './views/AuditLogView';
import { motion, AnimatePresence } from 'framer-motion';

const ViewRenderer: React.FC<{ 
  view: AppView; 
  lang: Language; 
  setLang: (l: Language) => void; 
  currency: CurrencyCode; 
  setCurrency: (c: CurrencyCode) => void;
  onViewChange: (v: AppView) => void;
}> = ({ view, lang, setLang, currency, setCurrency, onViewChange }) => {
  switch (view) {
    case AppView.DASHBOARD: return <Dashboard onViewChange={onViewChange} />;
    case AppView.INVENTORY: return <Inventory />;
    case AppView.SUPPLIERS: return <Suppliers />;
    case AppView.HR: return <HR />;
    case AppView.SALES: return <Sales />;
    case AppView.CUSTOMERS: return <Customers />;
    case AppView.FINANCE: return <Finance />;
    case AppView.AUDIT_LOG: return <AuditLogView />;
    case AppView.SETTINGS: return (
      <Settings 
        lang={lang} setLang={setLang} 
        currency={currency} setCurrency={setCurrency} 
        onViewChange={onViewChange}
      />
    );
    default: return <Dashboard onViewChange={onViewChange} />;
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('APEX_LANG') as Language) || 'EN');
  const [currency, setCurrency] = useState<CurrencyCode>(() => (localStorage.getItem('APEX_CURR') as CurrencyCode) || 'MAD');
  const [rates, setRates] = useState<Record<string, number>>({ MAD: 10.05, USD: 1 });

  useEffect(() => {
    const initApp = async () => {
      const liveRates = await currencyService.getRates();
      setRates(liveRates);
      setTimeout(() => setIsLoading(false), 800);
    };
    initApp();
  }, []);

  useEffect(() => {
    localStorage.setItem('APEX_LANG', lang);
    localStorage.setItem('APEX_CURR', currency);
    document.dir = lang === 'AR' ? 'rtl' : 'ltr';
  }, [lang, currency]);

  const t = translations[lang];

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full shadow-2xl shadow-blue-500/10" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
          </div>
        </motion.div>
        <p className="mt-8 text-slate-900 font-black tracking-[0.4em] text-[11px] uppercase">Apex Enterprise Engine</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ lang, currency, rates, t }}>
      <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 ${lang === 'AR' ? 'font-arabic' : ''}`}>
        <Sidebar currentView={view} onViewChange={setView} onLogout={() => window.location.reload()} />

        <main className="flex-1 relative overflow-hidden flex flex-col bg-white/40 shadow-inner">
          <header className="h-16 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-10">
            <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>Global Apex</span>
              <span className="text-slate-300">/</span>
              <motion.span key={view} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-slate-900 font-black">
                {t[view.toLowerCase() as keyof typeof t] || view}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="px-4 py-2 bg-emerald-50 rounded-full flex items-center gap-3 border border-emerald-100/50">
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
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
                initial={{ opacity: 0, scale: 0.99, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.01, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="h-full w-full"
              >
                <ViewRenderer 
                  view={view} 
                  lang={lang} 
                  setLang={setLang} 
                  currency={currency} 
                  setCurrency={setCurrency}
                  onViewChange={setView}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
