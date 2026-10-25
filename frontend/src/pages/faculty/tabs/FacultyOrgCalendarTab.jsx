import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CalendarGrid, EventList } from '@/components/common/CalendarGrid';
import { SectionCard } from '@/components/portal/PortalKit';
import { MOCK_FACULTY_ORG_EVENTS } from '@/pages/faculty/constants/facultyConstants';

const FacultyOrgCalendarTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dayEvents = useMemo(
    () =>
      MOCK_FACULTY_ORG_EVENTS.filter(
        (event) => format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      ),
    [selectedDate]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Communication"
        title="Org calendar"
        description="Institution events, meetings and deadlines relevant to you."
        icon={Calendar}
        tone="indigo"
      />

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <CalendarGrid events={MOCK_FACULTY_ORG_EVENTS} selectedDate={selectedDate} onSelectDate={setSelectedDate} tone="indigo" />
        <div className="space-y-3">
          <SectionCard
            title={format(selectedDate, 'EEEE, d MMMM')}
            description={`${dayEvents.length} event(s) on this day`}
            icon={Calendar}
            tone="indigo"
          >
            <EventList events={dayEvents} empty="Nothing scheduled for this day." />
          </SectionCard>

          <SectionCard title="Upcoming" description="Next events on campus" icon={Calendar} tone="blue">
            <div className="space-y-2">
              {MOCK_FACULTY_ORG_EVENTS.filter((event) => new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((event) => (
                  <div key={event.id} className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-2.5 py-2">
                    <div className={`h-8 w-1.5 shrink-0 rounded-full ${event.type === 'exam' ? 'bg-rose-400' : event.type === 'deadline' ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold text-deepNavy">{event.title}</p>
                      <p className="flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                        {format(new Date(event.date), 'd MMM')} · {event.time}
                        <MapPin size={9} className="ml-1" /> {event.venue}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default FacultyOrgCalendarTab;
