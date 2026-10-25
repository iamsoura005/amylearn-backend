import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

const SECTIONS = [
  {
    title: 'Explore AmyLearn',
    links: [
      { label: 'For institutions', to: '/for-institutions', meta: 'ERP · COE · LMS' },
      { label: 'For students', to: '/for-students', meta: 'Learning · AI · results' },
      { label: 'Campus portals', to: '/select-college', meta: 'Select your college' }
    ]
  },
  {
    title: 'Sign in',
    links: [
      { label: 'Student & faculty', to: '/login', meta: 'Campus portal' },
      { label: 'Campus administrator', to: '/campus-admin-login', meta: 'Institution console' },
      { label: 'AmyLearn platform team', to: '/it-login', meta: 'Operations console' }
    ]
  }
];

export const FullScreenMenu = ({ open, onClose }) => {
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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[150] overflow-y-auto bg-deepNavy"
        >
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-brandBlue/30 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-learningTeal/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-innovationViolet/20 blur-3xl" />
          </div>
          <div className="relative mx-auto flex min-h-screen max-w-container-max flex-col px-5 py-6 sm:px-8">
            <div className="flex items-center justify-between">
              <AmyLearnLogo size={38} tone="light" />
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white/80 transition-colors hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-14 grid flex-1 gap-12 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Navigate</p>
                <div className="mt-6 space-y-10">
                  {SECTIONS.map((section) => (
                    <div key={section.title}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-learningTeal">{section.title}</p>
                      <div className="mt-3 space-y-1">
                        {section.links.map((link) => (
                          <Link
                            key={link.label}
                            to={link.to}
                            onClick={onClose}
                            className="group flex items-center justify-between border-b border-white/10 py-3.5"
                          >
                            <span className="font-jost text-xl font-medium text-white/85 transition-colors group-hover:text-white">
                              {link.label}
                            </span>
                            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/55">
                              {link.meta} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Need a hand?</p>
                  <p className="mt-3 font-jost text-2xl font-medium text-white">We help campuses go live in under two weeks.</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Bring your departments, subjects and batches. AmyLearn handles the rest — from exam eligibility to
                    AI-assisted revision.
                  </p>
                  <a
                    href="mailto:support@amylearn.app"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-deepNavy"
                  >
                    Talk to the team <ArrowRight size={13} />
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-white/55">
                  <Link to="/terms" onClick={onClose} className="hover:text-white/70">Terms</Link>
                  <Link to="/privacy" onClick={onClose} className="hover:text-white/70">Privacy</Link>
                  <Link to="/404" onClick={onClose} className="hover:text-white/70">Status</Link>
                  <span>© {new Date().getFullYear()} AmyLearn</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default FullScreenMenu;
