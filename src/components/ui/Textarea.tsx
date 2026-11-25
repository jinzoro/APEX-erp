import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:pointer-events-none resize-none',
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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps & VariantProps<typeof textareaVariants>) {
  return (
    <textarea className={cn(textareaVariants({ size: 'default' }), className)} {...props} />
  );
}
