import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const selectVariants = cva(
  'inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
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

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps & VariantProps<typeof selectVariants>) {
  return (
    <select className={cn(selectVariants({ size: 'default' }), className)} {...props}>
      {children}
    </select>
  );
}

export const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(selectVariants({ size: 'default' }), className)}
      ref={ref}
      {...props}
    />
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('z-50 max-h-96 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-lg text-sm text-slate-900 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', className)}
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

export { selectVariants };
