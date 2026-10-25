import { useState } from 'react';
import { Building, Clock, GraduationCap, MapPin, Save, Settings } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_INSTITUTION_SETTINGS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminSettingsTab = ({ triggerPopup }) => {
  const [form, setForm] = useState(MOCK_INSTITUTION_SETTINGS);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const save = (event) => {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      triggerPopup('Institution settings saved. Changes apply across all portals.', 'success');
    }, 600);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Institution profile, academic defaults and portal policies."
        icon={Settings}
        tone="teal"
      />

      <form onSubmit={save} className="grid gap-3 lg:grid-cols-3">
        <SectionCard title="Institution profile" description="Shown on portal headers and documents" icon={Building} tone="teal" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Institution name">
              <input value={form.name} onChange={set('name')} className={inputClass} />
            </FormField>
            <FormField label="College code" hint="Used in roll numbers and admit cards">
              <input value={form.code} onChange={set('code')} className={inputClass} />
            </FormField>
            <FormField label="Address" className="sm:col-span-2">
              <input value={form.address} onChange={set('address')} className={inputClass} />
            </FormField>
            <FormField label="Phone">
              <input value={form.phone} onChange={set('phone')} className={inputClass} />
            </FormField>
            <FormField label="Official email">
              <input value={form.email} onChange={set('email')} type="email" className={inputClass} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Academic defaults" description="Applied when creating new batches" icon={GraduationCap} tone="blue">
          <div className="space-y-3">
            <FormField label="Semester type">
              <select value={form.semesterType} onChange={set('semesterType')} className={inputClass}>
                {['Semester', 'Trimester'].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Academic year">
              <select value={form.academicYear} onChange={set('academicYear')} className={inputClass}>
                {['2026-27', '2027-28'].map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Grading scheme">
              <select value={form.gradingScheme} onChange={set('gradingScheme')} className={inputClass}>
                {['10-point CGPA', 'Percentage', 'Letter grades'].map((scheme) => (
                  <option key={scheme}>{scheme}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Attendance threshold (%)">
              <input value={form.attendanceThreshold} onChange={set('attendanceThreshold')} type="number" min={0} max={100} className={inputClass} />
            </FormField>
            <FormField label="Timezone">
              <select value={form.timezone} onChange={set('timezone')} className={inputClass}>
                {['Asia/Kolkata'].map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Policies" description="Library and session rules" icon={Clock} tone="amber" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Loan period (days)">
              <input value={form.loanDays} onChange={set('loanDays')} type="number" min={1} className={inputClass} />
            </FormField>
            <FormField label="Fine per day (₹)">
              <input value={form.finePerDay} onChange={set('finePerDay')} type="number" min={0} className={inputClass} />
            </FormField>
            <FormField label="Student session (hrs)">
              <input value={form.sessionHours.student} onChange={(event) => setForm((value) => ({ ...value, sessionHours: { ...value.sessionHours, student: event.target.value } }))} type="number" min={1} className={inputClass} />
            </FormField>
            <FormField label="Admin session (hrs)">
              <input value={form.sessionHours.campusAdmin} onChange={(event) => setForm((value) => ({ ...value, sessionHours: { ...value.sessionHours, campusAdmin: event.target.value } }))} type="number" min={1} className={inputClass} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Portal" description="Location and identity" icon={MapPin} tone="violet">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-[10px] font-semibold leading-relaxed text-slate-500">
              Session policies apply on next sign-in. Attendance threshold changes affect the COE eligibility check immediately.
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2">
              <span className="text-[10px] font-semibold text-slate-500">Tenant ID</span>
              <span className="font-mono text-[10px] font-bold text-deepNavy">nbr-2026</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2">
              <span className="text-[10px] font-semibold text-slate-500">Portal version</span>
              <span className="text-[10px] font-bold text-deepNavy">v1.0</span>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center gap-2 lg:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            <Save size={13} /> {saving ? 'Saving…' : 'Save settings'}
          </button>
          <span className="text-[9px] font-semibold text-slate-500">Changes are audited and visible to the platform team.</span>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsTab;
