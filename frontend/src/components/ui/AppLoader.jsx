import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

export const AppLoader = ({ minDuration = 800, label = 'Preparing your AmyLearn workspace…', onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => onComplete?.(), 260);
    }, minDuration);
    return () => window.clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-bgLight"
        >
          <div className="relative">
            <span className="absolute -inset-6 rounded-full bg-brandBlue/10 blur-2xl" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <AmyLearnLogo variant="stacked" size={44} />
            </motion.div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-brandBlue to-learningTeal"
              />
            </div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500">{label}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export const PageFallback = ({ label = 'Loading module...' }) => (
  <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 bg-[#F6F8FC]">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#1E63D6]/20 border-t-[#1E63D6]" />
    <p className="text-xs font-semibold text-slate-500">{label}</p>
  </div>
);

export default AppLoader;
