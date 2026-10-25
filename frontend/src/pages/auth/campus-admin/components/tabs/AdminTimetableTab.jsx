import { useMemo, useState } from 'react';
import { CalendarCheck, DoorOpen, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { SectionCard, FilterChips, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_TIMETABLE_BATCHES, MOCK_BATCH_TIMETABLE, MOCK_FACULTY } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const AdminTimetableTab = ({ triggerPopup }) => {
  const [batchId, setBatchId] = useState('cse5');
  const [day, setDay] = useState('Monday');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ time: '09:00 – 09:55', subject: '', code: '', faculty: '', room: '' });

  const batch = MOCK_TIMETABLE_BATCHES.find((item) => item.id === batchId) || MOCK_TIMETABLE_BATCHES[0];
  const week = MOCK_BATCH_TIMETABLE[batchId] || [];

  const daySlots = useMemo(() => week.find((entry) => entry.day === day)?.slots || [], [week, day]);

  const addSlot = (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.code.trim()) {
      triggerPopup('Subject and code are required.', 'error');
      return;
    }
    triggerPopup(`${form.code} · ${form.subject} added to ${batch.label} (${day}).`, 'success');
    setAdding(false);
    setForm({ time: '09:00 – 09:55', subject: '', code: '', faculty: '', room: '' });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Academics"
        title="Timetables"
        description="Batch-wise weekly schedules for the current term."
        icon={CalendarCheck}
        tone="teal"
        actions={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Plus size={13} /> Add class
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          options={MOCK_TIMETABLE_BATCHES.map((item) => ({ id: item.id, label: item.label }))}
          value={batchId}
          onChange={setBatchId}
          tone="teal"
        />
        <div className="flex flex-wrap gap-1">
          {DAYS.map((item) => (
            <button
              key={item}
              onClick={() => setDay(item)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                day === item ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
              }`}
            >
              {item.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <SectionCard
        title={`${batch.label} · ${day}`}
        description={`${daySlots.length} classes · ${batch.rooms} rooms allocated`}
        icon={CalendarCheck}
        tone="teal"
      >
        {daySlots.length ? (
          <div className="space-y-2">
            {daySlots.map((slot, index) => (
              <div key={`${slot.code}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-3.5 py-3">
                <div className="w-24 shrink-0 text-[10px] font-bold text-teal-700 tabular">{slot.time}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-extrabold text-deepNavy">{slot.subject}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{slot.code} · {slot.faculty}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">
                  <DoorOpen size={10} /> {slot.room}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-[11px] font-semibold text-slate-500">No classes scheduled for {day}. Add a class to start.</p>
          </div>
        )}
      </SectionCard>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add class"
        description={`Scheduled into ${batch.label} on ${day}.`}
        tone="teal"
        footer={
          <button
            onClick={addSlot}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            Add class
          </button>
        }
      >
        <form onSubmit={addSlot} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Subject *">
            <input value={form.subject} onChange={(event) => setForm((value) => ({ ...value, subject: event.target.value }))} placeholder="Database Management Systems" className={inputClass} />
          </FormField>
          <FormField label="Subject code *">
            <input value={form.code} onChange={(event) => setForm((value) => ({ ...value, code: event.target.value }))} placeholder="CS501" className={inputClass} />
          </FormField>
          <FormField label="Timing">
            <select value={form.time} onChange={(event) => setForm((value) => ({ ...value, time: event.target.value }))} className={inputClass}>
              {['09:00 – 09:55', '10:00 – 10:55', '11:10 – 12:05', '13:30 – 14:25', '14:30 – 15:25', '15:35 – 16:30'].map((slot) => (
                <option key={slot}>{slot}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Room">
            <input value={form.room} onChange={(event) => setForm((value) => ({ ...value, room: event.target.value }))} placeholder="AB-201" className={inputClass} />
          </FormField>
          <FormField label="Faculty" className="sm:col-span-2">
            <select value={form.faculty} onChange={(event) => setForm((value) => ({ ...value, faculty: event.target.value }))} className={inputClass}>
              <option value="">Assign faculty…</option>
              {MOCK_FACULTY.map((member) => (
                <option key={member.id} value={member.name}>{member.name} · {member.department}</option>
              ))}
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTimetableTab;
