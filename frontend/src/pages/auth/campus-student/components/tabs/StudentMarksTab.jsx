import {
  Award,
  BookOpenCheck,
  GraduationCap,
  Medal,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Donut, TrendChart } from '@/components/common/Charts';
import { Progress } from '@/components/ui/Primitives';
import { SectionCard, SoftStat } from './shared/StudentTabKit';
import { MOCK_MARKS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const CGPA_TREND = [7.82, 8.04, 8.21, 8.42];
const TREND_LABELS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

const gradeTone = (grade) => {
  if (grade === 'A+') return 'emerald';
  if (grade === 'A') return 'blue';
  if (grade === 'B+') return 'indigo';
  if (grade === '—') return 'slate';
  return 'amber';
};

export const StudentMarksTab = () => {
  const published = MOCK_MARKS.filter((item) => item.status === 'Published');
  const graded = published.length;
  const average = Math.round(published.reduce((sum, item) => sum + item.total, 0) / graded);
  const credits = MOCK_MARKS.reduce((sum, item) => sum + item.credits, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Semester 5 · results"
        title="Marks & results"
        description="Internal assessments, end-semester marks, grades and your cumulative grade point average."
        icon={GraduationCap}
        tone="violet"
        actions={<Badge tone="violet" dot>CGPA 8.42</Badge>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="CGPA" value="8.42" hint="Up 0.21 from last semester" icon={Medal} tone="violet" />
        <SoftStat label="Average marks" value={`${average}%`} hint={`${graded} papers published`} icon={Award} tone="blue" />
        <SoftStat label="Credits registered" value={credits} hint="Semester 5" icon={BookOpenCheck} tone="indigo" />
        <SoftStat label="Best grade" value="A+" hint="Discrete Mathematics" icon={TrendingUp} tone="emerald" />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <SectionCard title="CGPA trend" description="Semester-wise performance" icon={TrendingUp} tone="violet" className="xl:col-span-2" bodyClassName="p-4">
          <TrendChart data={CGPA_TREND} labels={TREND_LABELS} color="#7C4DFF" suffix=" CGPA" width={620} height={170} />
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {CGPA_TREND.map((value, index) => (
              <div key={TREND_LABELS[index]} className="rounded-lg bg-slate-50 px-1.5 py-1.5 text-center">
                <p className="text-[8px] font-bold uppercase text-slate-500">{TREND_LABELS[index]}</p>
                <p className={`text-[11px] font-extrabold ${index === CGPA_TREND.length - 1 ? 'text-violet-700' : 'text-slate-600'} tabular`}>{value.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Grade spread" description="Distribution across published papers" icon={Award} tone="emerald" bodyClassName="p-4">
          <Donut
            segments={[
              { label: 'A+', value: 1, color: '#10B981' },
              { label: 'A', value: 2, color: '#1E63D6' },
              { label: 'B+', value: 2, color: '#7C4DFF' }
            ]}
            centerValue="5"
            centerLabel="Published"
            size={128}
            thickness={13}
          />
          <div className="mt-3 rounded-xl bg-emerald-50/70 px-2.5 py-2">
            <p className="text-[9px] font-semibold leading-relaxed text-emerald-800">
              No backlogs in the current semester. CS301 Data Structures remains the only backlog paper.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Semester 5 marks"
        description="Internal (30) + end-semester (70) = 100 per paper"
        icon={GraduationCap}
        tone="violet"
        action={<Badge tone="amber">1 result pending</Badge>}
        bodyClassName="p-3"
      >
        <div className="space-y-2">
          {MOCK_MARKS.map((mark) => {
            const percent = mark.total ?? 0;
            return (
              <div key={mark.id} className={`rounded-xl border p-3 ${mark.status === 'Pending' ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[8px] font-extrabold text-violet-700">{mark.code}</span>
                      <span className="text-[8px] font-semibold text-slate-500">{mark.credits} credits</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] font-bold text-deepNavy">{mark.subject}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[14px] font-extrabold leading-none text-deepNavy font-jost tabular">
                      {mark.total ?? '—'}
                      <span className="text-[9px] font-semibold text-slate-500">/100</span>
                    </p>
                    <div className="mt-1 flex justify-end">
                      <Badge tone={gradeTone(mark.grade)}>{mark.grade}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <p className="text-[7.5px] font-bold uppercase tracking-wide text-slate-500">Internal</p>
                    <p className="text-[10px] font-bold text-deepNavy tabular">{mark.internal}/30</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <p className="text-[7.5px] font-bold uppercase tracking-wide text-slate-500">End semester</p>
                    <p className="text-[10px] font-bold text-deepNavy tabular">{mark.external ?? '—'}/70</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <StatusBadge status={mark.status} />
                  </div>
                </div>
                {mark.status === 'Published' ? <Progress value={percent} tone={percent >= 85 ? 'emerald' : percent >= 75 ? 'blue' : 'amber'} className="mt-2" thickness="h-1" /> : null}
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
          <Sparkles size={13} className="shrink-0 text-violet-500" />
          <p className="text-[9px] font-semibold leading-relaxed text-slate-500">
            Applied AI end-semester marks are awaiting moderation. Results are provisional until the examination committee
            publishes the final grade sheet.
          </p>
        </div>
      </SectionCard>
    </div>
  );
};

export default StudentMarksTab;
