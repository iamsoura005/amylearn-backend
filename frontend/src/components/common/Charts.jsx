import { useId } from 'react';

export const Donut = ({ segments = [], size = 148, thickness = 14, centerLabel, centerValue, className = '' }) => {
  const total = segments.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const gradientId = useId();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {segments.map((segment) => {
            const length = ((Number(segment.value) || 0) / total) * circumference;
            const dash = `${Math.max(0, length - 3)} ${circumference - Math.max(0, length - 3)}`;
            const el = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color || '#1E63D6'}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return el;
          })}
          <defs>
            <linearGradient id={gradientId} />
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold leading-none text-deepNavy font-jost tabular">{centerValue}</span>
          {centerLabel ? <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">{centerLabel}</span> : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: segment.color }} />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="text-[11px] font-bold text-deepNavy tabular">
              {segment.display ?? `${Math.round(((Number(segment.value) || 0) / total) * 100)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const buildPath = (points, width, height, padding = 6) => {
  if (!points.length) return { line: '', area: '' };
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);
  const coords = points.map((value, index) => [
    padding + index * stepX,
    height - padding - ((value - min) / range) * (height - padding * 2)
  ]);
  const line = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height - padding} L${coords[0][0].toFixed(1)},${
    height - padding
  } Z`;
  return { line, area, coords };
};

export const TrendChart = ({ data = [], width = 560, height = 180, color = '#1E63D6', labels = [], suffix = '', className = '' }) => {
  const { line, area, coords } = buildPath(data, width, height, 10);
  const gradientId = useId();
  const last = data[data.length - 1];
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.22" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} x1="10" x2={width - 10} y1={height * ratio} y2={height * ratio} stroke="#eef2f7" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {coords?.length ? (
          <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill="#fff" stroke={color} strokeWidth="2.5" />
        ) : null}
      </svg>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex gap-3">
          {labels.map((label, index) => (
            <span key={`${label}-${index}`} className="text-[9px] font-semibold text-slate-500">
              {label}
            </span>
          ))}
        </div>
        {last !== undefined ? (
          <span className="text-[10px] font-bold text-deepNavy tabular">
            {last}
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export const BarChart = ({ data = [], height = 150, color = '#1E63D6', className = '' }) => {
  const max = Math.max(...data.map((item) => Number(item.value) || 0), 1);
  return (
    <div className={`flex items-end gap-2 ${className}`} style={{ height }}>
      {data.map((item) => (
        <div key={item.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[9px] font-bold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 tabular">
            {item.value}
          </span>
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${Math.max(6, ((Number(item.value) || 0) / max) * 100)}%`,
              background: item.color || color,
              opacity: item.dim ? 0.45 : 1
            }}
          />
          <span className="text-[9px] font-semibold text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const MiniBars = ({ data = [], color = '#21C7C4' }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-0.5">
      {data.map((value, index) => (
        <span
          key={index}
          className="w-1 rounded-sm opacity-80"
          style={{ height: `${Math.max(12, (value / max) * 100)}%`, background: color }}
        />
      ))}
    </div>
  );
};

export default Donut;
