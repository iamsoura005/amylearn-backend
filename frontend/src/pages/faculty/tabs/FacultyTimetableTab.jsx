import { useState } from 'react';
import { CalendarCheck, DoorOpen } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/portal/PortalKit';
import { MOCK_FACULTY_TIMETABLE } from '@/pages/faculty/constants/facultyConstants';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const FacultyTimetableTab = () => {
  const [day, setDay] = useState('Monday');
  const slots = MOCK_FACULTY_TIMETABLE[day] || [];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Teaching"
        title="My timetable"
        description="Weekly schedule with rooms. Changes are managed by the campus admin."
        icon={CalendarCheck}
        tone="indigo"
      />

      <div className="flex flex-wrap gap-1">
        {DAYS.map((item) => (
          <button
            key={item}
            onClick={() => setDay(item)}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-colors ${
              day === item ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <SectionCard title={day} description={`${slots.length} classes scheduled`} icon={CalendarCheck} tone="indigo">
        {slots.length ? (
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div key={`${slot.code}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-3.5 py-3">
                <div className="w-28 shrink-0 text-[10px] font-bold text-indigo-700 tabular">{slot.time}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-extrabold text-deepNavy">{slot.subject}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{slot.code} · {slot.class}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">
                  <DoorOpen size={10} /> {slot.room}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-[11px] font-semibold text-slate-500">No classes on {day}. Enjoy the break.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default FacultyTimetableTab;
