import { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  Library,
  MapPin,
  Receipt,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Primitives';
import { SectionCard, dueLabel, formatDay, inr, RowItem } from './shared/StudentTabKit';
import {
  MOCK_ASSIGNMENTS,
  MOCK_DASHBOARD_STATS,
  MOCK_NOTICES,
  MOCK_TIMETABLE,
  MOCK_WEEK_TIMETABLE,
  STUDENT_QUICK_LINKS
} from '@/pages/auth/campus-student/constants/campusStudentConstants';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const todayName = () => format(new Date(), 'EEEE');
const todayLabel = () => format(new Date(), 'EEEE, d MMMM yyyy');

const PERIODS = ['09:00', '10:00', '11:45', '13:30', '15:00'];

export const StudentOverviewTab = ({ session, college, setTab }) => {
  const firstName = (session?.name || 'Student').split(' ')[0];
  const pending = useMemo(() => MOCK_ASSIGNMENTS.filter((item) => item.status === 'Pending'), []);
  const nextClass = MOCK_TIMETABLE.find((item) => item.status === 'live') || MOCK_TIMETABLE[0];
  const today = todayName();
  const todayPeriods = MOCK_WEEK_TIMETABLE.find((item) => item.day === today)?.periods || MOCK_WEEK_TIMETABLE[0].periods;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={todayLabel()}
        title={`${greeting()}, ${firstName}`}
        description={`${college?.name || 'Northbridge University'} · Semester ${session?.semester || 5} · Section ${session?.section || 'A'}. Here is what needs your attention today.`}
        actions={
          <>
            <Button variant="white" size="sm" icon={CalendarDays} onClick={() => setTab('timetable')}>
              Timetable
            </Button>
            <Button variant="ai" size="sm" icon={Sparkles} onClick={() => setTab('ai-study')}>
              Ask Amy
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <StatCard
          label="Attendance"
          value={`${MOCK_DASHBOARD_STATS.attendance}%`}
          icon={CalendarCheck}
          tone="emerald"
          hint="Across 6 subjects"
          progress={MOCK_DASHBOARD_STATS.attendance}
        />
        <StatCard
          label="Current CGPA"
          value={MOCK_DASHBOARD_STATS.cgpa}
          icon={GraduationCap}
          tone="violet"
          hint="Semester 4 result"
          delta={3}
        />
        <StatCard
          label="Pending fees"
          value={inr(MOCK_DASHBOARD_STATS.pendingFees)}
          icon={Receipt}
          tone="amber"
          hint="Lab fee · due 5 Nov"
        />
        <StatCard
          label="Library due"
          value={`${MOCK_DASHBOARD_STATS.libraryDue} books`}
          icon={Library}
          tone="blue"
          hint="1 overdue · fine ₹60"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <SectionCard
            title="Today’s classes"
            description={`${today} · Week 9 · ${todayPeriods.filter((period) => period !== '—').length} sessions`}
            icon={Clock}
            tone="blue"
            action={
              <Button variant="ghost" size="xs" iconRight={ArrowRight} onClick={() => setTab('timetable')}>
                Full week
              </Button>
            }
            bodyClassName="p-2.5 sm:p-3"
          >
            <div className="space-y-1.5">
              {MOCK_TIMETABLE.map((period) => (
                <div
                  key={period.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    period.status === 'live'
                      ? 'border-blue-200 bg-blue-50/70'
                      : period.status === 'done'
                        ? 'border-slate-100 bg-slate-50/50'
                        : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="w-11 shrink-0 text-center">
                    <p className="text-[11px] font-extrabold text-deepNavy tabular">{period.time}</p>
                    <p className="text-[8px] font-semibold text-slate-500 tabular">{period.end}</p>
                  </div>
                  <span className={`h-8 w-1 shrink-0 rounded-full ${period.status === 'live' ? 'bg-brandBlue' : period.status === 'done' ? 'bg-slate-200' : 'bg-indigo-200'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-[11px] font-bold ${period.status === 'done' ? 'text-slate-500' : 'text-deepNavy'}`}>
                      {period.subject}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[9px] font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin size={9} /> {period.room}
                      </span>
                      <span className="truncate">{period.faculty}</span>
                    </p>
                  </div>
                  {period.status === 'live' ? (
                    <Badge tone="blue" dot>Live now</Badge>
                  ) : period.status === 'done' ? (
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                  ) : (
                    <Badge tone="slate">{period.type}</Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-indigo-50/70 px-3 py-2">
              <p className="text-[10px] font-semibold text-indigo-800">
                Next up · <span className="font-bold">{nextClass.subject}</span> in {nextClass.room}
              </p>
              <span className="text-[9px] font-bold text-indigo-600 tabular">{nextClass.time}</span>
            </div>
          </SectionCard>

          <div className="grid gap-3 md:grid-cols-2">
            <SectionCard
              title="Pending work"
              description={`${pending.length} assignments need attention`}
              icon={ClipboardList}
              tone="amber"
              action={
                <Button variant="ghost" size="xs" iconRight={ArrowRight} onClick={() => setTab('assignments')}>
                  Open
                </Button>
              }
              bodyClassName="p-3"
            >
              <div className="space-y-2">
                {pending.slice(0, 3).map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => setTab('assignments')}
                    className="flex w-full items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/40"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                      <BookOpen size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-bold text-deepNavy">{assignment.title}</span>
                      <span className="mt-0.5 block text-[9px] font-semibold text-slate-500">
                        {assignment.code} · {dueLabel(assignment.due)}
                      </span>
                    </span>
                    <ArrowRight size={13} className="mt-1 shrink-0 text-slate-300" />
                  </button>
                ))}
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800">
                    <AlertTriangle size={12} /> Laboratory fee due
                  </span>
                  <button onClick={() => setTab('fees')} className="text-[9px] font-bold text-amber-800 underline underline-offset-2">
                    Pay {inr(3200)}
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="AI study plan"
              description="Three prompts tuned to your current units"
              icon={Sparkles}
              tone="violet"
              action={<Badge tone="ai">AI</Badge>}
              bodyClassName="p-3"
            >
              <div className="rounded-xl bg-gradient-to-br from-ai-50 to-violet-50 p-3">
                <p className="text-[10px] font-semibold leading-relaxed text-slate-600">
                  Exams begin <span className="font-bold text-deepNavy">9 November</span>. Amy can build a 12-day revision
                  plan around your six papers and the two assignments still open.
                </p>
                <Button
                  variant="ai"
                  size="sm"
                  icon={Sparkles}
                  className="mt-2.5 w-full"
                  onClick={() => setTab('ai-study')}
                >
                  Build my revision plan
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                <button onClick={() => setTab('marks')} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-50">
                  <span className="text-[10px] font-semibold text-slate-600">Weakest unit · TCP congestion control</span>
                  <ArrowRight size={11} className="text-slate-300" />
                </button>
                <button onClick={() => setTab('attendance')} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-50">
                  <span className="text-[10px] font-semibold text-slate-600">Attendance risk · Applied AI at 82%</span>
                  <ArrowRight size={11} className="text-slate-300" />
                </button>
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="space-y-3">
          <SectionCard
            title="Campus notices"
            description="4 unread updates"
            icon={ClipboardList}
            tone="indigo"
            action={
              <Button variant="ghost" size="xs" iconRight={ArrowRight} onClick={() => setTab('notices')}>
                All
              </Button>
            }
            bodyClassName="p-2"
          >
            <div className="space-y-0.5">
              {MOCK_NOTICES.slice(0, 4).map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => setTab('notices')}
                  className="w-full rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-indigo-50/50"
                >
                  <div className="flex items-center gap-1.5">
                    {notice.pinned ? <Badge tone="blue">Pinned</Badge> : null}
                    <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{notice.category}</span>
                    <span className="ml-auto text-[8px] font-semibold text-slate-500">{formatDay(notice.date, 'd MMM')}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10.5px] font-bold leading-snug text-deepNavy">{notice.title}</p>
                  <p className="mt-0.5 text-[8.5px] font-semibold text-slate-500">{notice.department}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Quick links" icon={ArrowRight} tone="teal" bodyClassName="p-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {STUDENT_QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => setTab(link.id)}
                    className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/60"
                  >
                    <Icon size={14} className="text-teal-700" />
                    <span className="text-[9.5px] font-bold leading-tight text-deepNavy">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Semester progress" icon={GraduationCap} tone="violet" bodyClassName="p-3.5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-extrabold leading-none text-deepNavy font-jost tabular">96</p>
                <p className="text-[9px] font-semibold text-slate-500">of 160 credits earned</p>
              </div>
              <Badge tone="violet">60%</Badge>
            </div>
            <Progress value={60} tone="violet" className="mt-2.5" />
            <div className="mt-3 space-y-1">
              <RowItem>
                <span className="text-[10px] font-semibold text-slate-500">Backlogs</span>
                <span className="text-[10px] font-bold text-deepNavy">1 · CS301</span>
              </RowItem>
              <RowItem>
                <span className="text-[10px] font-semibold text-slate-500">Advisor</span>
                <span className="text-[10px] font-bold text-deepNavy">{session?.advisor || 'Dr. Ananya Rao'}</span>
              </RowItem>
              <RowItem>
                <span className="text-[10px] font-semibold text-slate-500">Exam form</span>
                <StatusBadge status="Submitted" />
              </RowItem>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewTab;
