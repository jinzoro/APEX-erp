import * as React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-white border border-slate-200 rounded-xl shadow-sm', className)}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 border-b border-slate-100', className)} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props}>
    {children}
  </div>
));
CardBody.displayName = 'CardBody';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-xl font-semibold text-slate-900 tracking-tight', className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 border-t border-slate-100 flex justify-end gap-3', className)} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
