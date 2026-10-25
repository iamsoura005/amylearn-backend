import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export const FAQItem = ({ faq, index, isOpen, onToggle }) => (
  <div className="border-b border-slate-200/80 last:border-b-0">
    <h3>
      <button
        type="button"
        id={`faq-question-${index}`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        onClick={onToggle}
        className="flex w-full items-start gap-3 py-4 text-left transition-colors hover:text-brandBlue sm:gap-4 sm:py-5"
      >
        <span className="mt-0.5 w-6 shrink-0 text-[10px] font-bold tabular text-slate-500">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-xs font-bold leading-6 text-deepNavy sm:text-sm">{faq.question}</span>
        <span
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg transition-colors ${
            isOpen ? 'bg-brandBlue text-white' : 'bg-slate-100 text-slate-500'
          }`}
          aria-hidden="true"
        >
          {isOpen ? <Minus size={12} /> : <Plus size={12} />}
        </span>
      </button>
    </h3>
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          id={`faq-answer-${index}`}
          role="region"
          aria-labelledby={`faq-question-${index}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-5 pl-9 pr-9 text-[11px] leading-6 text-slate-500 sm:text-xs sm:leading-7">{faq.answer}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </div>
);

export default FAQItem;
