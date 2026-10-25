import { useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Clock3, DoorOpen, Download, MapPin, Printer, User } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionCard } from './shared/StudentTabKit';
import { MOCK_TIMETABLE, MOCK_WEEK_TIMETABLE } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const SLOTS = [
  { time: '09:00', end: '09:55' },
  { time: '10:00', end: '11:40' },
  { time: '11:45', end: '12:40' },
  { time: '13:30', end: '14:25' },
  { time: '15:00', end: '15:50' }
];

const CELL_TONE = [
  'bg-blue-50/70 border-blue-100 text-blue-900',
  'bg-violet-50/70 border-violet-100 text-violet-900',
  'bg-teal-50/70 border-teal-100 text-teal-900',
  'bg-amber-50/70 border-amber-100 text-amber-900',
  'bg-rose-50/70 border-rose-100 text-rose-900'
];

const splitPeriod = (value) => {
  if (!value || value === '—') return null;
  const [subject, room] = value.split(' · ');
  return { subject, room };
};

export const StudentTimetableTab = ({ session }) => {
  const today = format(new Date(), 'EEEE');
  const todayIndex = MOCK_WEEK_TIMETABLE.findIndex((item) => item.day === today);
  const todayPeriods = todayIndex >= 0 ? MOCK_WEEK_TIMETABLE[todayIndex] : MOCK_WEEK_TIMETABLE[0];
  const active = useMemo(() => MOCK_TIMETABLE, []);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Week 9 · Odd semester"
        title="Weekly timetable"
        description={`${session?.program || 'B.Tech · Computer Science & Engineering'} · Semester ${session?.semester || 5} · Section ${session?.section || 'A'}`}
        icon={CalendarDays}
        tone="sky"
        actions={
          <>
            <Button variant="white" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button
              variant="white"
              size="sm"
              icon={Download}
              onClick={() => {
                const rows = [['Day', ...SLOTS.map((slot) => `${slot.time}-${slot.end}`)]].concat(
                  MOCK_WEEK_TIMETABLE.map((item) => [item.day, ...item.periods])
                );
                const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
                const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'amylearn-timetable-semester-5.csv';
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </Button>
          </>
        }
      />

      <div className="grid gap-3 xl:grid-cols-4">
        <SectionCard
          title={`${today} · today`}
          description={`${active.filter((period) => period.status !== 'done').length} classes remaining`}
          icon={Clock3}
          tone="sky"
          className="xl:col-span-3"
          bodyClassName="p-2.5 sm:p-3"
        >
          <div className="space-y-1.5">
            {active.map((period) => (
              <div
                key={period.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  period.status === 'live' ? 'border-sky-200 bg-sky-50/70' : period.status === 'done' ? 'border-slate-100 bg-slate-50/60' : 'border-slate-100'
                }`}
              >
                <div className="w-12 shrink-0">
                  <p className="text-[11px] font-extrabold text-deepNavy tabular">{period.time}</p>
                  <p className="text-[8px] font-semibold text-slate-500 tabular">{period.end}</p>
                </div>
                <span className={`h-9 w-1 shrink-0 rounded-full ${period.status === 'live' ? 'bg-brandBlue' : period.status === 'done' ? 'bg-slate-200' : 'bg-sky-200'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[11px] font-bold ${period.status === 'done' ? 'text-slate-500' : 'text-deepNavy'}`}>{period.subject}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[8.5px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-0.5"><DoorOpen size={9} /> {period.room}</span>
                    <span className="inline-flex items-center gap-0.5"><User size={9} /> {period.faculty}</span>
                  </p>
                </div>
                {period.status === 'live' ? <Badge tone="blue" dot>Live</Badge> : <Badge tone="slate">{period.type}</Badge>}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Today at a glance" description="Room and break plan" icon={MapPin} tone="indigo" bodyClassName="p-3.5">
          <div className="space-y-2">
            <div className="rounded-xl bg-indigo-50 px-3 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-500">First class</p>
              <p className="mt-0.5 text-[11px] font-extrabold text-indigo-900">09:00 · C-204</p>
              <p className="text-[9px] font-semibold text-indigo-700/80">Database Management Systems</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-wide text-amber-500">Break</p>
              <p className="mt-0.5 text-[11px] font-extrabold text-amber-900">12:40 – 13:30</p>
              <p className="text-[9px] font-semibold text-amber-700/80">Lunch · Canteen block</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-wide text-emerald-500">Last class</p>
              <p className="mt-0.5 text-[11px] font-extrabold text-emerald-900">15:00 · T-12</p>
              <p className="text-[9px] font-semibold text-emerald-700/80">Discrete Mathematics tutorial</p>
            </div>
            <div className="rounded-xl border border-slate-100 px-3 py-2">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Today</p>
              <p className="mt-0.5 text-[10px] font-bold text-deepNavy">{today} · {format(new Date(), 'd MMM yyyy')}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Full weekly routine"
        description="Monday to Saturday · swipe horizontally on smaller screens"
        icon={CalendarDays}
        tone="sky"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-10 w-24 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-500">Time</th>
                {MOCK_WEEK_TIMETABLE.map((item) => (
                  <th
                    key={item.day}
                    className={`border-b border-slate-100 px-2 py-2 text-[9px] font-bold uppercase tracking-wide ${
                      item.day === today ? 'bg-sky-50 text-sky-700' : 'text-slate-500'
                    }`}
                  >
                    {item.day}
                    {item.day === today ? <span className="ml-1 rounded-full bg-sky-500 px-1 py-0.5 text-[7px] text-white">Today</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot, slotIndex) => (
                <tr key={slot.time} className="border-b border-slate-50 last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 align-top">
                    <p className="text-[10px] font-extrabold text-deepNavy tabular">{slot.time}</p>
                    <p className="text-[8px] font-semibold text-slate-500 tabular">{slot.end}</p>
                  </td>
                  {MOCK_WEEK_TIMETABLE.map((day) => {
                    const entry = splitPeriod(day.periods[slotIndex]);
                    return (
                      <td key={`${day.day}-${slotIndex}`} className={`px-1.5 py-1.5 align-top ${day.day === today ? 'bg-sky-50/40' : ''}`}>
                        {entry ? (
                          <div className={`rounded-lg border px-2 py-1.5 ${CELL_TONE[slotIndex]}`}>
                            <p className="text-[9.5px] font-bold leading-tight">{entry.subject}</p>
                            {entry.room ? <p className="mt-0.5 text-[8px] font-semibold opacity-70">{entry.room}</p> : null}
                          </div>
                        ) : (
                          <div className="grid h-full min-h-[36px] place-items-center rounded-lg border border-dashed border-slate-100">
                            <span className="text-[9px] font-semibold text-slate-500">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-3 py-2 text-[8.5px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-300" /> Core lecture</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-violet-300" /> Lab</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-teal-300" /> Tutorial</span>
          <span className="ml-auto">Effective from 21 July 2026 · approved by the CSE timetable committee</span>
        </div>
      </SectionCard>
    </div>
  );
};

export default StudentTimetableTab;
