import { useState } from 'react';
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, SoftStat, formatDay } from '@/components/portal/PortalKit';
import { StatusBadge } from '@/components/ui/Badge';
import {
  MOCK_FACULTY_STATS,
  MOCK_FACULTY_COURSES,
  MOCK_FACULTY_TIMETABLE,
  MOCK_FACULTY_LEAVES,
  MOCK_ATTENDANCE_SESSIONS
} from '@/pages/faculty/constants/facultyConstants';

const STAT_ICONS = {
  courses: BookOpen,
  students: Users,
  attendance: ClipboardCheck,
  pending: CalendarCheck
};

const FacultyOverviewTab = ({ session, setTab }) => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const today = Object.keys(MOCK_FACULTY_TIMETABLE)[0];
  const pendingSessions = MOCK_ATTENDANCE_SESSIONS.filter((item) => !item.marked);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`Faculty · ${session.department} department`}
        title={`${greeting}, ${session.name.replace('Prof. ', '').replace('Dr. ', '')}`}
        description="Your teaching load, today's classes and pending reviews."
        icon={BookOpen}
        tone="indigo"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MOCK_FACULTY_STATS.map((stat) => {
          const Icon = STAT_ICONS[stat.id] || BookOpen;
          return <SoftStat key={stat.id} label={stat.label} value={stat.value} hint={stat.hint} icon={Icon} tone={stat.tone} />;
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="My courses"
          description="Current term teaching load"
          icon={BookOpen}
          tone="indigo"
          className="lg:col-span-2"
        >
          <div className="space-y-2">
            {MOCK_FACULTY_COURSES.map((course) => (
              <div key={course.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                <span className="grid h-9 w-12 shrink-0 place-items-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-700">
                  {course.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-extrabold text-deepNavy">{course.subject}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{course.class} · {course.room}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                  {course.type}
                </span>
                <span className="shrink-0 text-[10px] font-bold text-deepNavy tabular">{course.students} students</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Needs attention"
          description="Pending tasks and approvals"
          icon={ClipboardCheck}
          tone="amber"
        >
          <div className="space-y-2">
            {pendingSessions.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab('attendance')}
                className="w-full rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2 text-left hover:bg-amber-50"
              >
                <p className="text-[10px] font-bold text-deepNavy">Mark attendance — {item.course.split('·')[0].trim()}</p>
                <p className="text-[9px] font-semibold text-slate-500">{formatDay(item.date)} · {item.time}</p>
              </button>
            ))}
            <button
              onClick={() => setTab('students')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
            >
              <p className="text-[10px] font-bold text-deepNavy">IA-2 marks verification</p>
              <p className="text-[9px] font-semibold text-slate-500">Window closes 30 October</p>
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title={`Today · ${today}`}
          description="Your classes for the day"
          icon={CalendarCheck}
          tone="emerald"
          className="lg:col-span-2"
          action={
            <button onClick={() => setTab('timetable')} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:underline">
              Full timetable <ArrowRight size={11} />
            </button>
          }
        >
          <div className="space-y-2">
            {MOCK_FACULTY_TIMETABLE[today].map((slot, index) => (
              <div key={`${slot.code}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-3.5 py-3">
                <div className="w-24 shrink-0 text-[10px] font-bold text-indigo-700 tabular">{slot.time}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-extrabold text-deepNavy">{slot.subject}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{slot.code} · {slot.class}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">{slot.room}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="My leaves" description="Recent leave requests" icon={Users} tone="violet">
          <div className="space-y-2">
            {MOCK_FACULTY_LEAVES.map((leave) => (
              <div key={leave.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold text-deepNavy tabular">
                    {formatDay(leave.from)} → {formatDay(leave.to)}
                  </p>
                  <StatusBadge status={leave.status} />
                </div>
                <p className="mt-1 text-[9px] font-semibold leading-snug text-slate-500">{leave.reason}</p>
              </div>
            ))}
            <button
              onClick={() => setTab('profile')}
              className="w-full rounded-lg border border-violet-200 bg-violet-50/50 py-2 text-[10px] font-bold text-violet-700 hover:bg-violet-50"
            >
              Apply for leave
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default FacultyOverviewTab;
