import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CalendarGrid, EventList } from '@/components/common/CalendarGrid';
import { Modal } from '@/components/ui/Modal';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_ORG_EVENTS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const EMPTY_EVENT = { title: '', type: 'event', date: '', time: '10:00', venue: '', organizer: 'Administration' };

const AdminOrgCalendarTab = ({ triggerPopup }) => {
  const [events, setEvents] = useState(MOCK_ORG_EVENTS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_EVENT);

  const dayEvents = useMemo(
    () => events.filter((event) => format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')),
    [events, selectedDate]
  );

  const addEvent = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date) {
      triggerPopup('Title and date are required.', 'error');
      return;
    }
    const next = { ...form, id: `ev-${Date.now()}`, tone: form.type === 'exam' ? 'rose' : form.type === 'deadline' ? 'amber' : 'teal' };
    setEvents((current) => [...current, next]);
    setSelectedDate(new Date(form.date));
    triggerPopup(`“${form.title}” added to the org calendar.`, 'success');
    setAdding(false);
    setForm(EMPTY_EVENT);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Communication"
        title="Org calendar"
        description="Institution-wide events, exams and deadlines visible to every portal."
        icon={Calendar}
        tone="teal"
        actions={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Plus size={13} /> Add event
          </button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <CalendarGrid events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} tone="teal" />
        <div className="space-y-3">
          <SectionCard
            title={format(selectedDate, 'EEEE, d MMMM')}
            description={`${dayEvents.length} event(s) on this day`}
            icon={Calendar}
            tone="teal"
          >
            <EventList events={dayEvents} empty="Nothing scheduled for this day." />
          </SectionCard>

          <SectionCard title="Upcoming" description="Next events across campus" icon={Calendar} tone="blue">
            <div className="space-y-2">
              {events
                .filter((event) => new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-2.5 py-2">
                    <div className={`h-8 w-1.5 shrink-0 rounded-full ${event.type === 'exam' ? 'bg-rose-400' : event.type === 'deadline' ? 'bg-amber-400' : 'bg-teal-500'}`} />
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

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add calendar event"
        description="Appears on student, faculty and staff calendars instantly."
        tone="teal"
        footer={
          <button
            onClick={addEvent}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            Add event
          </button>
        }
      >
        <form onSubmit={addEvent} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Title *" className="sm:col-span-2">
            <input value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="e.g. Guest lecture on cloud computing" className={inputClass} />
          </FormField>
          <FormField label="Type">
            <select value={form.type} onChange={(event) => setForm((value) => ({ ...value, type: event.target.value }))} className={inputClass}>
              {['event', 'exam', 'meeting', 'deadline'].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Organizer">
            <select value={form.organizer} onChange={(event) => setForm((value) => ({ ...value, organizer: event.target.value }))} className={inputClass}>
              {['Administration', 'Academics', 'COE', 'Student Affairs', 'Physical Education', 'R&D Cell', 'IQAC'].map((org) => (
                <option key={org}>{org}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Date *">
            <input value={form.date} onChange={(event) => setForm((value) => ({ ...value, date: event.target.value }))} type="date" className={inputClass} />
          </FormField>
          <FormField label="Time">
            <input value={form.time} onChange={(event) => setForm((value) => ({ ...value, time: event.target.value }))} className={inputClass} />
          </FormField>
          <FormField label="Venue" className="sm:col-span-2">
            <input value={form.venue} onChange={(event) => setForm((value) => ({ ...value, venue: event.target.value }))} placeholder="Main Auditorium" className={inputClass} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default AdminOrgCalendarTab;
