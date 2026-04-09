'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({ confirm: () => Promise.resolve(false) });

export function useConfirm() {
  return useContext(ConfirmContext).confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    opts: ConfirmOptions;
    resolve: (v: boolean) => void;
  }>({ open: false, opts: { message: '' }, resolve: () => {} });

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, opts, resolve });
    });
  }, []);

  function handleClose(result: boolean) {
    state.resolve(result);
    setState((s) => ({ ...s, open: false }));
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => handleClose(false)}
          />
          {/* Modal */}
          <div className="relative bg-[var(--bg-card)] border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${state.opts.danger !== false ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                <AlertTriangle className={`w-5 h-5 ${state.opts.danger !== false ? 'text-status-failed' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  {state.opts.title || 'Confirmar'}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {state.opts.message}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-colors"
              >
                {state.opts.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  state.opts.danger !== false
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {state.opts.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
