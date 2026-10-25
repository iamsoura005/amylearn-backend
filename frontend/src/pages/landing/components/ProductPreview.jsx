import { useId } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Library,
  Search,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import { AmyLearnMark } from '@/components/global/AmyLearnLogo';

const ROLE_DATA = {
  admin: {
    roleLabel: 'Campus administrator',
    path: 'amylearn.app/campus-admin',
    campus: 'Northbridge University',
    code: 'NBR',
    greeting: 'Good morning, Dean Rao',
    sub: 'Tuesday, 27 October · Semester 5',
    avatar: 'DR',
    nav: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'Students', icon: Users },
      { label: 'Examinations', icon: ClipboardCheck },
      { label: 'Learning', icon: BookOpen },
      { label: 'Library', icon: Library },
      { label: 'AI studio', icon: Sparkles, ai: true }
    ],
    stats: [
      { label: 'Active students', value: '4,218', hint: '+6.2% this term', tone: 'positive' },
      { label: 'Fees reconciled', value: '92%', hint: '+4.1 pts this month', tone: 'positive' },
      { label: 'Exam forms', value: '1,264', hint: '38 awaiting approval', tone: 'warn' }
    ],
    ring: { value: 92, label: 'Attendance posted', note: 'Across 38 active batches', present: 'Present today', watch: 'Below 75%' },
    schedule: {
      title: 'Today at a glance',
      meta: 'Semester 5 · CSE',
      rows: [
        { time: '09:00', name: 'Database systems', room: 'LH-204', tag: 'Posted', tone: 'blue' },
        { time: '11:15', name: 'Operating systems', room: 'LH-118', tag: 'Room change', tone: 'amber' },
        { time: '14:00', name: 'Project review', room: 'Lab-3', tag: 'Review', tone: 'slate' }
      ]
    },
    ai: {
      title: 'Amy AI',
      text: '12 students in CSE-5B are below 75% attendance. Draft a guardian note?',
      action: 'Draft note'
    }
  },
  faculty: {
    roleLabel: 'Faculty workspace',
    path: 'amylearn.app/faculty',
    campus: 'Northbridge University',
    code: 'NBR',
    greeting: 'Good morning, Prof. Iyer',
    sub: 'Tuesday · 3 classes scheduled',
    avatar: 'SI',
    nav: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'My classes', icon: BookOpen },
      { label: 'Attendance', icon: ClipboardCheck },
      { label: 'Marks', icon: FileText },
      { label: 'Lesson tracker', icon: CalendarDays },
      { label: 'AI studio', icon: Sparkles, ai: true }
    ],
    stats: [
      { label: 'Classes today', value: '3', hint: 'Next at 09:00', tone: 'neutral' },
      { label: 'Attendance marked', value: '86%', hint: '2 classes pending', tone: 'warn' },
      { label: 'Marks to review', value: '42', hint: 'Due Friday', tone: 'warn' }
    ],
    ring: { value: 78, label: 'Course completion', note: 'CSE-5B · Database systems', present: 'Modules done', watch: 'Revision left' },
    schedule: {
      title: 'Teaching plan',
      meta: 'CSE-5B · 64 students',
      rows: [
        { time: '09:00', name: 'Database systems', room: 'LH-204', tag: 'Attendance', tone: 'blue' },
        { time: '11:15', name: 'Operating systems', room: 'LH-118', tag: 'Marks due', tone: 'amber' },
        { time: '14:00', name: 'Project review', room: 'Lab-3', tag: 'Review', tone: 'slate' }
      ]
    },
    ai: {
      title: 'Amy AI',
      text: "Turn yesterday's lecture into a one-page revision brief for CSE-5B?",
      action: 'Create brief'
    }
  },
  student: {
    roleLabel: 'Student workspace',
    path: 'amylearn.app/student',
    campus: 'Northbridge University',
    code: 'NBR',
    greeting: 'Hi, Aanya',
    sub: 'Tuesday · 4 sessions today',
    avatar: 'AK',
    nav: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'Courses', icon: BookOpen },
      { label: 'Attendance', icon: ClipboardCheck },
      { label: 'Library', icon: Library },
      { label: 'Fees', icon: Wallet },
      { label: 'AI study', icon: Sparkles, ai: true }
    ],
    stats: [
      { label: 'Attendance', value: '92%', hint: '+3% this month', tone: 'positive' },
      { label: 'CGPA', value: '8.4', hint: 'Semester 4', tone: 'neutral' },
      { label: 'Library loans', value: '2', hint: '1 due Friday', tone: 'warn' }
    ],
    ring: { value: 78, label: 'Semester progress', note: 'Week 9 of 16', present: 'Completed', watch: 'Remaining' },
    schedule: {
      title: 'Today · timetable',
      meta: 'CSE · Semester 5',
      rows: [
        { time: '09:00', name: 'Database systems', room: 'LH-204', tag: 'Class', tone: 'blue' },
        { time: '11:15', name: 'Computer networks', room: 'LH-118', tag: 'Class', tone: 'blue' },
        { time: '14:00', name: 'OS lab', room: 'Lab-3', tag: 'Lab', tone: 'slate' }
      ]
    },
    ai: {
      title: 'AI study companion',
      text: 'Explain database normalisation with a campus example, then quiz me on 1NF to 3NF.',
      action: 'Ask Amy'
    }
  }
};

const STAT_TONES = {
  positive: 'text-emerald-600',
  warn: 'text-amber-600',
  neutral: 'text-slate-500'
};

