import React, { useState, useEffect, useContext, useRef } from 'react';
import { DashboardStats, AppView, TimeRange } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
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
  }, [selectedRange]);

  useEffect(() => {
    if (!canvasRef.current || !stats) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.salesHistory.map((h) => h.label),
        datasets: [
          {
            label: 'Revenue',
            data: stats.salesHistory.map((h) => h.amount),
            borderColor: '#2563eb',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#2563eb',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 6,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' },
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 11 }, color: '#64748b' },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [stats]);

  const fmt = (val: number) => currencyService.format(val, currency);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: t.revenue, value: fmt(stats.revenue), icon: Icons.ShoppingCart, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: t.payroll, value: fmt(stats.payrollMonthly), icon: Icons.UsersRound, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: t.inv_val, value: fmt(stats.inventoryValue), icon: Icons.Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.fixed_assets, value: fmt(stats.assetValue), icon: Icons.CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.dashboard}
        description={t.business_control}
        actions={
          <Button variant="outline" size="sm" onClick={() => onViewChange(AppView.SALES)}>
            <Icons.ShoppingCart className="w-4 h-4 mr-2" />
            {t.create_order}
          </Button>
        }
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts & Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Sales Performance</CardTitle>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
              {(['1D', '7D', '1M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    selectedRange === range
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <canvas ref={canvasRef} />
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Profit & Top Products */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-slate-800">
            <CardContent className="p-6">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                {t.profit}
              </span>
              <div className="mt-2 text-3xl font-bold text-emerald-400">
                {fmt(stats.profit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{t.asset_status}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {stats.topProducts.map((p, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.sales} in stock</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {fmt(p.price)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
