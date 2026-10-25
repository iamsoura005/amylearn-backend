import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TYPE_TONE = {
  exam: 'bg-red-500',
  holiday: 'bg-emerald-500',
  event: 'bg-indigo-500',
  class: 'bg-brandBlue',
  meeting: 'bg-amber-500',
  deadline: 'bg-violet-500',
  default: 'bg-slate-400'
};

export const CalendarGrid = ({
  events = [],
  initialMonth = new Date(),
  onSelectDate,
  selectedDate,
  compact = false,
  tone = 'indigo',
  className = ''
}) => {
  const [month, setMonth] = useState(initialMonth);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const key = format(new Date(event.date), 'yyyy-MM-dd');
      map[key] = [...(map[key] || []), event];
    });
    return map;
  }, [events]);

  const toneClasses = {
    indigo: 'bg-indigo-600',
    blue: 'bg-brandBlue',
    teal: 'bg-teal-600',
    violet: 'bg-violet-600'
  };

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs ${className}`}>
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-extrabold text-deepNavy font-jost">{format(month, 'MMMM yyyy')}</p>
          <p className="text-[10px] text-slate-500">{events.filter((e) => isSameMonth(new Date(e.date), month)).length} events this month</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth((value) => addMonths(value, -1))}
            className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-deepNavy"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={() => setMonth((value) => addMonths(value, 1))}
            className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-deepNavy"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="pb-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-500">
            {compact ? day[0] : day}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[key] || [];
          const selected = selectedDate && format(new Date(selectedDate), 'yyyy-MM-dd') === key;
          return (
            <button
              key={key}
              onClick={() => onSelectDate?.(day)}
              className={`group relative flex flex-col items-center justify-start rounded-lg border p-1 transition-colors ${
                compact ? 'min-h-[38px]' : 'min-h-[58px]'
              } ${
                selected
                  ? `${toneClasses[tone]} border-transparent text-white`
                  : isToday(day)
                    ? 'border-brandBlue/30 bg-blue-50/60 text-deepNavy'
                    : isSameMonth(day, month)
                      ? 'border-transparent text-slate-700 hover:bg-slate-50'
                      : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[11px] font-bold ${isToday(day) && !selected ? 'text-brandBlue' : ''}`}>
                {format(day, 'd')}
              </span>
              {!compact && dayEvents.length ? (
                <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((event, index) => (
                    <span
                      key={index}
                      className={`h-1 w-1 rounded-full ${selected ? 'bg-white/80' : TYPE_TONE[event.type] || TYPE_TONE.default}`}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
      {!compact ? (
        <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
          {Object.entries(TYPE_TONE)
            .filter(([key]) => key !== 'default')
            .slice(0, 5)
            .map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 text-[9px] font-semibold capitalize text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${value}`} />
                {key}
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );
};

export const EventList = ({ events = [], onSelect, empty = 'No events scheduled.' }) => (
  <div className="space-y-2">
    {events.length === 0 ? <p className="py-6 text-center text-xs text-slate-400">{empty}</p> : null}
    {events.map((event) => (
      <button
        key={event.id}
        onClick={() => onSelect?.(event)}
        className="flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-white p-2.5 text-left transition-colors hover:border-slate-200 hover:bg-slate-50/60"
      >
        <span className="flex w-9 shrink-0 flex-col items-center rounded-lg bg-slate-50 py-1">
          <span className="text-[8px] font-bold uppercase text-slate-500">{format(new Date(event.date), 'MMM')}</span>
          <span className="text-sm font-extrabold leading-none text-deepNavy font-jost">{format(new Date(event.date), 'd')}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-bold text-deepNavy">{event.title}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold capitalize text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${TYPE_TONE[event.type] || TYPE_TONE.default}`} />
            {event.type || 'event'}
            {event.time ? ` · ${event.time}` : ''}
          </span>
        </span>
      </button>
    ))}
  </div>
);

export default CalendarGrid;
