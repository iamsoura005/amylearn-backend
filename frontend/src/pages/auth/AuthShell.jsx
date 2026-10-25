import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

const TONES = {
  indigo: {
    panel: 'from-[#1b1450] via-[#312e81] to-[#4f46e5]',
    glowA: 'bg-indigo-400/30',
    glowB: 'bg-violet-400/25',
    accent: 'text-indigo-200',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    badge: 'bg-indigo-500/20 text-indigo-100 border-indigo-300/25',
    chip: 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
  },
  teal: {
    panel: 'from-[#042f2e] via-[#115e59] to-[#0d9488]',
    glowA: 'bg-teal-300/25',
    glowB: 'bg-emerald-300/20',
    accent: 'text-teal-200',
    button: 'bg-teal-600 hover:bg-teal-700',
    badge: 'bg-teal-500/20 text-teal-100 border-teal-300/25',
    chip: 'border-teal-100 bg-teal-50 text-teal-800 hover:bg-teal-100'
  },
  blue: {
    panel: 'from-[#061a3a] via-[#0a3a80] to-[#1e63d6]',
    glowA: 'bg-sky-300/25',
    glowB: 'bg-blue-400/25',
    accent: 'text-sky-200',
    button: 'bg-brandBlue hover:bg-brand-700',
    badge: 'bg-sky-500/20 text-sky-100 border-sky-300/25',
    chip: 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100'
  }
};

export const AuthShell = ({
  tone = 'indigo',
  badge = 'Campus portal',
  title,
  subtitle,
  children,
  footer,
  demoAccounts = [],
  onDemoSelect,
  asideTitle,
  asideText,
  bullets = [],
  stats = [],
  crossLink,
  backTo = '/',
  backLabel = 'Back to AmyLearn'
}) => {
  const t = TONES[tone] || TONES.indigo;

  return (
    <div className="flex min-h-screen bg-white">
      <aside className={`relative hidden w-[46%] max-w-[640px] overflow-hidden bg-gradient-to-br ${t.panel} lg:flex lg:flex-col`}>
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -left-20 top-24 h-72 w-72 rounded-full ${t.glowA} blur-3xl`} />
          <div className={`absolute -right-10 top-1/2 h-80 w-80 rounded-full ${t.glowB} blur-3xl`} />
          <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:42px_42px]" />
        </div>
        <div className="relative flex flex-1 flex-col p-10">
          <Link to="/">
            <AmyLearnLogo size={40} tone="light" showTagline />
          </Link>
          <div className="my-auto max-w-md py-10">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${t.badge}`}>
              <Sparkles size={11} /> {badge}
            </span>
            <h2 className="mt-5 font-jost text-[38px] font-medium leading-[1.12] text-white">
              {asideTitle}
            </h2>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/60">{asideText}</p>

            {bullets.length ? (
              <ul className="mt-6 space-y-2.5">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-[11px] font-medium text-white/75">
                    <CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${t.accent}`} />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            {stats.length ? (
              <div className="mt-8 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                    <p className="font-jost text-xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/55">{stat.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/55">
            <ShieldCheck size={13} />
            <span>Encrypted sessions · tenant-isolated data · audit-friendly access</span>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col bg-[#FBFCFE]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:px-8">
          <Link to={backTo} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-deepNavy">
            <ArrowLeft size={13} /> {backLabel}
          </Link>
          <div className="lg:hidden">
            <AmyLearnLogo size={28} />
          </div>
          {crossLink ? (
            <Link to={crossLink.to} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-deepNavy">
              {crossLink.label} <ArrowRight size={12} />
            </Link>
          ) : (
            <span className="w-16" />
          )}
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden">
              <Link to="/">
                <AmyLearnLogo size={32} showTagline />
              </Link>
            </div>
            <h1 className="mt-6 text-[30px] font-extrabold leading-tight tracking-tight text-deepNavy font-jost lg:mt-0">
              {title}
            </h1>
            {subtitle ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}

            <div className="mt-6">{children}</div>

            {demoAccounts.length ? (
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Demo access</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    Works offline
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.label}
                      type="button"
                      onClick={() => onDemoSelect?.(account)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-colors ${t.chip}`}
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                  Tap a role to fill credentials. Any 2+ character identifier and 6+ character password works when the
                  API is offline.
                </p>
              </div>
            ) : null}

            {footer ? <div className="mt-6">{footer}</div> : null}

            <p className="mt-8 text-center text-[10px] leading-relaxed text-slate-500">
              By continuing you agree to the{' '}
              <Link to="/terms" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-deepNavy">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-deepNavy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export const AuthField = ({ label, icon: Icon, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
      {label}
      {hint}
    </span>
    <span className="relative block">
      {Icon ? <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> : null}
      {children}
    </span>
  </label>
);

export default AuthShell;
