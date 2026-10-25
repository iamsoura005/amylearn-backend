import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  Folder,
  GitBranch,
  Target,
  Users
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, Progress } from '@/components/ui/Primitives';
import { SectionCard, SoftStat, formatDay, daysUntil } from './shared/StudentTabKit';
import { MOCK_PROJECT } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const statusIcon = (status) => {
  if (status === 'Completed') return <CheckCircle2 size={15} className="text-emerald-500" />;
  if (status === 'In progress') return <Clock3 size={15} className="text-amber-500" />;
  return <Circle size={15} className="text-slate-300" />;
};

export const StudentProjectInfoTab = ({ triggerPopup }) => {
  const completed = MOCK_PROJECT.milestones.filter((item) => item.status === 'Completed').length;
  const progress = Math.round((completed / MOCK_PROJECT.milestones.length) * 100);
  const next = MOCK_PROJECT.milestones.find((item) => item.status !== 'Completed');
  const days = next ? daysUntil(next.due) : null;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Capstone workspace"
        title="Project information"
        description="Your final-year project abstract, guide, team responsibilities and milestone timeline."
        icon={Folder}
        tone="rose"
        actions={
          <div className="flex items-center gap-1.5">
            <Badge tone="rose" dot>{MOCK_PROJECT.status}</Badge>
            <Button
              variant="white"
              size="sm"
              icon={ExternalLink}
              onClick={() => triggerPopup?.('The project repository link has been shared with your guide.', 'info')}
            >
              Open repository
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Milestones" value={`${completed}/${MOCK_PROJECT.milestones.length}`} hint="Completed" icon={Target} tone="rose" />
        <SoftStat label="Team size" value={MOCK_PROJECT.team.length} hint="Members" icon={Users} tone="indigo" />
        <SoftStat label="Next review" value={next ? formatDay(next.due, 'd MMM') : '—'} hint={days !== null ? `in ${days} days` : ''} icon={CalendarClock} tone="amber" />
        <SoftStat label="Phase" value="Review 2" hint={MOCK_PROJECT.phase} icon={GitBranch} tone="violet" />
      </div>

      <SectionCard bodyClassName="p-4" className="relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-100/60 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="rose">{MOCK_PROJECT.phase}</Badge>
            <Badge tone="slate">Guide · {MOCK_PROJECT.guide}</Badge>
          </div>
          <h2 className="mt-2 max-w-3xl text-xl font-extrabold leading-tight text-deepNavy font-jost sm:text-2xl">{MOCK_PROJECT.title}</h2>
          <p className="mt-2 max-w-3xl text-[11.5px] leading-relaxed text-slate-600">{MOCK_PROJECT.abstract}</p>
          <div className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>Overall progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} tone="rose" className="mt-1.5" />
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-3 lg:grid-cols-5">
        <SectionCard title="Team" description="Roles and responsibilities" icon={Users} tone="indigo" className="lg:col-span-2" bodyClassName="p-3">
          <div className="space-y-1.5">
            {MOCK_PROJECT.team.map((member) => (
              <div key={member.name} className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-2.5 py-2">
                <Avatar name={member.name} size="sm" tone="indigo" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-bold text-deepNavy">{member.name}</p>
                  <p className="truncate text-[8.5px] font-semibold text-slate-500">{member.role}</p>
                </div>
                {member.name === 'Rohan Iyer' ? <Badge tone="indigo">You</Badge> : null}
              </div>
            ))}
          </div>
          <div className="mt-2.5 rounded-xl bg-slate-50 px-2.5 py-2">
            <p className="text-[9px] font-semibold leading-relaxed text-slate-500">
              <span className="font-bold text-slate-700">Repository: </span>
              {MOCK_PROJECT.repoNote}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Milestones" description="Reviews and submission dates" icon={Target} tone="rose" className="lg:col-span-3" bodyClassName="p-3.5">
          <div className="relative space-y-0.5 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-slate-200">
            {MOCK_PROJECT.milestones.map((milestone) => (
              <div key={milestone.id} className="relative flex items-start gap-3 py-1.5 pl-0.5">
                <span className="relative z-10 mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white">
                  {statusIcon(milestone.status)}
                </span>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className={`text-[10.5px] font-bold ${milestone.status === 'Upcoming' ? 'text-slate-500' : 'text-deepNavy'}`}>{milestone.label}</p>
                    <span className="text-[8.5px] font-semibold text-slate-500">{formatDay(milestone.due, 'd MMM')}</span>
                  </div>
                  <p className={`mt-0.5 text-[8.5px] font-semibold ${milestone.status === 'Completed' ? 'text-emerald-700' : milestone.status === 'In progress' ? 'text-amber-700' : 'text-slate-500'}`}>
                    {milestone.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Deliverables" description="What the final submission must include" icon={CheckCircle2} tone="emerald" bodyClassName="p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_PROJECT.deliverables.map((item, index) => (
            <div key={item} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-2.5 py-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-100 text-[9px] font-extrabold text-emerald-700">
                {index + 1}
              </span>
              <p className="text-[10px] font-bold text-deepNavy">{item}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default StudentProjectInfoTab;
