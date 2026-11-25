import * as React from 'react';
import { cn } from '@/lib/cn';
import { cva, VariantProps } from 'class-variance-authority';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 text-brand-600 bg-white focus:ring-1 focus:ring-brand-500 focus:ring-offset-0 data-[state=checked]:bg-brand-600 data-[state=unchecked]:bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:pointer-events-none'
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox({ className, ...props }: CheckboxProps & VariantProps<typeof checkboxVariants>) {
  return (
    <input
      type="checkbox"
      className={cn(checkboxVariants(), className)}
      {...props}
    />
  );
}
