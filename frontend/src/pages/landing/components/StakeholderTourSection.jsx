import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, Building2, Check, GraduationCap } from 'lucide-react';
import ProductPreview from '@/pages/landing/components/ProductPreview';

const TOURS = {
  students: {
    label: 'Students',
    icon: GraduationCap,
    previewRole: 'student',
    title: 'Your academic week, without five different logins.',
    copy: 'The student workspace holds the timetable, attendance, course material, library loans, fees and exam documents in one place. The same campus code works on any modern browser.',
    bullets: [
      'Today’s sessions, room changes and attendance in one glance',
      'Lecture modules grouped by topic, with download rules set by faculty',
      'Exam forms, QR admit cards, marks and the fee ledger',
      'An AI study companion for explanations, summaries and revision sets'
    ],
    cta: { label: 'Explore the student experience', to: '/for-students' }
  },
  faculty: {
    label: 'Faculty',
    icon: BookOpen,
    previewRole: 'faculty',
    title: 'Spend less of the week reconciling, more of it teaching.',
    copy: 'Daily attendance, marks, lesson progress and departmental notices sit beside the classes they belong to. Entry is designed for the ten minutes between periods, not a weekend of catch-up.',
    bullets: [
      'Daily attendance marking with a student self-view',
      'Bulk marks upload, review and publish workflow',
      'Weekly lesson tracker and department notices',
      'AI lecture breakdown to turn a recording into a revision brief'
    ],
    cta: { label: 'See faculty workflows', to: '/for-institutions#lms' }
  },
  administrators: {
    label: 'Administrators',
    icon: Building2,
    previewRole: 'admin',
    title: 'One view of the campus, not six exported files.',
    copy: 'The campus console connects academic structure, people, examinations, fees and library operations. Feature flags let the institution decide which modules each role sees without waiting for a release.',
    bullets: [
      'Users, account creation, departments, streams and batches',
      'Exam eligibility, forms, fee ledgers and result publishing',
      'Attendance and library reports without spreadsheet stitching',
      'Tenant-scoped settings, menus and role visibility'
    ],
    cta: { label: 'Read the institution brief', to: '/for-institutions' }
  }
};

const TOUR_ORDER = ['students', 'faculty', 'administrators'];

export const StakeholderTourSection = () => {
  const [active, setActive] = useState('students');
  const tour = TOURS[active];

  return (
    <section id="tour" className="relative scroll-mt-24 overflow-hidden bg-deepNavy py-16 sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brandBlue/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-learningTeal/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.14] landing-grid" />

      <div className="relative mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-learningTeal">One campus, three working views</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              The same truth, shown to each role.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/55">
              A student, a faculty member and an administrator should not be reconciling different versions of the same
              week. AmyLearn gives each role the surface it needs, backed by one tenant-scoped record.
            </p>
          </div>
          <span className="inline-flex self-start rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/50 sm:self-auto">
            Illustrative screens
          </span>
        </div>

        <div role="tablist" aria-label="Stakeholder tours" className="mt-8 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 sm:inline-grid sm:w-auto sm:grid-cols-3">
          {TOUR_ORDER.map((key) => {
            const item = TOURS[key];
            const Icon = item.icon;
            const selected = active === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`tour-tab-${key}`}
                aria-selected={selected}
                aria-controls="tour-panel"
                onClick={() => setActive(key)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-[10px] font-bold transition-colors sm:px-4 sm:text-xs ${
                  selected ? 'bg-white text-deepNavy shadow-bento' : 'text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={13} className={selected ? 'text-brandBlue' : ''} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="tour-panel"
          aria-labelledby={`tour-tab-${active}`}
          className="mt-7 grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="min-w-0"
            >
              <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">{tour.title}</h3>
              <p className="mt-3 text-xs leading-7 text-white/55 sm:text-sm">{tour.copy}</p>
              <ul className="mt-5 space-y-2.5">
                {tour.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-[11px] font-medium leading-6 text-white/75 sm:text-xs">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-learningTeal/15 text-learningTeal">
                      <Check size={10} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                to={tour.cta.to}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-white/10"
              >
                {tour.cta.label} <ArrowRight size={13} />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="relative min-w-0">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-4 rounded-[36px] bg-gradient-to-tr from-brandBlue/25 via-transparent to-learningTeal/20 blur-2xl" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                <ProductPreview role={tour.previewRole} />
              </motion.div>
            </AnimatePresence>
            <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Preview only — not live campus data
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakeholderTourSection;
