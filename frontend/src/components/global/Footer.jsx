import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'For institutions', to: '/for-institutions' },
      { label: 'For students', to: '/for-students' },
      { label: 'Campus portals', to: '/select-college' },
      { label: 'Platform sign in', to: '/it-login' }
    ]
  },
  {
    title: 'Modules',
    links: [
      { label: 'Examinations (COE)', to: '/for-institutions#coe' },
      { label: 'Learning (LMS)', to: '/for-institutions#lms' },
      { label: 'Library circulation', to: '/for-institutions#library' },
      { label: 'AI study companion', to: '/for-students#ai' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'Terms of service', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Support', to: 'mailto:support@amylearn.app' },
      { label: 'System status', to: '/it-login' }
    ]
  }
];

export const Footer = ({ tone = 'light' }) => {
  const dark = tone === 'dark';
  return (
    <footer className={`${dark ? 'bg-deepNavy text-white' : 'border-t border-slate-200/70 bg-white text-deepNavy'}`}>
      <div className="mx-auto max-w-container-max px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <AmyLearnLogo size={38} tone={dark ? 'light' : 'dark'} showTagline />
            <p className={`mt-4 max-w-sm text-xs leading-relaxed ${dark ? 'text-white/55' : 'text-slate-500'}`}>
              AmyLearn brings admissions, examinations, learning resources, library circulation and AI tutoring into one
              calm, connected campus workspace.
            </p>
            <a
              href="mailto:support@amylearn.app"
              className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold ${
                dark ? 'border-white/15 text-white/75 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Mail size={13} /> support@amylearn.app
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${dark ? 'text-white/55' : 'text-slate-500'}`}>
                  {column.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) =>
                    link.to.startsWith('mailto') ? (
                      <li key={link.label}>
                        <a
                          href={link.to}
                          className={`text-[11px] font-semibold transition-colors ${
                            dark ? 'text-white/65 hover:text-white' : 'text-slate-600 hover:text-deepNavy'
                          }`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                            dark ? 'text-white/65 hover:text-white' : 'text-slate-600 hover:text-deepNavy'
                          }`}
                        >
                          {link.label}
                          {link.label.includes('sign in') ? <ArrowUpRight size={10} /> : null}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mt-10 flex flex-col gap-2 border-t pt-5 text-[10px] sm:flex-row sm:items-center sm:justify-between ${
            dark ? 'border-white/10 text-white/55' : 'border-slate-100 text-slate-500'
          }`}
        >
          <p>© {new Date().getFullYear()} AmyLearn. Built for modern higher education.</p>
          <p className="flex items-center gap-3">
            <span>Made for campuses in India</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
            <span>v1.0</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
