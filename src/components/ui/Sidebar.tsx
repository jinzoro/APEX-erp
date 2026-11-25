import { cn } from '@/lib/cn';
import { AppView } from '@/lib/types';
import { Icons } from '@/lib/constants';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
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

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4">
      <div className="flex items-center justify-center h-16 border-b border-slate-200 mb-4">
        <span className="text-xl font-bold text-brand-600">APEX ERP</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              currentView === item.view
                ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-200">
        <button
          onClick={() => onViewChange(AppView.SETTINGS)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentView === AppView.SETTINGS
              ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          )}
        >
          <Icons.Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
