
import React, { useContext, useEffect, useState } from 'react';
import { AppView, CompanyInfo } from '../types';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { backendService } from '../services/backendSimulator';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
}

const VIEW_COLORS: Record<AppView, string> = {
  [AppView.DASHBOARD]: 'bg-blue-600 shadow-blue-500/40',
  [AppView.INVENTORY]: 'bg-indigo-600 shadow-indigo-500/40',
  [AppView.SUPPLIERS]: 'bg-purple-600 shadow-purple-500/40',
  [AppView.SALES]: 'bg-emerald-600 shadow-emerald-500/40',
  [AppView.CUSTOMERS]: 'bg-cyan-600 shadow-cyan-500/40',
  [AppView.HR]: 'bg-rose-600 shadow-rose-500/40',
  [AppView.FINANCE]: 'bg-amber-600 shadow-amber-500/40',
  [AppView.SETTINGS]: 'bg-slate-600 shadow-slate-500/40',
  [AppView.AUDIT_LOG]: 'bg-zinc-600 shadow-zinc-500/40',
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
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

  const navItems = [
    { id: AppView.DASHBOARD, label: t.dashboard, icon: Icons.Dashboard },
    { id: AppView.INVENTORY, label: t.inventory, icon: Icons.Inventory },
    { id: AppView.SUPPLIERS, label: t.suppliers, icon: Icons.Customers },
    { id: AppView.SALES, label: t.sales, icon: Icons.Sales },
    { id: AppView.CUSTOMERS, label: t.customers, icon: Icons.Customers },
    { id: AppView.HR, label: t.hr, icon: Icons.HR },
    { id: AppView.FINANCE, label: t.finance, icon: Icons.Finance },
  ];

  return (
    <div className="w-72 bg-slate-900 h-screen flex flex-col border-r border-slate-800/50 shrink-0 relative transition-all duration-700 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.1)]">
      <motion.div 
        key={currentView}
        animate={{ 
          opacity: [0.2, 0.5, 0.2], 
          scale: [1, 1.8, 1],
          x: lang === 'AR' ? [120, 60, 120] : [-120, -60, -120]
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className={`absolute -top-40 w-[400px] h-[400px] rounded-full blur-[180px] pointer-events-none transition-colors duration-1000 ${VIEW_COLORS[currentView].split(' ')[0]}`}
      />

      <div className="p-10 flex items-center gap-4 z-10">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl transition-all duration-700 shadow-2xl overflow-hidden p-1.5 ${company?.logo ? 'bg-white/95' : VIEW_COLORS[currentView]}`}
        >
          {company?.logo ? (
            <img src={company.logo} className="w-full h-full object-contain" alt="Logo" />
          ) : (
            'A'
          )}
        </motion.div>
        <div className="min-w-0">
          <h1 className="text-white font-black text-xl tracking-tighter leading-none truncate">{company?.name || 'Apex'}</h1>
          <p className="text-blue-500 italic font-bold text-[9px] uppercase tracking-widest mt-1">Enterprise Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-5 py-6 space-y-2 z-10 overflow-y-auto custom-scroll">
        <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Master Systems</p>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-pill"
                  className={`absolute inset-0 rounded-[1.5rem] z-0 ${VIEW_COLORS[item.id]}`}
                />
              )}
              <span className="relative z-10 scale-110"><item.icon /></span>
              <span className={`relative z-10 font-black text-sm tracking-tight ${lang === 'AR' ? 'text-right' : ''}`}>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-dot"
                  className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full z-10 shadow-lg"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 z-10 space-y-3 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/50">
        <button
          onClick={() => onViewChange(AppView.SETTINGS)}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
            currentView === AppView.SETTINGS ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Icons.Settings />
          <span className="font-black text-sm uppercase tracking-tighter">{t.settings}</span>
        </button>
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xl">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-white truncate uppercase tracking-widest leading-none">{t.admin}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1 italic">Full Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
