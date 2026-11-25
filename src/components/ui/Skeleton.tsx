import * as React from 'react';
import { cn } from '@/lib/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 space-y-2 rounded-lg bg-slate-200 px-4 py-3 animate-pulse',
        className
      )}
      {...props}
    />
  );
}

export interface SkeletonCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: string;
}

export function SkeletonCircle({ className, size = 'w-8 h-8', ...props }: SkeletonCircleProps) {
  return (
    <div
      className={cn(size, 'rounded-full bg-slate-200 animate-pulse', className)}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  lines?: number;
}

export function SkeletonText({ className, lines = 3, ...props }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-slate-200 animate-pulse',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}
