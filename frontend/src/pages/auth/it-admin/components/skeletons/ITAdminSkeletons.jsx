import { Skeleton, StatSkeleton, TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

const StatsRow = () => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <StatSkeleton key={index} />
    ))}
  </div>
);

export const ITTabSkeleton = ({ tab = 'overview' }) => {
  if (tab === 'overview') {
    return (
      <div className="space-y-4">
        <StatsRow />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TableSkeleton rows={6} />
          </div>
          <CardSkeleton lines={6} />
        </div>
      </div>
    );
  }
  if (tab === 'institutions' || tab === 'users' || tab === 'audit') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <TableSkeleton rows={8} />
      </div>
    );
  }
  if (tab === 'requests') {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }
  if (tab === 'settings') {
    return (
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <Skeleton className="h-5 w-44" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
        <CardSkeleton lines={7} />
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

export default ITTabSkeleton;
