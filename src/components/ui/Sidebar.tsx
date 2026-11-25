import { cn } from '@/lib/cn';
import { AppView } from '@/lib/types';
import { Icons } from '@/lib/constants';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const navItems = [
  { view: AppView.DASHBOARD, label: 'Dashboard', icon: Icons.LayoutDashboard },
  { view: AppView.SALES, label: 'Sales', icon: Icons.ShoppingCart },
  { view: AppView.CUSTOMERS, label: 'Customers', icon: Icons.Users },
  { view: AppView.INVENTORY, label: 'Inventory', icon: Icons.Package },
  { view: AppView.SUPPLIERS, label: 'Suppliers', icon: Icons.Truck },
  { view: AppView.DELIVERY_NOTES, label: 'Delivery Notes', icon: Icons.Truck },
  { view: AppView.HR, label: 'HR', icon: Icons.UsersRound },
  { view: AppView.PAYROLL, label: 'Payroll', icon: Icons.Wallet },
  { view: AppView.ACCOUNTING, label: 'Accounting', icon: Icons.LandPlot },
  { view: AppView.FINANCE, label: 'Finance', icon: Icons.Banknote },
  { view: AppView.AUDIT_LOG, label: 'Audit Log', icon: Icons.ListChecks },
  { view: AppView.CREDIT_NOTES, label: 'Credit Notes', icon: Icons.CreditCard },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-200 shrink-0 flex flex-col h-full">
      <div className="flex items-center justify-center h-16 border-b border-slate-200 mb-4 px-4">
        <span className="text-xl font-bold text-brand-600 tracking-tight">APEX</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              currentView === item.view
                ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm border-r border-brand-600/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => onViewChange(AppView.SETTINGS)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            currentView === AppView.SETTINGS
              ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm border-r border-brand-600/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          )}
        >
          <Icons.Settings className="h-5 w-5 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
