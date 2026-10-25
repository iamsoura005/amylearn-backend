import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AiSurface } from '@/components/ai/AiSurface';

export const AiDrawer = ({ open, onClose, userName, classroomName }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-end bg-deepNavy/35 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="h-full w-full max-w-[430px] bg-white p-3 shadow-2xl"
          >
            <AiSurface
              compact
              onClose={onClose}
              userName={userName}
              classroomName={classroomName}
              className="!rounded-2xl"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AiDrawer;
