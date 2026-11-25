import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const checkboxVariants = cva('peer line-break:normal data-[state=checked]:bg-brand-600 data-[state=unchecked]:bg-white');

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox({ className, ...props }: CheckboxProps & VariantProps<typeof checkboxVariants>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'rounded-sm border-slate-200 text-brand-600 focus:ring-1 focus:ring-brand-900 focus:ring-offset-0',
        checkboxVariants(),
        className
      )}
      {...props}
    />
  );
}
