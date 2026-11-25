import React, { useState, useEffect, useContext } from 'react';
import { Employee } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { computePayslip } from '@/lib/payroll';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { PageHeader } from '@/components/ui/PageHeader';

interface RateMap {
  [k: string]: number;
}

const Payroll: React.FC = () => {
  const { currency: baseCurrency } = useContext(AppContext);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rates, setRates] = useState<RateMap>({});
  const [selected, setSelected] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const emps = await backendService.getEmployees();
    setEmployees(emps as Employee[]);
    const r = await backendService.getCollection('payrollRates' as any);
    const map: RateMap = {};
    for (const x of r as any[]) map[x.key] = x.value;
    setRates(map);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const g = (k: string, d: number) => rates[k] ?? d;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll & Payslips"
        description="Moroccan payroll computation and employee payslip generation"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Gross Salary</TableHead>
              <TableHead>CNSS</TableHead>
              <TableHead>AMO</TableHead>
              <TableHead>IR</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading payroll...
                </TableCell>
              </TableRow>
            ) : (
              employees
                .filter((e) => e.status === 'ACTIVE')
                .map((e) => {
                  const gross = e.grossSalary || e.salary || 0;
                  const ps = computePayslip(
                    gross,
                    g('CNSS_EMPLOYEE', 4.48),
                    g('AMO_EMPLOYEE', 2.26),
                    g('IR_PROFESSIONAL_EXPENSE_DEDUCTION', 20),
                    g('CNSS_EMPLOYER', 8.98),
                    g('AMO_EMPLOYER', 4.11),
                    e.dependents || 0,
                    g('FAMILY_DEDUCTION_PER_DEPENDENT', 500) / 12
                  );
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {e.firstName} {e.lastName}
                      </TableCell>
                      <TableCell>{currencyService.format(ps.gross, baseCurrency)}</TableCell>
                      <TableCell>{currencyService.format(ps.cnssEmployee, baseCurrency)}</TableCell>
                      <TableCell>{currencyService.format(ps.amoEmployee, baseCurrency)}</TableCell>
                      <TableCell>{currencyService.format(ps.ir, baseCurrency)}</TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {currencyService.format(ps.net, baseCurrency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelected(e)}>
                          View Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </Card>

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Bulletin de Paie"
          description={`${selected.firstName} ${selected.lastName} — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
          size="md"
        >
          <div className="space-y-3 py-2 text-sm">
            {(() => {
              const gross = selected.grossSalary || selected.salary || 0;
              const ps = computePayslip(
                gross,
                g('CNSS_EMPLOYEE', 4.48),
                g('AMO_EMPLOYEE', 2.26),
                g('IR_PROFESSIONAL_EXPENSE_DEDUCTION', 20),
                g('CNSS_EMPLOYER', 8.98),
                g('AMO_EMPLOYER', 4.11),
                selected.dependents || 0,
                g('FAMILY_DEDUCTION_PER_DEPENDENT', 500) / 12
              );
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
                <div key={String(label)} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span
                    className={`font-semibold ${
                      label === 'NET À PAYER' ? 'text-emerald-600 font-bold text-base' : 'text-slate-900'
                    }`}
                  >
                    {currencyService.format(Number(val), baseCurrency)}
                  </span>
                </div>
              ));
            })()}
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>Print Payslip</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Payroll;
