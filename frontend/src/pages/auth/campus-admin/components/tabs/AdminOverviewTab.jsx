import { useMemo, useState } from 'react';
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ClipboardCheck, Download, FileSpreadsheet, IndianRupee, Sparkles, Users } from 'lucide-react';
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

const AdminOverviewTab = ({ session, college, triggerPopup = () => {}, setTab }) => {
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

  const exportNaacNbaReport = () => {
    const rows = [
      ['NAAC / NBA ACCREDITATION SELF STUDY REPORT (SSR) — DATA TEMPLATE'],
      ['Institution Name', college.name || 'Northbridge University'],
      ['Academic Year', '2026-2027'],
      ['Report Generated Date', new Date().toISOString().split('T')[0]],
      [''],
      ['CRITERION 1: CURRICULAR ASPECTS & SYLLABUS DELIVERY'],
      ['Metric ID', 'Description', 'Institutional Value', 'Benchmarked Target', 'Status'],
      ['1.1.1', 'Curricula developed and implemented with relevance to regional/national/global needs', '14 Active Programs', '12 Programs', 'Compliant'],
      ['1.2.1', 'Percentage of new courses introduced across all programs during last five years', '24.5%', '20.0%', 'Exceeds'],
      ['1.3.2', 'Average syllabus completion rate across academic departments', '92.4%', '85.0%', 'Exceeds'],
      ['1.4.1', 'Structured feedback on syllabus received from students, teachers, employers and alumni', 'Active (4-Tier)', 'Annual Survey', 'Compliant'],
      [''],
      ['CRITERION 2: TEACHING-LEARNING & EVALUATION'],
      ['Metric ID', 'Description', 'Institutional Value', 'Benchmarked Target', 'Status'],
      ['2.1.1', 'Total Enrolled Students', '2,840 Students', '2,500 Capacity', 'Optimal'],
      ['2.2.2', 'Student-to-Full-Time-Faculty Ratio', '17.7 : 1', '20 : 1', 'Exceeds'],
      ['2.3.1', 'Student-centric methods (LMS, problem-solving, experiential learning)', 'AmyLearn AI Hub + LMS', 'LMS Enabled', 'Exceeds'],
      ['2.5.1', 'Average number of days from exam completion to results declaration by COE', '14 Days', '30 Days', 'Exceeds'],
      ['2.6.2', 'Attainment of Program Outcomes (POs) and Course Outcomes (COs)', '88.6%', '80.0%', 'Compliant'],
      ['2.7.1', 'Average student attendance percentage', '87.2%', '75.0%', 'Compliant'],
      [''],
      ['CRITERION 5: STUDENT SUPPORT & PROGRESSION'],
      ['Metric ID', 'Description', 'Institutional Value', 'Benchmarked Target', 'Status'],
      ['5.1.1', 'Percentage of students benefited by scholarships and freeships', '34.2%', '25.0%', 'Exceeds'],
      ['5.2.1', 'Percentage of placement of outgoing students and progression to higher education', '84.8%', '75.0%', 'Exceeds'],
      ['5.3.1', 'Number of awards/medals for outstanding performance in sports/cultural activities', '48 Awards', '30 Awards', 'Compliant'],
      [''],
      ['CRITERION 6: GOVERNANCE, LEADERSHIP & E-GOVERNANCE'],
      ['Metric ID', 'Description', 'Institutional Value', 'Benchmarked Target', 'Status'],
      ['6.2.3', 'Implementation of e-governance in areas of operation (Admin, Finance, Exam, Academics)', '100% Implemented (AmyLearn)', 'Partial', 'Exceeds'],
      ['6.4.1', 'Institution fee ledger reconciliation and internal/external financial audits', '100% Reconciled', 'Annual Audit', 'Compliant']
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NAAC-NBA-Accreditation-SSR-${(college.name || 'Campus').replace(/\s+/g, '-')}-2026.csv`;
    link.click();
    URL.revokeObjectURL(url);

    triggerPopup('NAAC / NBA Accreditation SSR data export generated successfully!', 'success');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`${college.name} · Campus console`}
        title={`${greeting}, ${session.name.split(' ')[0]} ${session.name.split(' ')[1] || ''}`}
        description="Here is how the campus is doing today — attendance, fee collections and examination readiness."
        icon={Sparkles}
        tone="teal"
        actions={
          <button
            onClick={exportNaacNbaReport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-2 text-[11px] font-bold text-teal-800 shadow-2xs hover:bg-teal-50/60"
          >
            <FileSpreadsheet size={14} className="text-teal-600" /> Export NAAC / NBA SSR
          </button>
        }
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
