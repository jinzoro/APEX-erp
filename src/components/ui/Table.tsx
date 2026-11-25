import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode;
}

export const Table: React.FC<TableProps> = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="overflow-x-auto">
    <table
      ref={ref}
      className={cn('w-full text-left border-collapse', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export const TableFooter: React.FC<TableFooterProps> = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-b-0', className)}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableHeaderCellElement> {
  children?: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = React.forwardRef<HTMLTableHeaderCellElement, TableHeadProps>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100 bg-slate-50 text-left', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-4 text-sm text-slate-600', className)} {...props} />
));
TableCell.displayName = 'TableCell';
