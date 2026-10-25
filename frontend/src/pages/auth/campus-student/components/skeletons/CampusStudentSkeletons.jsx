import { Skeleton, StatSkeleton, TableSkeleton, CardSkeleton, SkeletonText } from '@/components/ui/Skeleton';

const StatsRow = () => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <StatSkeleton key={index} />
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="grid gap-3 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <TableSkeleton rows={6} />
    </div>
    <CardSkeleton lines={6} />
  </div>
);

const CardsSkeleton = ({ count = 6 }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} lines={3} />
    ))}
  </div>
);

const CalendarSkeleton = () => (
  <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, index) => (
          <Skeleton key={index} className="h-11" />
        ))}
      </div>
    </div>
    <CardSkeleton lines={6} />
  </div>
);

const ViewerSkeleton = () => (
  <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="mt-3 aspect-video w-full" />
      <SkeletonText lines={3} className="mt-3" />
    </div>
    <CardSkeleton lines={7} />
  </div>
);

const AiSkeleton = () => (
  <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
    <div className="flex h-[560px] flex-col rounded-2xl border border-violet-100 bg-white p-4 shadow-2xs">
      <Skeleton className="h-10 w-48" />
      <div className="mt-4 flex-1 space-y-3">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="ml-auto h-12 w-2/3" />
        <Skeleton className="h-24 w-5/6" />
      </div>
      <Skeleton className="mt-3 h-10 w-full" />
    </div>
    <CardSkeleton lines={8} />
  </div>
);

export const StudentTabSkeleton = ({ tab = 'overview' }) => {
  if (tab === 'overview' || tab === 'profile') {
    return (
      <div className="space-y-4">
        <StatsRow />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TableSkeleton rows={5} />
          </div>
          <CardSkeleton lines={6} />
        </div>
      </div>
    );
  }
  if (tab === 'bento-hub' || tab === 'courses' || tab === 'digital-library' || tab === 'dept-notices' || tab === 'notices') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <CardsSkeleton count={6} />
      </div>
    );
  }
  if (tab === 'org-calendar' || tab === 'timetable' || tab === 'attendance') {
    return (
      <div className="space-y-4">
        <StatsRow />
        <CalendarSkeleton />
      </div>
    );
  }
  if (tab === 'ai-study') return <AiSkeleton />;
  if (tab === 'courses-viewer' || tab === 'project-info' || tab === 'exam-form' || tab === 'sem-feedback') return <ViewerSkeleton />;
  if (tab === 'marks' || tab === 'fees' || tab === 'payment-history' || tab === 'payment-details' || tab === 'admit-card') {
    return (
      <div className="space-y-4">
        <StatsRow />
        <ListSkeleton />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <StatsRow />
      <ListSkeleton />
    </div>
  );
};

export default StudentTabSkeleton;
