import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg]:text-current [&>svg]:w-4 [&>svg]:h-4',
  {
    variants: {
      variant: {
        default: 'bg-slate-50 border-slate-200 text-slate-900',
        destructive: 'bg-rose-50 border-rose-100 text-rose-800',
        success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
        warning: 'bg-amber-50 border-amber-100 text-amber-800',
        info: 'bg-brand-50 border-brand-100 text-brand-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function Alert({ className, variant, title, description, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {title && <h3 className="mb-1 font-semibold">{title}</h3>}
      {description && <p className="text-opacity-90">{description}</p>}
    </div>
  );
}
