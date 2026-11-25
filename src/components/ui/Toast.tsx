import * as React from 'react';
import { cn } from '@/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-white border-slate-200 text-slate-900',
  destructive: 'bg-red-50 border-red-100 text-red-800',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  warning: 'bg-amber-50 border-amber-100 text-amber-800',
  info: 'bg-brand-50 border-brand-100 text-brand-800',
};

const ToastItem: React.FC<ToastProps> = ({
  id: _id,
  title,
  description,
  variant = 'default',
  action,
  onClose,
  duration = 5000,
}) => {
  const [visible, setVisible] = React.useState(true);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onCloseRef.current?.(), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={cn(
            'flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-sm shadow-lg ring-1',
            variantStyles[variant]
          )}
        >
          {title && <h4 className="font-semibold leading-none">{title}</h4>}
          {description && <p className="text-opacity-90 leading-relaxed">{description}</p>}
          {action && <div className="ml-auto">{action}</div>}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => onClose?.(), 200);
            }}
            className="ml-2 flex shrink-0 items-center rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-md">
          <ToastItem {...toast} onClose={() => onClose(toast.id)} />
        </div>
      ))}
    </div>
  );
}
