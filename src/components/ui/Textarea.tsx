import * as React from 'react';
import { cn } from '@/lib/cn';
import { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-transparent placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps & VariantProps<typeof textareaVariants>) {
  return (
    <textarea className={cn(textareaVariants({ size: 'default' }), className)} {...props} />
  );
}
