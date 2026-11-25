import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps, cva } from 'class-variance-authority';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2 text-xs',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, type, error, ...props }: InputProps & VariantProps<typeof inputVariants>) {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          inputVariants({ size: 'default' }),
          error && 'border-rose-500 focus-visible:ring-rose-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[10px] font-bold text-rose-600 uppercase tracking-tight">{error}</p>}
    </div>
  );
}
