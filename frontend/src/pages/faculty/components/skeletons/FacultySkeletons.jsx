import { Skeleton, StatSkeleton, TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

const StatsRow = () => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <StatSkeleton key={index} />
    ))}
  </div>
);

export const FacultyTabSkeleton = ({ tab = 'overview' }) => {
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
  if (tab === 'timetable' || tab === 'attendance' || tab === 'org-calendar') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-40 w-full" />
          </div>
          <CardSkeleton lines={6} />
        </div>
      </div>
    );
  }
  if (tab === 'students') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <TableSkeleton rows={8} />
      </div>
    );
  }
  if (tab === 'notices' || tab === 'digital-library') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} lines={4} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <StatsRow />
      <TableSkeleton rows={6} />
    </div>
  );
};

export default FacultyTabSkeleton;
