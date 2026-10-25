import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/global/Footer';
import { GlassHeader } from '@/components/global/GlassHeader';
import { ScrollToTop } from '@/components/global/ScrollToTop';

const PUBLIC_LINKS = [
  { label: 'For institutions', to: '/for-institutions' },
  { label: 'For students', to: '/for-students' },
  { label: 'Platform overview', to: '/' },
  { label: 'Terms', to: '/terms' }
];

export const PublicPageShell = ({
  eyebrow = 'AmyLearn',
  title,
  description,
  breadcrumb = [],
  actions,
  children,
  contentClassName = ''
}) => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return undefined;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [hash]);

  const navActions = (
    <>
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
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bgLight">
      <GlassHeader links={PUBLIC_LINKS} actions={navActions} />

      <section className="relative overflow-hidden border-b border-slate-200/70 gradient-mesh">
        <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-learningTeal/10 blur-3xl" />

        <div className="relative mx-auto max-w-container-max px-4 pb-10 pt-7 sm:px-6 sm:pb-12 sm:pt-9 lg:px-8 lg:pb-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <li>
                <Link to="/" className="transition-colors hover:text-deepNavy">
                  Home
                </Link>
              </li>
              {breadcrumb.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                  <ChevronRight size={10} className="text-slate-300" />
                  {item.to ? (
                    <Link to={item.to} className="transition-colors hover:text-deepNavy">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500" aria-current="page">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-7 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brandBlue/15 bg-white/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-brandBlue backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-learningTeal" />
              {eyebrow}
            </span>
            <h1 className="mt-4 text-balance text-[30px] font-extrabold leading-[1.1] tracking-tight text-deepNavy sm:text-4xl lg:text-[44px]">
              {title}
            </h1>
            {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p> : null}
            {actions ? <div className="mt-6 flex flex-wrap items-center gap-2.5">{actions}</div> : null}
          </div>
        </div>
      </section>

      <main className={`mx-auto w-full max-w-container-max flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 ${contentClassName}`}>
        {children}
      </main>

      <Footer tone="dark" />
      <ScrollToTop />
    </div>
  );
};

export default PublicPageShell;
