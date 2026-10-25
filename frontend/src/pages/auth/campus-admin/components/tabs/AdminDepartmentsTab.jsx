import { useState } from 'react';
import { Building2, Plus, Users, BookOpen, UserCog } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { Avatar } from '@/components/ui/Primitives';
import { MOCK_DEPARTMENTS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminDepartmentsTab = ({ triggerPopup }) => {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', hod: '', established: '' });

  const addDepartment = (event) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      triggerPopup('Department code and name are required.', 'error');
      return;
    }
    triggerPopup(`${form.code} · ${form.name} created with ${form.hod || 'HOD pending assignment'}.`, 'success');
    setAdding(false);
    setForm({ code: '', name: '', hod: '', established: '' });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Academics"
        title="Departments"
        description="Departments, streams and subjects that make up the academic structure."
        icon={Building2}
        tone="teal"
        actions={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Plus size={13} /> Add department
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MOCK_DEPARTMENTS.map((dept) => (
          <SectionCard
            key={dept.id}
            title={`${dept.code} · ${dept.name}`}
            description={`Est. ${dept.established} · HOD ${dept.hod}`}
            icon={Building2}
            tone={dept.tone}
            action={
              <button
                onClick={() => triggerPopup(`Opening department console for ${dept.code}.`, 'info')}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Manage
              </button>
            }
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Avatar name={dept.hod} size="sm" tone={dept.tone} />
                <div>
                  <p className="text-[10px] font-bold text-deepNavy">{dept.hod}</p>
                  <p className="text-[9px] font-semibold text-slate-500">Head of department</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {dept.streams.map((stream) => (
                  <span key={stream} className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                    {stream}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                  <Users size={11} className="text-slate-400" /> {dept.studentCount}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                  <UserCog size={11} className="text-slate-400" /> {dept.facultyCount}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                  <BookOpen size={11} className="text-slate-400" /> {dept.subjects}
                </div>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add department"
        description="The department becomes available in account creation and timetables immediately."
        tone="teal"
        footer={
          <button
            onClick={addDepartment}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            Create department
          </button>
        }
      >
        <form onSubmit={addDepartment} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Department code *">
            <input value={form.code} onChange={(event) => setForm((value) => ({ ...value, code: event.target.value }))} placeholder="CSB" className={inputClass} />
          </FormField>
          <FormField label="Full name *">
            <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="Computer Science & Business" className={inputClass} />
          </FormField>
          <FormField label="Head of department">
            <input value={form.hod} onChange={(event) => setForm((value) => ({ ...value, hod: event.target.value }))} placeholder="Dr. Full Name" className={inputClass} />
          </FormField>
          <FormField label="Established year">
            <input value={form.established} onChange={(event) => setForm((value) => ({ ...value, established: event.target.value }))} placeholder="2026" className={inputClass} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartmentsTab;
