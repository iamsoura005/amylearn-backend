import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

export const GlassHeader = ({
  links = [],
  transparent = false,
  actions,
  className = ''
}) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        transparent
          ? 'border-white/10 bg-deepNavy/20 backdrop-blur-xl'
          : 'border-slate-200/60 bg-white/75 backdrop-blur-xl'
      } ${className}`}
    >
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="AmyLearn home">
          <AmyLearnLogo size={34} tone={transparent ? 'light' : 'dark'} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                transparent ? 'text-white/75 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-deepNavy'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {actions || (
            <>
              <Link
                to="/login"
                className={`rounded-xl px-3.5 py-2 text-xs font-bold font-jost transition-colors ${
                  transparent ? 'text-white/85 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/select-college"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2 text-xs font-bold font-jost text-white shadow-[0_8px_20px_-10px_rgba(30,99,214,0.8)] transition-colors hover:bg-brand-700"
              >
                Get started <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className={`grid h-9 w-9 place-items-center rounded-xl lg:hidden ${
            transparent ? 'bg-white/10 text-white' : 'bg-slate-100 text-deepNavy'
          }`}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-deepNavy/45 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <AmyLearnLogo size={32} />
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-slate-200 px-3 py-2.5 text-center text-xs font-bold text-deepNavy"
                >
                  Sign in
                </Link>
                <Link
                  to="/select-college"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-brandBlue px-3 py-2.5 text-center text-xs font-bold text-white"
                >
                  Get started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default GlassHeader;