const TAG_TONES = {
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-500'
};

export const ProductPreview = ({ role = 'admin', className = '' }) => {
  const data = ROLE_DATA[role] || ROLE_DATA.admin;
  const rawId = useId();
  const ringId = `preview-ring-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const circumference = 301.6;

  return (
    <div
      role="img"
      aria-label={`Illustrative AmyLearn ${data.roleLabel} dashboard for ${data.campus}`}
      className={`relative w-full overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_40px_90px_-44px_rgba(10,31,68,0.55)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200/70 bg-slate-50/90 px-3 py-2">
        <div className="flex shrink-0 items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1">
          <Search size={9} className="shrink-0 text-slate-400" />
          <span className="truncate text-[8px] font-semibold text-slate-500">{data.path}</span>
        </div>
        <Bell size={11} className="hidden shrink-0 text-slate-400 sm:block" />
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-deepNavy text-[7px] font-bold text-white">
          {data.avatar}
        </span>
      </div>

      <div className="flex min-w-0">
        <aside className="hidden w-[118px] shrink-0 flex-col border-r border-slate-200/70 bg-[#F8FAFD] p-2.5 sm:flex">
          <div className="flex items-center gap-1.5">
            <AmyLearnMark size={18} />
            <div className="min-w-0">
              <p className="truncate text-[8px] font-bold text-deepNavy">{data.campus}</p>
              <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-500">Code {data.code}</p>
            </div>
          </div>

          <div className="mt-4 space-y-0.5">
            {data.nav.map((item, index) => {
              const Icon = item.icon;
              const active = index === 0;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 rounded-md px-1.5 py-1.5 ${
                    active ? 'bg-brandBlue text-white' : item.ai ? 'text-ai-600' : 'text-slate-500'
                  }`}
                >
                  <Icon size={9} />
                  <span className="truncate text-[7px] font-bold">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-1.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[6.5px] font-bold uppercase tracking-[0.1em] text-slate-500">Tenant {data.code}</span>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-3 sm:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-jost text-[13px] font-bold leading-tight text-deepNavy sm:text-sm">{data.greeting}</p>
              <p className="mt-0.5 truncate text-[7px] font-semibold text-slate-500">{data.sub}</p>
            </div>
            <span className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-[6.5px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:block">
              Live workspace
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {data.stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-100 bg-white p-2 shadow-2xs">
                <p className="truncate text-[6.5px] font-bold uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                <p className="mt-0.5 text-[13px] font-extrabold leading-none text-deepNavy tabular">{stat.value}</p>
                <p className={`mt-1 truncate text-[6.5px] font-bold ${STAT_TONES[stat.tone] || STAT_TONES.neutral}`}>{stat.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[0.9fr_1.3fr]">
            <div className="rounded-xl border border-slate-100 bg-white p-2">
              <p className="text-[6.5px] font-bold uppercase tracking-[0.1em] text-slate-500">{data.ring.label}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative h-[62px] w-[62px] shrink-0">
                  <svg viewBox="0 0 120 120" className="h-full w-full">
                    <defs>
                      <linearGradient id={ringId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1E63D6" />
                        <stop offset="1" stopColor="#21C7C4" />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#EEF2F8" strokeWidth="12" />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke={`url(#${ringId})`}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(data.ring.value / 100) * circumference} ${circumference}`}
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="66" textAnchor="middle" className="fill-deepNavy" style={{ fontSize: 23, fontWeight: 800 }}>
                      {data.ring.value}%
                    </text>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[7px] font-semibold leading-snug text-slate-500">{data.ring.note}</p>
                  <div className="mt-1.5 space-y-1">
                    <p className="flex items-center gap-1 text-[6.5px] font-semibold text-slate-500">
                      <span className="h-1 w-1 rounded-full bg-brandBlue" /> {data.ring.present}
                    </p>
                    <p className="flex items-center gap-1 text-[6.5px] font-semibold text-slate-500">
                      <span className="h-1 w-1 rounded-full bg-slate-300" /> {data.ring.watch}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-2">
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-[7px] font-bold text-deepNavy">{data.schedule.title}</p>
                <p className="shrink-0 text-[6px] font-semibold text-slate-500">{data.schedule.meta}</p>
              </div>
              <div className="mt-1.5 space-y-1">
                {data.schedule.rows.map((row) => (
                  <div key={`${row.time}-${row.name}`} className="flex items-center gap-1.5 rounded-md bg-slate-50/80 px-1.5 py-1">
                    <span className="w-6 shrink-0 text-[6px] font-bold text-slate-500 tabular">{row.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[7px] font-bold leading-tight text-deepNavy">{row.name}</p>
                      <p className="text-[5.5px] font-semibold text-slate-500">{row.room}</p>
                    </div>
                    <span className={`shrink-0 rounded px-1 py-0.5 text-[5.5px] font-bold ${TAG_TONES[row.tone] || TAG_TONES.slate}`}>
                      {row.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-start gap-1.5 rounded-xl border border-ai-200/70 bg-ai-50/80 p-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br from-ai-500 to-ai-300 text-white">
              <Sparkles size={9} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[6.5px] font-bold uppercase tracking-[0.1em] text-ai-700">{data.ai.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[7px] font-semibold leading-snug text-slate-600">{data.ai.text}</p>
            </div>
            <span className="hidden shrink-0 self-center rounded-md bg-white px-1.5 py-1 text-[6px] font-bold text-ai-700 shadow-2xs sm:block">
              {data.ai.action}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
