
import React, { useEffect, useState, useContext } from 'react';
import { DashboardStats, AppView, TimeRange } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { AppContext } from '../context';
import { Icons } from '../constants';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { t, currency, rates } = useContext(AppContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');

  useEffect(() => {
    const loadStats = async () => {
      const data = await backendService.getDashboardStats(selectedRange);
      setStats(data);
      setLoading(false);
    };
    loadStats();
    // Poll for updates every 10 seconds (increased to reduce overhead while switching ranges)
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, [selectedRange]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Synchronizing Core...</p>
      </div>
    );
  }

  const fmt = (val: number) => currencyService.format(val, currency);

  const forexPairs = [
    { label: 'EUR / MAD', rate: (rates['MAD'] / rates['EUR']).toFixed(4) },
    { label: 'USD / MAD', rate: (rates['MAD'] / rates['USD']).toFixed(4) },
    { label: 'GBP / MAD', rate: (rates['MAD'] / rates['GBP']).toFixed(4) },
  ];

  const cards = [
    { label: t.revenue, value: fmt(stats.revenue), icon: Icons.Sales, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-50 to-white' },
    { label: t.payroll, value: fmt(stats.payrollMonthly), icon: Icons.HR, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-50 to-white' },
    { label: t.inv_val, value: fmt(stats.inventoryValue), icon: Icons.Inventory, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-50 to-white' },
    { label: t.fixed_assets, value: fmt(stats.assetValue), icon: Icons.Assets, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-50 to-white' },
  ];

  const rangeButtons: { label: string, value: TimeRange }[] = [
    { label: '1D', value: '1D' },
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '1Y', value: '1Y' },
    { label: 'All', value: 'ALL' },
  ];

  return (
    <div className="p-10 h-full overflow-y-auto bg-white/30 backdrop-blur-3xl custom-scroll">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{t.dashboard}</h2>
          <div className="flex items-center gap-3 mt-3">
             <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.business_control}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-[2rem] border border-slate-800 shadow-2xl flex items-center gap-8 group">
           <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-500 uppercase">{t.currency_monitor}</span>
           </div>
           {forexPairs.map((pair, i) => (
             <div key={i} className="flex flex-col border-l border-slate-800 pl-8">
                <span className="text-[8px] font-black text-slate-500 uppercase">{pair.label}</span>
                <span className="text-sm font-mono font-black text-blue-400">{pair.rate}</span>
             </div>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${card.gradient} p-8 rounded-[3.5rem] border border-slate-200 shadow-sm transition-all group overflow-hidden`}
          >
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color} w-fit mb-8 shadow-inner`}><card.icon /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sales Performance</h3>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-5 py-2 rounded-full uppercase tracking-widest mt-2 inline-block">Real-time Node: {selectedRange}</span>
              </div>
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
                {rangeButtons.map((btn) => (
                  <button 
                    key={btn.value}
                    onClick={() => setSelectedRange(btn.value)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedRange === btn.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesHistory}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      hide={true} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                        fontWeight: 900,
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [fmt(value), 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#2563eb" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.recent_activity}</h3>
              <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-5 py-2 rounded-full uppercase tracking-widest">{t.operational_log}</span>
            </div>
            <div className="space-y-6">
               {stats.recentActivities.length === 0 ? (
                  <p className="py-10 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No Recent Interactions</p>
               ) : stats.recentActivities.map((act, i) => (
                 <div key={act.id} className="flex items-center justify-between p-7 bg-slate-50/50 hover:bg-slate-50 rounded-[2.5rem] border border-slate-100 group transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${act.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                         {act.type === 'INCOME' ? <Icons.Sales /> : <Icons.Inventory />}
                      </div>
                      <div>
                         <p className="text-base font-black text-slate-900">{act.description}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(act.date).toLocaleDateString()} • {act.category}</p>
                      </div>
                    </div>
                    <p className={`text-base font-black ${act.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>{act.type === 'INCOME' ? '+' : '-'}{fmt(act.amount)}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
           <div className="bg-slate-900 p-12 rounded-[4.5rem] text-white shadow-2xl overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight mb-4">{t.profit}</h3>
              <p className="text-6xl font-black tracking-tighter text-blue-400">{fmt(stats.profit)}</p>
            </div>
            <div className="p-10 bg-slate-800/80 rounded-[3rem] mt-14 relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{t.target_velocity}</span>
                  <span className="text-3xl font-black">{stats.orderCount}</span>
               </div>
               <div className="h-2.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, stats.orderCount * 5)}%` }}
                    className="h-full bg-blue-500" 
                  />
               </div>
            </div>
          </div>
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 mb-10">{t.asset_status}</h3>
             <div className="space-y-8">
                {stats.topProducts.length === 0 ? (
                  <p className="text-center text-slate-300 font-black uppercase text-[10px]">Vault Empty</p>
                ) : stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div>
                        <p className="text-sm font-black text-slate-900">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.sales} {t.stock}</p>
                     </div>
                     <span className="text-[13px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{fmt(p.price)}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
