// Payroll computation helpers.
// Rates and brackets are TO VERIFY against CNSS/DGI official sources.
// Brackets below are annual (scaled to monthly in compute).

export interface Payslip {
  gross: number;
  cnssEmployee: number;
  amoEmployee: number;
  professionalExpense: number;
  taxableMonthly: number;
  ir: number;
  familyDeduction: number;
  net: number;
  cnssEmployer: number;
  amoEmployer: number;
}

// Annual IR brackets (MAD) — TO VERIFY with DGI barème IR.
const IR_BRACKETS = [
  { upTo: 30000, rate: 0 },
  { upTo: 50000, rate: 0.10 },
  { upTo: 60000, rate: 0.20 },
  { upTo: 80000, rate: 0.30 },
  { upTo: 100000, rate: 0.34 },
  { upTo: Infinity, rate: 0.38 },
];

function annualIr(annualTaxable: number): number {
  let tax = 0;
  let prev = 0;
  for (const b of IR_BRACKETS) {
    const upper = Math.min(annualTaxable, b.upTo);
    if (upper > prev) {
      tax += (upper - prev) * b.rate;
    }
    prev = b.upTo;
    if (annualTaxable <= b.upTo) break;
  }
  return tax;
}

export function computePayslip(
  grossMonthly: number,
  cnssEmployeeRate: number, // percent
  amoEmployeeRate: number, // percent
  professionalExpenseRate: number, // percent
  cnssEmployerRate: number,
  amoEmployerRate: number,
  dependents: number,
  familyDeductionPerDependentMonthly: number,
): Payslip {
  const cnssEmployee = round2(grossMonthly * cnssEmployeeRate / 100);
  const amoEmployee = round2(grossMonthly * amoEmployeeRate / 100);
  const professionalExpense = round2(grossMonthly * professionalExpenseRate / 100);
  const taxableMonthly = Math.max(0, grossMonthly - cnssEmployee - amoEmployee - professionalExpense);
  const annualTaxable = taxableMonthly * 12;
  const annualTax = annualIr(annualTaxable);
  const monthlyTax = annualTax / 12;
  const familyDeduction = round2(dependents * familyDeductionPerDependentMonthly);
  const ir = Math.max(0, round2(monthlyTax - familyDeduction));
  const net = round2(grossMonthly - cnssEmployee - amoEmployee - ir);
  const cnssEmployer = round2(grossMonthly * cnssEmployerRate / 100);
  const amoEmployer = round2(grossMonthly * amoEmployerRate / 100);
  return { gross: grossMonthly, cnssEmployee, amoEmployee, professionalExpense, taxableMonthly, ir, familyDeduction, net, cnssEmployer, amoEmployer };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
