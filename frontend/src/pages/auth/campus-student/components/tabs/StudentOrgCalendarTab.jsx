import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, CalendarCheck, CalendarClock, CalendarDays, PartyPopper, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { CalendarGrid } from '@/components/common/CalendarGrid';
import { SectionCard, SoftStat, formatDay } from './shared/StudentTabKit';
import { MOCK_ORG_EVENTS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const TYPE_TONE = {
  exam: { badge: 'red', label: 'Exam' },
  deadline: { badge: 'violet', label: 'Deadline' },
  holiday: { badge: 'emerald', label: 'Holiday' },
  event: { badge: 'indigo', label: 'Event' }
};

export const StudentOrgCalendarTab = () => {
  const [type, setType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);

  const filtered = useMemo(
    () => (type === 'all' ? MOCK_ORG_EVENTS : MOCK_ORG_EVENTS.filter((event) => event.type === type)),
    [type]
  );

  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return filtered.filter((event) => event.date === key);
  }, [filtered, selectedDate]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return filtered
      .filter((event) => new Date(`${event.date}T23:59:59`) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Academic year 2026 – 27"
        title="Organisation calendar"
        description="Examinations, holidays, campus fests and fee deadlines across the institution."
        icon={Calendar}
        tone="blue"
        actions={<Badge tone="blue">{MOCK_ORG_EVENTS.length} events</Badge>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Upcoming" value={upcoming.length} hint="Next 60 days" icon={CalendarClock} tone="blue" />
        <SoftStat label="Exams" value={MOCK_ORG_EVENTS.filter((event) => event.type === 'exam').length} hint="November window" icon={CalendarCheck} tone="rose" />
        <SoftStat label="Deadlines" value={MOCK_ORG_EVENTS.filter((event) => event.type === 'deadline').length} hint="Fees and reviews" icon={AlertTriangle} tone="violet" />
        <SoftStat label="Holidays" value={MOCK_ORG_EVENTS.filter((event) => event.type === 'holiday').length} hint="Campus closed" icon={PartyPopper} tone="emerald" />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {[
          { id: 'all', label: 'All events' },
          { id: 'exam', label: 'Exams' },
          { id: 'deadline', label: 'Deadlines' },
          { id: 'event', label: 'Campus events' },
          { id: 'holiday', label: 'Holidays' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setType(item.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
              type === item.id ? 'bg-brandBlue text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CalendarGrid
            events={filtered}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            tone="blue"
            className="h-full"
          />
        </div>

        <div className="space-y-3">
          {selectedDate ? (
            <SectionCard
              title={format(selectedDate, 'EEEE, d MMMM')}
              description={`${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'} on this day`}
              icon={CalendarDays}
              tone="blue"
              action={
                <button onClick={() => setSelectedDate(null)} className="text-[9px] font-bold text-blue-700 hover:underline">
                  Clear
                </button>
              }
              bodyClassName="p-3"
            >
              {dayEvents.length ? (
                <div className="space-y-1.5">
                  {dayEvents.map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-100 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={TYPE_TONE[event.type]?.badge || 'slate'}>{TYPE_TONE[event.type]?.label || event.type}</Badge>
                        <span className="text-[8.5px] font-semibold text-slate-500">{event.time}</span>
                      </div>
                      <p className="mt-1.5 text-[10.5px] font-bold leading-snug text-deepNavy">{event.title}</p>
                      <p className="mt-0.5 text-[8.5px] font-semibold text-slate-500">{event.venue}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-[10.5px] font-semibold text-slate-500">No events on this day.</p>
              )}
            </SectionCard>
          ) : null}

          <SectionCard title="Coming up" description="Next events on the academic calendar" icon={CalendarDays} tone="indigo" bodyClassName="p-2">
            <div className="space-y-0.5">
              {upcoming.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedDate(new Date(`${event.date}T12:00:00`))}
                  className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex w-9 shrink-0 flex-col items-center rounded-lg bg-slate-50 py-1">
                    <span className="text-[7.5px] font-bold uppercase text-slate-500">{formatDay(event.date, 'MMM')}</span>
                    <span className="text-[13px] font-extrabold leading-none text-deepNavy font-jost">{formatDay(event.date, 'd')}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10.5px] font-bold text-deepNavy">{event.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[8.5px] font-semibold text-slate-500">
                      <Badge tone={TYPE_TONE[event.type]?.badge || 'slate'}>{TYPE_TONE[event.type]?.label || event.type}</Badge>
                      {event.time}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default StudentOrgCalendarTab;
