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

const FormSkeleton = () => (
  <div className="grid gap-3 lg:grid-cols-3">
    <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      <Skeleton className="h-5 w-44" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-4 h-9 w-32" />
    </div>
    <CardSkeleton lines={7} />
  </div>
);

export const AdminTabSkeleton = ({ tab = 'overview' }) => {
  if (tab === 'overview' || tab === 'attendance' || tab === 'fees' || tab === 'coe' || tab === 'exams' || tab === 'faculty-leaves') {
    return (
      <div className="space-y-4">
        <StatsRow />
        <ListSkeleton />
      </div>
    );
  }
  if (tab === 'bento-hub' || tab === 'departments' || tab === 'digital-library') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <CardsSkeleton count={6} />
      </div>
    );
  }
  if (tab === 'users' || tab === 'marks') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <TableSkeleton rows={8} />
      </div>
    );
  }
  if (tab === 'account-creation' || tab === 'settings' || tab === 'feature-manager') return <FormSkeleton />;
  if (tab === 'notices' || tab === 'staff-notices') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-3 lg:grid-cols-3">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      </div>
    );
  }
  if (tab === 'org-calendar' || tab === 'timetable') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 space-y-3">
              <SkeletonText lines={3} />
              <SkeletonText lines={3} />
            </div>
          </div>
          <CardSkeleton lines={6} />
        </div>
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

export default AdminTabSkeleton;
