
import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { DashboardStats, AppView, TimeRange } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Props {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<Props> = ({ onViewChange }) => {
  const { t, currency } = useContext(AppContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const loadStats = async () => {
    const data = await backendService.getDashboardStats(selectedRange);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, [selectedRange]);

  useEffect(() => {
    if (!canvasRef.current || !stats) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.salesHistory.map(h => h.label),
        datasets: [{
          label: 'Revenue',
          data: stats.salesHistory.map(h => h.amount),
          borderColor: '#2563eb',
          borderWidth: 4,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: true, grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } },
          y: { display: false }
        }
      }
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [stats]);

  const fmt = (val: number) => currencyService.format(val, currency);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Kernel Refreshing...</p>
      </div>
    );
  }

  const cards = [
    { label: t.revenue, value: fmt(stats.revenue), icon: Icons.Sales, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.payroll, value: fmt(stats.payrollMonthly), icon: Icons.HR, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: t.inv_val, value: fmt(stats.inventoryValue), icon: Icons.Inventory, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.fixed_assets, value: fmt(stats.assetValue), icon: Icons.Assets, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="p-10 h-full overflow-y-auto bg-white/30 backdrop-blur-3xl custom-scroll">
      <header className="mb-12 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{t.dashboard}</h2>
          <div className="flex items-center gap-3 mt-3">
             <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.business_control}</p>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm transition-all group overflow-hidden"
          >
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color} w-fit mb-8 shadow-inner`}><card.icon /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sales Performance</h3>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
                {['1D', '7D', '1M', '1Y', 'ALL'].map((r) => (
                  <button 
                    key={r}
                    onClick={() => setSelectedRange(r as TimeRange)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedRange === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full relative">
               <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
        <div className="space-y-10">
           <div className="bg-slate-900 p-12 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-black tracking-tight mb-4">{t.profit}</h3>
            <p className="text-6xl font-black tracking-tighter text-blue-400">{fmt(stats.profit)}</p>
          </div>
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 mb-10">{t.asset_status}</h3>
             <div className="space-y-8">
                {stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
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
