import { useMemo, useState } from 'react';
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ClipboardCheck, IndianRupee, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Donut } from '@/components/common/Charts';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, SoftStat } from '@/components/portal/PortalKit';
import { Progress } from '@/components/ui/Primitives';
import { formatDay } from '@/components/portal/PortalKit';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_ATTENDANCE_DEPT,
  MOCK_QUICK_ACTIONS,
  MOCK_ORG_EVENTS,
  MOCK_EXAM_FORMS,
  MOCK_LEAVE_REQUESTS,
  MOCK_FEE_COLLECTIONS,
  MOCK_EXAM_SESSIONS
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const STAT_ICONS = {
  students: Users,
  faculty: Building2,
  attendance: ClipboardCheck,
  fees: IndianRupee
};

const QUICK_TONES = {
  teal: 'border-teal-100 hover:border-teal-300 hover:bg-teal-50/40',
  blue: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/40',
  emerald: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40',
  violet: 'border-violet-100 hover:border-violet-300 hover:bg-violet-50/40',
  rose: 'border-rose-100 hover:border-rose-300 hover:bg-rose-50/40',
  amber: 'border-amber-100 hover:border-amber-300 hover:bg-amber-50/40',
  orange: 'border-orange-100 hover:border-orange-300 hover:bg-orange-50/40',
  sky: 'border-sky-100 hover:border-sky-300 hover:bg-sky-50/40'
};

const AdminOverviewTab = ({ session, college, triggerPopup, setTab }) => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const pendingForms = MOCK_EXAM_FORMS.filter((form) => form.status === 'pending').length;
  const verifiedForms = MOCK_EXAM_FORMS.filter((form) => form.status === 'verified').length;
  const pendingLeaves = MOCK_LEAVE_REQUESTS.filter((leave) => leave.status === 'pending').length;
  const attendanceSegments = useMemo(
    () => MOCK_ATTENDANCE_DEPT.map((entry) => ({ label: entry.dept, value: entry.percent, color: entry.color })),
    []
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`${college.name} · Campus console`}
        title={`${greeting}, ${session.name.split(' ')[0]} ${session.name.split(' ')[1] || ''}`}
        description="Here is how the campus is doing today — attendance, fee collections and examination readiness."
        icon={Sparkles}
        tone="teal"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MOCK_DASHBOARD_STATS.map((stat) => {
          const Icon = STAT_ICONS[stat.id] || Users;
          return <SoftStat key={stat.id} label={stat.label} value={stat.value} hint={stat.hint} icon={Icon} tone={stat.tone} />;
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="Attendance by department"
          description="Yesterday's class coverage"
          icon={ClipboardCheck}
          tone="teal"
          className="lg:col-span-1"
          action={
            <button onClick={() => setTab('attendance')} className="text-[10px] font-bold text-teal-700 hover:underline">
              Details
            </button>
          }
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Donut segments={attendanceSegments} size={128} thickness={12} centerLabel="Campus" centerValue="87.2%" />
            <div className="w-full flex-1 space-y-2">
              {MOCK_ATTENDANCE_DEPT.map((entry) => (
                <div key={entry.dept} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">{entry.dept}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={entry.percent} thickness="h-1" className="w-20" tone={entry.dept === 'CSE' ? 'teal' : 'blue'} />
                    <span className="w-7 text-right text-[10px] font-bold text-deepNavy tabular">{entry.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Frequent admin tasks"
          icon={ArrowRight}
          tone="teal"
          className="lg:col-span-2"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {MOCK_QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => setTab(action.tab)}
                className={`flex items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors ${QUICK_TONES[action.tone]}`}
              >
                <div>
                  <p className="text-[11px] font-bold text-deepNavy">{action.label}</p>
                  <p className="mt-0.5 text-[9px] font-semibold text-slate-500">{action.hint}</p>
                </div>
                <ArrowRight size={13} className="shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="Examination readiness"
          description={MOCK_EXAM_SESSIONS[0].name}
          icon={CheckCircle2}
          tone="amber"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-500">Exam form verification</span>
              <span className="text-[11px] font-bold text-deepNavy tabular">{pendingForms} pending · {verifiedForms} verified</span>
            </div>
            <Progress value={((verifiedForms + 2) / MOCK_EXAM_FORMS.length) * 100} tone="amber" />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-semibold text-slate-500">Form deadline</span>
              <span className="text-[10px] font-bold text-amber-700">{formatDay(MOCK_EXAM_SESSIONS[0].formDeadline)}</span>
            </div>
            <button
              onClick={() => setTab('coe')}
              className="w-full rounded-lg border border-amber-200 bg-amber-50/50 py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-50"
            >
              Open COE queue
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Fee collections" description="Current term by department" icon={IndianRupee} tone="emerald">
          <div className="space-y-2">
            {MOCK_FEE_COLLECTIONS.slice(0, 4).map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold text-slate-500">{row.department} · {row.semester}</span>
                <span className={`text-[10px] font-bold tabular ${row.percent >= 95 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {row.percent}%
                </span>
              </div>
            ))}
            <button
              onClick={() => setTab('fees')}
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50/50 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
            >
              View fee ledger
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Upcoming on campus" description="Next events and deadlines" icon={CalendarDays} tone="violet">
          <div className="space-y-2">
            {MOCK_ORG_EVENTS.slice(0, 4).map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/40 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-deepNavy">{event.title}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{formatDay(event.date)} · {event.venue}</p>
                </div>
                <StatusBadge status={event.type} />
              </div>
            ))}
            <button
              onClick={() => setTab('org-calendar')}
              className="w-full rounded-lg border border-violet-200 bg-violet-50/50 py-2 text-[10px] font-bold text-violet-700 hover:bg-violet-50"
            >
              Open org calendar
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Needs your attention"
        description="Pending approvals across modules"
        icon={ClipboardCheck}
        tone="rose"
      >
        <div className="grid gap-2 sm:grid-cols-3">
          <button onClick={() => setTab('coe')} className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 text-left hover:bg-amber-50">
            <p className="text-lg font-extrabold text-deepNavy font-jost tabular">{pendingForms}</p>
            <p className="text-[10px] font-bold text-amber-700">Exam forms to verify</p>
          </button>
          <button onClick={() => setTab('faculty-leaves')} className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-left hover:bg-rose-50">
            <p className="text-lg font-extrabold text-deepNavy font-jost tabular">{pendingLeaves}</p>
            <p className="text-[10px] font-bold text-rose-700">Leave requests pending</p>
          </button>
          <button onClick={() => setTab('digital-library')} className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-left hover:bg-blue-50">
            <p className="text-lg font-extrabold text-deepNavy font-jost tabular">3</p>
            <p className="text-[10px] font-bold text-blue-700">Library requests in queue</p>
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default AdminOverviewTab;
