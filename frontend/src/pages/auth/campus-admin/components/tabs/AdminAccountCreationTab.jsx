import { useState } from 'react';
import { Download, FileSpreadsheet, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { FilterChips } from '@/components/portal/PortalKit';
import FileDropzone from '@/components/common/FileDropzone';
import {
  MOCK_DEPARTMENTS,
  MOCK_ACCOUNT_TEMPLATES
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const KIND_FILTERS = [
  { id: 'single', label: 'Single account' },
  { id: 'bulk', label: 'Bulk import' }
];

const EMPTY_FORM = {
  kind: 'student',
  name: '',
  identifier: '',
  email: '',
  department: '',
  semester: '1',
  designation: 'Assistant Professor',
  password: ''
};

const AdminAccountCreationTab = ({ triggerPopup }) => {
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.identifier.trim() || !form.email.trim() || !form.department) {
      triggerPopup('Please fill all required fields before creating the account.', 'error');
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      triggerPopup(`Account for ${form.name} created. Welcome email sent to ${form.email}.`, 'success');
      setForm(EMPTY_FORM);
    }, 600);
  };

  const importFile = () => {
    if (!files.length) {
      triggerPopup('Attach a CSV file first.', 'error');
      return;
    }
    triggerPopup(`${files[0].name} queued for import. Rows will be validated against the template.`, 'success');
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="People"
        title="Account creation"
        description="Create student or faculty accounts one at a time, or import an entire batch from CSV."
        icon={UserPlus}
        tone="teal"
      />

      <FilterChips options={KIND_FILTERS} value={mode} onChange={setMode} tone="teal" />

      {mode === 'single' ? (
        <div className="grid gap-3 lg:grid-cols-3">
          <form onSubmit={submit} className="lg:col-span-2">
            <SectionCard
              title="New account"
              description="Credentials are delivered to the email address"
              icon={UserPlus}
              tone="teal"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Account type" className="sm:col-span-2">
                  <div className="mt-1.5 flex gap-2">
                    {['student', 'faculty'].map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setForm((value) => ({ ...value, kind }))}
                        className={`rounded-lg border px-3 py-2 text-[10px] font-bold capitalize ${
                          form.kind === kind
                            ? 'border-teal-300 bg-teal-50 text-teal-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
                        }`}
                      >
                        {kind}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Full name *">
                  <input value={form.name} onChange={set('name')} placeholder={form.kind === 'student' ? 'Aarav Sharma' : 'Dr. Ramesh Bhat'} className={inputClass} />
                </FormField>
                <FormField label={form.kind === 'student' ? 'Roll number *' : 'Employee ID *'}>
                  <input value={form.identifier} onChange={set('identifier')} placeholder={form.kind === 'student' ? 'NBR2026CS101' : 'FAC-CSE-101'} className={inputClass} />
                </FormField>
                <FormField label="Email address *">
                  <input value={form.email} onChange={set('email')} type="email" placeholder={form.kind === 'student' ? 'student@student.nbr.edu' : 'faculty@nbr.edu'} className={inputClass} />
                </FormField>
                <FormField label="Department *">
                  <select value={form.department} onChange={set('department')} className={inputClass}>
                    <option value="">Select department…</option>
                    {MOCK_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.code}>{dept.code} · {dept.name}</option>
                    ))}
                  </select>
                </FormField>
                {form.kind === 'student' ? (
                  <FormField label="Semester">
                    <select value={form.semester} onChange={set('semester')} className={inputClass}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </FormField>
                ) : (
                  <FormField label="Designation">
                    <select value={form.designation} onChange={set('designation')} className={inputClass}>
                      {['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor'].map((designation) => (
                        <option key={designation}>{designation}</option>
                      ))}
                    </select>
                  </FormField>
                )}
                <FormField label="Initial password" hint="Leave blank to auto-generate a secure one.">
                  <input value={form.password} onChange={set('password')} type="password" placeholder="Auto-generated if empty" className={inputClass} />
                </FormField>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : `Create ${form.kind} account`}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(EMPTY_FORM)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </SectionCard>
          </form>

          <SectionCard title="Templates" description="CSV formats for bulk import" icon={FileSpreadsheet} tone="blue">
            <div className="space-y-3">
              {MOCK_ACCOUNT_TEMPLATES.map((template) => (
                <div key={template.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[11px] font-bold text-deepNavy">{template.label}</p>
                  <p className="mt-1 text-[9px] font-semibold text-slate-500">{template.format}</p>
                  <p className="mt-1 rounded-md bg-slate-50 px-2 py-1.5 font-mono text-[8.5px] text-slate-500">{template.sample}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-slate-500">{template.count}</span>
                    <button
                      onClick={() => triggerPopup('Template downloaded. Fill it in and re-upload under Bulk import.', 'info')}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-[9px] font-bold text-blue-700 hover:bg-blue-50"
                    >
                      <Download size={10} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          <SectionCard
            title="Bulk import"
            description="Upload a filled CSV template to create accounts in bulk"
            icon={FileSpreadsheet}
            tone="teal"
            className="lg:col-span-2"
          >
            <FileDropzone
              onFiles={setFiles}
              multiple={false}
              maxSizeMb={5}
              tone="teal"
              label="Drop the CSV file here"
              hint="Students: up to 500 rows · Faculty: up to 100 rows"
            />
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={importFile}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
              >
                Validate & import
              </button>
              <span className="text-[9px] font-semibold text-slate-500">
                Accounts are created only after every row passes validation.
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Recent imports" description="Batches processed this term" icon={UserPlus} tone="blue">
            <div className="space-y-2">
              {[
                { batch: 'CSE Sem 3 intake', rows: 64, ok: 64, date: '2026-10-08' },
                { batch: 'AI&DS Sem 3 intake', rows: 58, ok: 58, date: '2026-10-08' },
                { batch: 'Visiting faculty (ECE)', rows: 4, ok: 3, date: '2026-09-27' }
              ].map((row) => (
                <div key={row.batch} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold text-deepNavy">{row.batch}</p>
                    <p className="text-[9px] font-semibold text-slate-500">{row.date} · {row.rows} rows</p>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${row.ok === row.rows ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {row.ok}/{row.rows} created
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default AdminAccountCreationTab;
