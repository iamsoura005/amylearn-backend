export const Skeleton = ({ className = '' }) => <div className={`shimmer-block rounded-xl ${className}`} />;

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} className={`h-3 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-8 rounded-xl" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="mt-4 h-6 w-24" />
    <Skeleton className="mt-2 h-3 w-32" />
  </div>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
    <Skeleton className="h-5 w-40" />
    <div className="mt-4 space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  </div>
);

export const CardSkeleton = ({ lines = 4 }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
    <Skeleton className="h-8 w-8 rounded-xl" />
    <Skeleton className="mt-4 h-5 w-2/3" />
    <SkeletonText lines={lines} className="mt-3" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatSkeleton key={index} />
      ))}
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <TableSkeleton rows={5} />
      </div>
      <CardSkeleton lines={5} />
    </div>
  </div>
);

export default Skeleton;
