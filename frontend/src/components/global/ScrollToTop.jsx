import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = ({ showButton = true }) => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!showButton) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 z-[70] grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-bento transition-colors hover:text-brandBlue"
          aria-label="Back to top"
        >
          <ArrowUp size={16} />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
};

export default ScrollToTop;
