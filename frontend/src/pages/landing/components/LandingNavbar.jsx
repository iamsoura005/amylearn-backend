import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

const SITE_LINKS = [
  { label: 'For institutions', to: '/for-institutions' },
  { label: 'For students', to: '/for-students' }
];

const SECTION_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' }
];

export const LandingNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="AmyLearn home">
          <AmyLearnLogo size={34} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Landing page">
          {SITE_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-deepNavy"
            >
              {link.label}
            </Link>
          ))}
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-slate-200" />
          {SECTION_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-deepNavy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/login"
            className="rounded-xl px-3.5 py-2 text-xs font-bold font-jost text-slate-600 transition-colors hover:bg-slate-100 hover:text-deepNavy"
          >
            Sign in
          </Link>
          <Link
            to="/select-college"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2 text-xs font-bold font-jost text-white shadow-[0_8px_20px_-10px_rgba(30,99,214,0.8)] transition-colors hover:bg-brand-700"
          >
            Get started <ArrowRight size={13} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-deepNavy transition-colors hover:bg-slate-200 lg:hidden"
          aria-label={open ? 'Close landing menu' : 'Open landing menu'}
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl lg:hidden"
            id="landing-mobile-nav"
          >
            <div className="mx-auto max-w-container-max px-4 py-4 sm:px-6">
              <div className="grid gap-1">
                {SITE_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </Link>
                ))}
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-xs font-bold text-deepNavy"
                >
                  Sign in
                </Link>
                <Link
                  to="/select-college"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brandBlue px-3 py-2.5 text-center text-xs font-bold text-white"
                >
                  Get started <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default LandingNavbar;
