import * as React from 'react';
import { Icons } from '@/lib/constants';

interface TopBarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, description, actions }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h1>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors">
          <Icons.Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>
    </header>
  );
}
