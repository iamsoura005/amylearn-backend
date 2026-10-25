import { useMemo, useState } from 'react';
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Primitives';
import { Donut, BarChart } from '@/components/common/Charts';
import { SectionCard, SoftStat, formatDay } from './shared/StudentTabKit';
import { MOCK_ATTENDANCE_HISTORY, MOCK_ATTENDANCE_SUBJECTS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const WEEKS = [
  { label: 'W3', value: 88 },
  { label: 'W4', value: 91 },
  { label: 'W5', value: 84 },
  { label: 'W6', value: 89 },
  { label: 'W7', value: 86 },
  { label: 'W8', value: 92 },
  { label: 'W9', value: 87 }
];

export const StudentAttendanceTab = () => {
  const [view, setView] = useState('subjects');
  const totals = useMemo(() => {
    const attended = MOCK_ATTENDANCE_SUBJECTS.reduce((sum, item) => sum + item.attended, 0);
    const total = MOCK_ATTENDANCE_SUBJECTS.reduce((sum, item) => sum + item.total, 0);
    return { attended, total, percent: Math.round((attended / total) * 100), missed: total - attended };
  }, []);

  const shortages = MOCK_ATTENDANCE_SUBJECTS.filter((item) => item.percent < 85);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Learning management"
        title="Attendance"
        description="Subject-wise percentages, class history and shortage warnings for Semester 5."
        icon={CalendarCheck}
        tone="emerald"
        actions={<Badge tone="emerald" dot>{totals.percent}% overall</Badge>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Overall" value={`${totals.percent}%`} hint="Minimum required 75%" icon={CalendarCheck} tone="emerald" />
        <SoftStat label="Attended" value={totals.attended} hint={`of ${totals.total} classes`} icon={CheckCircle2} tone="blue" />
        <SoftStat label="Missed" value={totals.missed} hint="Includes approved leave" icon={XCircle} tone="rose" />
        <SoftStat label="Shortage alerts" value={shortages.length} hint="Below 85% threshold" icon={AlertTriangle} tone="amber" />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <SectionCard title="This semester" description="Present, absent and late classes" icon={ListChecks} tone="emerald" bodyClassName="p-4">
          <Donut
            segments={[
              { label: 'Present', value: 150, color: '#10B981' },
              { label: 'Late', value: 9, color: '#F59E0B' },
              { label: 'Absent', value: 13, color: '#F43F5E' }
            ]}
            centerValue={`${totals.percent}%`}
            centerLabel="Attendance"
            size={132}
            thickness={13}
          />
          <div className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-2">
            <p className="text-[10px] font-semibold leading-relaxed text-emerald-800">
              You are <span className="font-extrabold">{totals.percent - 75} points above</span> the 75% requirement. Keep
              attending labs to stay clear of the shortage list.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Weekly trend" description="Attendance percentage over the last seven weeks" icon={CalendarDays} tone="blue" bodyClassName="p-4">
          <BarChart data={WEEKS} height={150} color="#1E63D6" />
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[9px] font-semibold text-slate-500">Semester average</span>
            <span className="text-[11px] font-extrabold text-deepNavy tabular">{Math.round(WEEKS.reduce((sum, week) => sum + week.value, 0) / WEEKS.length)}%</span>
          </div>
        </SectionCard>

        <SectionCard title="Attention needed" description="Subjects below the comfort threshold" icon={AlertTriangle} tone="amber" bodyClassName="p-3.5">
          <div className="space-y-2">
            {shortages.map((item) => (
              <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[10.5px] font-bold text-deepNavy">{item.subject}</p>
                  <span className="shrink-0 text-[10px] font-extrabold text-amber-700 tabular">{item.percent}%</span>
                </div>
                <Progress value={item.percent} tone="amber" className="mt-1.5" thickness="h-1" />
                <p className="mt-1 text-[8.5px] font-semibold text-amber-700/80">
                  {item.attended}/{item.total} classes · attend {Math.max(0, Math.ceil((0.85 * item.total - item.attended) / 0.15))} more to reach 85%
                </p>
              </div>
            ))}
            {!shortages.length ? (
              <p className="py-6 text-center text-[11px] font-semibold text-emerald-700">No shortage alerts. Well done!</p>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Subject-wise attendance"
        description="Updated after every marked class"
        icon={ListChecks}
        tone="blue"
        action={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {[
              { id: 'subjects', label: 'Subjects' },
              { id: 'history', label: 'Daily log' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`rounded-md px-2 py-1 text-[9px] font-bold ${view === item.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-deepNavy'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
        bodyClassName="p-3"
      >
        {view === 'subjects' ? (
          <div className="space-y-1.5">
            {MOCK_ATTENDANCE_SUBJECTS.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                <span className="hidden w-14 shrink-0 text-[9px] font-extrabold text-slate-500 sm:block">{item.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-bold text-deepNavy">{item.subject}</p>
                    <span className={`shrink-0 text-[10px] font-extrabold tabular ${item.percent >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.percent}%
                    </span>
                  </div>
                  <Progress value={item.percent} tone={item.percent >= 85 ? 'emerald' : 'amber'} className="mt-1.5" thickness="h-1" />
                  <p className="mt-1 text-[8.5px] font-semibold text-slate-500">
                    {item.attended} attended · {item.total - item.attended} missed · {item.faculty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {MOCK_ATTENDANCE_HISTORY.map((entry, index) => (
              <div key={`${entry.date}-${entry.time}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                <span className="flex w-9 shrink-0 flex-col items-center">
                  <span className="text-[8px] font-bold uppercase text-slate-500">{formatDay(entry.date, 'MMM')}</span>
                  <span className="text-sm font-extrabold leading-none text-deepNavy font-jost">{formatDay(entry.date, 'd')}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-deepNavy">{entry.subject}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                    <Clock3 size={9} /> {entry.time} · {formatDay(entry.date, 'EEEE')}
                  </p>
                </div>
                <StatusBadge status={entry.status} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default StudentAttendanceTab;
