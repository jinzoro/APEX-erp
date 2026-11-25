import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const selectTriggerVariants = cva(
  'inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      error: {
        true: 'border-rose-400 focus:ring-rose-500 focus:border-rose-500',
      },
      size: {
        default: 'h-10 px-4 py-3 text-sm',
        sm: 'h-9 px-3 py-2 text-xs',
        lg: 'h-11 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

const selectContentVariants = cva(
  'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-sm text-slate-900',
  {
    variants: {
      state: {
        open: 'animate-in fade-in slide-in-from-top-2',
        closed: 'animate-out fade-out zoom-out-95',
      },
    },
  }
);

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  error?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function Select({ className, error, size: selectSize = 'default', children, ...props }: SelectProps & VariantProps<typeof selectTriggerVariants>) {
  const hasError = !!error;
  return (
    <select
      className={cn(
        selectTriggerVariants({ size: selectSize }),
        hasError && 'border-rose-400 focus:ring-rose-500 focus:border-rose-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, error, size: selectSize = 'default', ...props }, ref) => {
  const hasError = !!error;
  return (
    <select
      className={cn(
        selectTriggerVariants({ size: selectSize }),
        hasError && 'border-rose-400 focus:ring-rose-500 focus:border-rose-500',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { state?: 'open' | 'closed' }>(({ className, children, state = 'open', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(selectContentVariants({ state }), className)}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, children, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-brand-100 focus:text-brand-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      data-value={value}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <span className="fill-current h-2.5 w-2.5 rounded-full" />
      </span>
      <span className="pr-8">{children}</span>
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn('-mx-1 h-px bg-slate-200', className)}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';

export const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('px-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2', className)} {...props}>
    {children}
  </div>
));
SelectGroup.displayName = 'SelectGroup';

export const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold text-slate-700', className)} {...props}>
    {children}
  </div>
));
SelectLabel.displayName = 'SelectLabel';

export const SelectScrollDownButton = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('cursor-default flex items-center justify-center px-1 text-slate-400', className)}
    {...props}
  />
));
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

export const SelectScrollUpButton = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('cursor-default flex items-center justify-center px-1 text-slate-400', className)}
    {...props}
  />
));
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

export { selectTriggerVariants, selectContentVariants };
