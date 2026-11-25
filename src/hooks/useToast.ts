import { useCallback, useState, useMemo } from 'react';
import { ToastProps, ToastVariant } from '@/components/ui/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const add = useCallback((props: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  }, []);

  const close = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (props: Omit<ToastProps, 'id' | 'variant'>) => add({ ...props, variant: 'success' as const }),
    [add]
  );
  const error = useCallback(
    (props: Omit<ToastProps, 'id' | 'variant'>) => add({ ...props, variant: 'destructive' as const }),
    [add]
  );
  const info = useCallback(
    (props: Omit<ToastProps, 'id' | 'variant'>) => add({ ...props, variant: 'info' as const }),
    [add]
  );
  const warning = useCallback(
    (props: Omit<ToastProps, 'id' | 'variant'>) => add({ ...props, variant: 'warning' as const }),
    [add]
  );

  const clear = useCallback(() => setToasts([]), []);

  return useMemo(
    () => ({ toasts, add, close, success, error, info, warning, clear }),
    [toasts, add, close, success, error, info, warning, clear]
  );
}

export type { ToastVariant };
