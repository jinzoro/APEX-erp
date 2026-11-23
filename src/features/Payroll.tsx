import React, { useState, useEffect, useContext } from 'react';
import { Employee } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { computePayslip } from '@/lib/payroll';
import { AppContext } from '@/lib/context';

interface RateMap { [k: string]: number; }

const Payroll: React.FC = () => {
  const { currency: baseCurrency } = useContext(AppContext);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rates, setRates] = useState<RateMap>({});
  const [selected, setSelected] = useState<Employee | null>(null);

  const fetch = async () => {
    const emps = await backendService.getEmployees();
    setEmployees(emps as Employee[]);
    const r = await backendService.getCollection('payrollRates' as any);
    const map: RateMap = {};
    for (const x of (r as any[])) map[x.key] = x.value;
    setRates(map);
  };
  useEffect(() => { fetch(); }, []);

  const g = (k: string, d: number) => rates[k] ?? d;

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Paie (Payroll)</h2>
        <p className="text-slate-500 font-medium">Bulletins de paie — taux TO VERIFY</p>
      </header>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employé</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brut</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CNSS</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">AMO</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">IR</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.filter(e => e.status === 'ACTIVE').map(e => {
                const gross = e.grossSalary || e.salary || 0;
                const ps = computePayslip(
                  gross,
                  g('CNSS_EMPLOYEE', 4.48),
                  g('AMO_EMPLOYEE', 2.26),
                  g('IR_PROFESSIONAL_EXPENSE_DEDUCTION', 20),
                  g('CNSS_EMPLOYER', 8.98),
                  g('AMO_EMPLOYER', 4.11),
                  e.dependents || 0,
                  g('FAMILY_DEDUCTION_PER_DEPENDENT', 500) / 12,
                );
                return (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-slate-800">{e.firstName} {e.lastName}</td>
                    <td className="px-8 py-6">{currencyService.format(ps.gross, baseCurrency)}</td>
                    <td className="px-8 py-6">{currencyService.format(ps.cnssEmployee, baseCurrency)}</td>
                    <td className="px-8 py-6">{currencyService.format(ps.amoEmployee, baseCurrency)}</td>
                    <td className="px-8 py-6">{currencyService.format(ps.ir, baseCurrency)}</td>
                    <td className="px-8 py-6 font-black text-slate-900">{currencyService.format(ps.net, baseCurrency)}</td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setSelected(e)} className="px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black">Bulletin</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-900 p-10 text-white">
                 <h3 className="text-3xl font-black tracking-tight">Bulletin de paie</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{selected.firstName} {selected.lastName} — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="p-10 space-y-2 text-sm">
                {(() => {
                  const gross = selected.grossSalary || selected.salary || 0;
                  const ps = computePayslip(gross, g('CNSS_EMPLOYEE',4.48), g('AMO_EMPLOYEE',2.26), g('IR_PROFESSIONAL_EXPENSE_DEDUCTION',20), g('CNSS_EMPLOYER',8.98), g('AMO_EMPLOYER',4.11), selected.dependents||0, g('FAMILY_DEDUCTION_PER_DEPENDENT',500)/12);
                  const rows = [
                    ['Salaire brut', ps.gross],
                    ['CNSS salarié', -ps.cnssEmployee],
                    ['AMO salarié', -ps.amoEmployee],
                    ['Frais professionnels', -ps.professionalExpense],
                    ['Revenu imposable (mensuel)', ps.taxableMonthly],
                    ['IR', -ps.ir],
                    ['NET À PAYER', ps.net],
                  ];
                  return rows.map(([label, val]) => (
                    <div key={String(label)} className="flex justify-between border-b border-slate-50 py-2">
                      <span className="font-bold text-slate-700">{label}</span>
                      <span className={`font-black ${label==='NET À PAYER'?'text-emerald-600':''}`}>{currencyService.format(Number(val), baseCurrency)}</span>
                    </div>
                  ));
                })()}
                <div className="flex gap-6 pt-6">
                  <button onClick={() => setSelected(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Fermer</button>
                  <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Imprimer</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
