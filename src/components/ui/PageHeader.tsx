import * as React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-slate-500 mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
