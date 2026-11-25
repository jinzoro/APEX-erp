import * as React from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      {icon && <div className="mb-6 w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">{icon}</div>}
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      )}
      {description && (
        <p className="mb-6 max-w-xs text-sm text-slate-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export interface EmptyStateCardProps extends EmptyStateProps {}

export function EmptyStateCard({ title, description, action, icon, className }: EmptyStateCardProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-slate-200 bg-white shadow-sm text-center', className)}>
      {icon && <div className="mb-6 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">{icon}</div>}
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      )}
      {description && (
        <p className="mb-4 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
