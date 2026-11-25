import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const tableVariants = cva('w-full text-sm caption-bottom text-slate-600', {
  variants: {
    variant: {
      default: '',
      compact: 'text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface TableProps extends React.HTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {}

export function Table({ className, variant, ...props }: TableProps) {
  return <table className={cn(tableVariants({ variant }), className)} {...props} />;
}

export function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('mb-4 text-sm font-medium leading-none text-slate-900', className)} {...props} />;
}

export function TableColgroup({ className, ...props }: React.TableHTMLAttributes<HTMLTableColElement>) {
  return <colgroup className={cn(className)} {...props} />;
}

export function TableCol({ className, ...props }: React.HTMLAttributes<HTMLTableColElement>) {
  return <col className={cn(className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn(className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn(className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-slate-50/50', className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-10 px-4 text-left align-middle font-medium text-slate-900 border-b border-slate-200', className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-4 align-middle border-b border-slate-50/50', className)} {...props} />;
}
