import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-xl ring-1 transition-all duration-200 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-50 ring-emerald-700/50 backdrop-blur-md'
              : toast.type === 'error'
              ? 'bg-rose-900/95 text-rose-50 ring-rose-700/50 backdrop-blur-md'
              : 'bg-slate-900/95 text-slate-50 ring-slate-700/50 backdrop-blur-md'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-sky-400" />}
          </div>
          <div className="flex-1 text-sm font-medium leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
