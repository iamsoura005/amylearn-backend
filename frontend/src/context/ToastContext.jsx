import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const TONE = {
  success: { icon: CheckCircle2, ring: 'border-emerald-200', iconColor: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: XCircle, ring: 'border-red-200', iconColor: 'text-red-600', bar: 'bg-red-500' },
  warning: { icon: AlertCircle, ring: 'border-amber-200', iconColor: 'text-amber-600', bar: 'bg-amber-500' },
  info: { icon: Info, ring: 'border-sky-200', iconColor: 'text-sky-600', bar: 'bg-sky-500' }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4200) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      addToast,
      dismiss,
      success: (message, duration) => addToast(message, 'success', duration),
      error: (message, duration) => addToast(message, 'error', duration),
      warning: (message, duration) => addToast(message, 'warning', duration),
      info: (message, duration) => addToast(message, 'info', duration),
      toasts
    }),
    [addToast, dismiss, toasts]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[120] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const tone = TONE[toast.type] || TONE.info;
            const Icon = tone.icon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                transition={{ duration: 0.22 }}
                className={`pointer-events-auto overflow-hidden rounded-2xl border bg-white shadow-bento ${tone.ring}`}
                role="status"
              >
                <div className="flex items-start gap-3 p-3.5 pr-2.5">
                  <Icon size={18} className={`mt-0.5 shrink-0 ${tone.iconColor}`} />
                  <p className="flex-1 text-xs font-semibold leading-relaxed text-deepNavy">{toast.message}</p>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </div>
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: (toast.duration || 4200) / 1000, ease: 'linear' }}
                  className={`h-0.5 ${tone.bar}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export default ToastContext;
