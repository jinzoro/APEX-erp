import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const inputVariants = cva(
  'block w-full px-4 py-3 rounded-lg text-slate-900 placeholder-slate-400 bg-white border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:pointer-events-none'
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, type = 'text', ...props }, ref) => {
  const hasError = !!error;
  return (
    <div className="w-full">
      <input
        type={type}
        ref={ref}
        className={cn(
          inputVariants(),
          hasError && 'border-rose-400 focus:ring-rose-500 focus:border-rose-500',
          className
        )}
        {...props}
      />
      {hasError && (
        <p className="mt-1 text-[10px] font-bold text-rose-600 uppercase tracking-tight">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input, inputVariants };
