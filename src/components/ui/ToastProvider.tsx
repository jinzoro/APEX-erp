import * as React from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, close } = useToast();

  return (
    <React.Fragment>
      {children}
      <ToastContainer toasts={toasts} onClose={close} />
    </React.Fragment>
  );
}

export const useAppToast = () => {
  const { success, error, info, warning, add } = useToast();
  return { success, error, info, warning, add };
};
