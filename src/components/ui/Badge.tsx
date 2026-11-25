import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 border border-slate-200',
        secondary: 'bg-slate-200 text-slate-800 border border-slate-300',
        destructive: 'bg-rose-50 text-rose-700 border border-rose-100',
        outline: 'bg-transparent text-slate-900 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        info: 'bg-brand-50 text-brand-700 border border-brand-100',
      },
      size: {
        default: 'h-8 px-2.5 py-0.5',
        sm: 'h-7 px-2',
        lg: 'h-9 px-3 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}
