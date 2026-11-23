
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppView, CompanyInfo } from '@/lib/types';
import { Icons } from '@/lib/constants';
import { backendService } from '@/services/backendSimulator';
import { AppContext } from '@/lib/context';

const VIEW_COLORS: Record<AppView, string> = {
  [AppView.DASHBOARD]: 'bg-blue-600',
  [AppView.INVENTORY]: 'bg-indigo-600',
  [AppView.SUPPLIERS]: 'bg-purple-600',
  [AppView.SALES]: 'bg-emerald-600',
  [AppView.CUSTOMERS]: 'bg-cyan-600',
  [AppView.HR]: 'bg-rose-600',
  [AppView.FINANCE]: 'bg-amber-600',
  [AppView.SETTINGS]: 'bg-slate-600',
  [AppView.AUDIT_LOG]: 'bg-zinc-600',
  [AppView.CREDIT_NOTES]: 'bg-teal-600',
};

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { t, lang } = useContext(AppContext);
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      const info = await backendService.getCompanyInfo();
      setCompany(info);
    };
    loadCompany();
    const interval = setInterval(loadCompany, 3000);
    return () => clearInterval(interval);
  }, []);

  const navItems = useMemo(() => [
    { id: AppView.DASHBOARD, label: t.dashboard, icon: Icons.Dashboard },
    { id: AppView.INVENTORY, label: t.inventory, icon: Icons.Inventory },
    { id: AppView.SALES, label: t.sales, icon: Icons.Sales },
    { id: AppView.CUSTOMERS, label: t.customers, icon: Icons.Customers },
    { id: AppView.SUPPLIERS, label: t.suppliers, icon: Icons.Customers },
    { id: AppView.HR, label: t.hr, icon: Icons.HR },
    { id: AppView.FINANCE, label: t.finance, icon: Icons.Finance },
  ], [t]);

  return (
    <div className="w-72 bg-slate-900 h-screen flex flex-col border-r border-slate-800/50 shrink-0 relative transition-all duration-700 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.15)]">
      {/* Background Glow Effect - Back to View Colors */}
      <motion.div 
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.4, 1],
        }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        className={`absolute -top-40 w-[400px] h-[400px] rounded-full blur-[180px] pointer-events-none transition-colors duration-1000 ${VIEW_COLORS[currentView]}`}
      />

      {/* Header with Mastered Logo Size */}
      <div className="p-10 flex flex-col gap-6 z-10">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl transition-all duration-700 shadow-2xl overflow-hidden p-3 ${company?.logo ? 'bg-white shadow-inner' : VIEW_COLORS[currentView]}`}>
          {company?.logo ? (
            <img src={company.logo} className="w-full h-full object-contain" alt="Master Brand" />
          ) : (
            'A'
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-white font-black text-xl tracking-tighter leading-none truncate uppercase">{company?.name || 'Apex Engine'}</h1>
          <p className="text-blue-500 italic font-bold text-[9px] uppercase tracking-widest mt-2 opacity-60">Corporate Central Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-5 py-6 space-y-2 z-10 overflow-y-auto custom-scroll">
        <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Core Modules</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative ${currentView === item.id ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {currentView === item.id && (
              <motion.div 
                layoutId="nav-bg"
                className={`absolute inset-0 rounded-[1.5rem] z-0 ${VIEW_COLORS[item.id]}`} 
              />
            )}
            <span className="relative z-10 scale-110 opacity-70 group-hover:opacity-100"><item.icon /></span>
            <span className={`relative z-10 font-black text-sm tracking-tight ${lang === 'AR' ? 'text-right' : ''}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Settings */}
      <div className="p-6 z-10 space-y-3 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/50">
        <button
          onClick={() => onViewChange(AppView.SETTINGS)}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${currentView === AppView.SETTINGS ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
        >
          <Icons.Settings />
          <span className="font-black text-sm uppercase tracking-widest text-[10px]">{t.settings}</span>
        </button>
        
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xl">AP</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-widest leading-none">System Root</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1 italic">V10 Enterprise</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
