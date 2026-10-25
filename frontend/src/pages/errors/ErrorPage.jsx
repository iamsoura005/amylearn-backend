import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

const TONES = {
  blue: 'from-[#0A1F44] via-[#1E63D6] to-[#4DA3FF]',
  indigo: 'from-[#1e1b4b] via-[#4338ca] to-[#8b5cf6]',
  teal: 'from-[#042f2e] via-[#0f766e] to-[#2dd4bf]',
  amber: 'from-[#451a03] via-[#b45309] to-[#fbbf24]',
  rose: 'from-[#4c0519] via-[#be123c] to-[#fb7185]'
};

export const ErrorPage = ({
  code = '404',
  eyebrow = 'Something is off',
  title = 'We could not find that page',
  description = 'The link may be outdated, or the page may have moved. Try one of the routes below.',
  icon: Icon,
  tone = 'blue',
  primary = { label: 'Back to home', to: '/' },
  secondary = { label: 'Find your campus', to: '/select-college' },
  children
}) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F7F9FD]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="landing-grid absolute inset-0 opacity-60" />
    </div>

    <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
      <Link to="/">
        <AmyLearnLogo size={34} />
      </Link>
      <Link
        to="/select-college"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
      >
        Campus directory
      </Link>
    </header>

    <main className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-bento-lg backdrop-blur-xl"
      >
        <div className={`relative flex items-center gap-4 bg-gradient-to-br ${TONES[tone] || TONES.blue} px-6 py-7 sm:px-8`}>
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
            {Icon ? <Icon size={26} /> : <span className="font-jost text-xl font-semibold">{code}</span>}
          </div>
          <div className="relative min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{eyebrow}</p>
            <p className="mt-0.5 font-jost text-3xl font-semibold text-white">{code}</p>
          </div>
          <span className="relative ml-auto hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white/70 sm:block">
            AmyLearn
          </span>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-deepNavy font-jost sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-slate-500">{description}</p>

          {children ? <div className="mt-5">{children}</div> : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {primary ? (
              <Link
                to={primary.to || '#'}
                onClick={primary.onClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2.5 text-[11px] font-bold font-jost text-white transition-colors hover:bg-brand-700"
              >
                {primary.icon === 'back' ? <ArrowLeft size={13} /> : <Home size={13} />}
                {primary.label}
              </Link>
            ) : null}
            {secondary ? (
              <Link
                to={secondary.to || '#'}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold font-jost text-slate-600 transition-colors hover:bg-slate-50"
              >
                {secondary.label} <ArrowRight size={13} />
              </Link>
            ) : null}
          </div>

          <p className="mt-6 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
            Still stuck? Write to{' '}
            <a href="mailto:support@amylearn.app" className="font-semibold text-slate-500 underline underline-offset-2">
              support@amylearn.app
            </a>{' '}
            with the page address.
          </p>
        </div>
      </motion.div>
    </main>
  </div>
);

export default ErrorPage;
