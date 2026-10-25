import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, WifiOff, X, XCircle } from 'lucide-react';

const ErrorPopupContext = createContext(null);

const TONE = {
  success: { icon: CheckCircle2, accent: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700', title: 'All set' },
  error: { icon: XCircle, accent: 'bg-red-500', soft: 'bg-red-50 text-red-700', title: 'Something went wrong' },
  warning: { icon: AlertTriangle, accent: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700', title: 'Heads up' },
  info: { icon: Info, accent: 'bg-sky-500', soft: 'bg-sky-50 text-sky-700', title: 'Good to know' },
  network: { icon: WifiOff, accent: 'bg-slate-500', soft: 'bg-slate-100 text-slate-700', title: 'Connection issue' }
};

export const ErrorPopupProvider = ({ children }) => {
  const [popups, setPopups] = useState([]);
  const counter = useRef(0);

  const close = useCallback((id) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  const triggerPopup = useCallback(
    (message, type = 'error', ms = 4200) => {
      const id = ++counter.current;
      setPopups((prev) => [...prev.slice(-2), { id, message, type, ms }]);
      window.setTimeout(() => close(id), ms);
      return id;
    },
    [close]
  );

  const api = useMemo(() => ({ triggerPopup, close }), [triggerPopup, close]);

  return (
    <ErrorPopupContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[130] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 flex-col items-center gap-2 safe-bottom">
        <AnimatePresence>
          {popups.map((popup) => {
            const tone = TONE[popup.type] || TONE.error;
            const Icon = tone.icon;
            return (
              <motion.div
                key={popup.id}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.24 }}
                className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-bento-lg"
                role="alert"
              >
                <div className="flex items-start gap-3 p-4 pb-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${tone.soft}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{tone.title}</p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-deepNavy">{popup.message}</p>
                  </div>
                  <button
                    onClick={() => close(popup.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: (popup.ms || 4200) / 1000, ease: 'linear' }}
                  className={`h-1 ${tone.accent}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ErrorPopupContext.Provider>
  );
};

export const useErrorPopup = () => {
  const ctx = useContext(ErrorPopupContext);
  if (!ctx) throw new Error('useErrorPopup must be used inside ErrorPopupProvider');
  return ctx;
};

export default ErrorPopupContext;
