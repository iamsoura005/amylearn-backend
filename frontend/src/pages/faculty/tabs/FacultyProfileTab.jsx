import { useState } from 'react';
import { CalendarDays, GraduationCap, Mail, Phone, User } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, FormField, inputClass, formatDay } from '@/components/portal/PortalKit';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Primitives';
import {
  MOCK_FACULTY,
  MOCK_FACULTY_COURSES,
  MOCK_FACULTY_LEAVES
} from '@/pages/faculty/constants/facultyConstants';

const FacultyProfileTab = ({ session, triggerPopup }) => {
  const [form, setForm] = useState({ phone: session.phone, specialization: session.specialization });
  const [leave, setLeave] = useState({ from: '', to: '', type: 'Personal', reason: '' });

  const applyLeave = (event) => {
    event.preventDefault();
    if (!leave.from || !leave.to || !leave.reason.trim()) {
      triggerPopup('Leave dates and reason are required.', 'error');
      return;
    }
    triggerPopup(`Leave request submitted for ${formatDay(leave.from)} → ${formatDay(leave.to)}. The campus admin will review it.`, 'success');
    setLeave({ from: '', to: '', type: 'Personal', reason: '' });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Your identity, contact details and leave requests."
        icon={User}
        tone="indigo"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard title="Identity" description="Managed by the campus admin" icon={User} tone="indigo">
          <div className="flex flex-col items-center gap-3 py-2">
            <Avatar name={session.name} size="xl" tone="indigo" />
            <div className="text-center">
              <p className="text-sm font-extrabold text-deepNavy font-jost">{session.name}</p>
              <p className="text-[10px] font-semibold text-slate-500">{session.designation} · {session.department}</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold text-indigo-700">{session.employeeId}</span>
            <div className="w-full space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <Mail size={12} className="text-slate-400" /> {session.email}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <Phone size={12} className="text-slate-400" /> {session.phone}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <GraduationCap size={12} className="text-slate-400" /> Joined {formatDay(session.joined)}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Contact & specialisation" description="Editable by you" icon={Phone} tone="blue" className="lg:col-span-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              triggerPopup('Profile details updated.', 'success');
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <FormField label="Phone">
              <input value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} className={inputClass} />
            </FormField>
            <FormField label="Specialisation" className="sm:col-span-2">
              <input value={form.specialization} onChange={(event) => setForm((value) => ({ ...value, specialization: event.target.value }))} className={inputClass} />
            </FormField>
            <div>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-indigo-700"
              >
                Save profile
              </button>
            </div>
          </form>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-[11px] font-extrabold text-deepNavy font-jost">My courses</p>
            <div className="flex flex-wrap gap-1.5">
              {MOCK_FACULTY_COURSES.map((course) => (
                <span key={course.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                  {course.code} · {course.subject}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Leave requests" description="Approved by the campus admin" icon={CalendarDays} tone="violet" className="lg:col-span-2">
          <div className="space-y-2">
            {MOCK_FACULTY_LEAVES.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-deepNavy tabular">{formatDay(item.from)} → {formatDay(item.to)}</p>
                  <p className="truncate text-[9px] font-semibold text-slate-500">{item.reason}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
          <form onSubmit={applyLeave} className="mt-3 grid gap-3 rounded-2xl border border-violet-100 bg-violet-50/30 p-3.5 sm:grid-cols-2">
            <FormField label="From *">
              <input value={leave.from} onChange={(event) => setLeave((value) => ({ ...value, from: event.target.value }))} type="date" className={inputClass} />
            </FormField>
            <FormField label="To *">
              <input value={leave.to} onChange={(event) => setLeave((value) => ({ ...value, to: event.target.value }))} type="date" className={inputClass} />
            </FormField>
            <FormField label="Type">
              <select value={leave.type} onChange={(event) => setLeave((value) => ({ ...value, type: event.target.value }))} className={inputClass}>
                {['Personal', 'Medical', 'Conference', 'Other'].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Reason *">
              <input value={leave.reason} onChange={(event) => setLeave((value) => ({ ...value, reason: event.target.value }))} placeholder="Brief reason" className={inputClass} />
            </FormField>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-violet-700"
              >
                Submit leave request
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Term stats" description="Your teaching footprint" icon={GraduationCap} tone="emerald">
          <div className="space-y-2">
            {[
              { label: 'Courses', value: MOCK_FACULTY_COURSES.length },
              { label: 'Total students', value: 124 },
              { label: 'Weekly load', value: '16 hrs' },
              { label: 'Classes marked this month', value: '38/42' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2">
                <span className="text-[10px] font-semibold text-slate-500">{item.label}</span>
                <span className="text-[10px] font-bold text-deepNavy tabular">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default FacultyProfileTab;
