import { useState } from 'react';
import { Mail, Plus, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Primitives';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_PLATFORM_STAFF } from '@/pages/auth/it-admin/constants/itAdminConstants';

const ROLE_LABELS = {
  amylearn_admin: 'Platform admin',
  amylearn_manager: 'Operations manager',
  it_user: 'Support staff'
};

const ROLE_TONES = {
  amylearn_admin: 'bg-blue-50 text-brandBlue',
  amylearn_manager: 'bg-violet-50 text-violet-700',
  it_user: 'bg-teal-50 text-teal-700'
};

const ITUsersTab = ({ triggerPopup }) => {
  const [staff, setStaff] = useState(MOCK_PLATFORM_STAFF);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'it_user', tenants: 'All' });

  const invite = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      triggerPopup('Name and email are required.', 'error');
      return;
    }
    const next = {
      id: `stf-${Date.now()}`,
      ...form,
      label: ROLE_LABELS[form.role] || 'Support staff',
      status: 'invited',
      lastActive: '—'
    };
    setStaff((current) => [...current, next]);
    triggerPopup(`Invitation sent to ${form.email} with the ${next.label} role.`, 'success');
    setAdding(false);
    setForm({ name: '', email: '', role: 'it_user', tenants: 'All' });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="People"
        title="Platform staff"
        description="AmyLearn employees with console access and their tenant scopes."
        icon={Users}
        tone="blue"
        actions={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2.5 text-[11px] font-bold text-white hover:bg-brand-700"
          >
            <Plus size={13} /> Invite staff
          </button>
        }
      />

      <SectionCard title="Team" description={`${staff.length} staff members with console access`} icon={Users} tone="blue">
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Staff',
              render: (row) => (
                <span className="flex items-center gap-2">
                  <Avatar name={row.name} size="xs" tone="blue" />
                  <span className="font-bold text-deepNavy">{row.name}</span>
                </span>
              )
            },
            { key: 'email', label: 'Email', render: (row) => <span className="text-[10px] font-semibold text-slate-500">{row.email}</span> },
            {
              key: 'role',
              label: 'Role',
              render: (row) => (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${ROLE_TONES[row.role] || ROLE_TONES.it_user}`}>
                  {row.label}
                </span>
              )
            },
            { key: 'tenants', label: 'Tenant scope' },
            { key: 'lastActive', label: 'Last active' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'actions',
              label: '',
              sortable: false,
              render: (row) =>
                row.status === 'invited' ? (
                  <button
                    onClick={() => triggerPopup(`Invitation resent to ${row.email}.`, 'success')}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1.5 text-[9px] font-bold text-brandBlue hover:bg-blue-50"
                  >
                    <Mail size={10} /> Resend invite
                  </button>
                ) : null
            }
          ]}
          rows={staff}
          keyField="id"
          footer="Role changes require a re-sign-in to take effect."
        />
      </SectionCard>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Invite platform staff"
        description="An email invitation with a secure sign-in link will be sent."
        tone="blue"
        footer={
          <button
            onClick={invite}
            className="rounded-xl bg-brandBlue px-4 py-2 text-[11px] font-bold text-white hover:bg-brand-700"
          >
            Send invitation
          </button>
        }
      >
        <form onSubmit={invite} className="grid gap-3">
          <FormField label="Full name *">
            <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="Priya Raman" className={inputClass} />
          </FormField>
          <FormField label="Work email *">
            <input value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} type="email" placeholder="name@amylearn.app" className={inputClass} />
          </FormField>
          <FormField label="Role">
            <select value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value }))} className={inputClass}>
              <option value="it_user">Support staff</option>
              <option value="amylearn_manager">Operations manager</option>
              <option value="amylearn_admin">Platform admin</option>
            </select>
          </FormField>
          <FormField label="Tenant scope">
            <select value={form.tenants} onChange={(event) => setForm((value) => ({ ...value, tenants: event.target.value }))} className={inputClass}>
              {['All', 'NBR', 'GLX', 'CRB'].map((scope) => (
                <option key={scope}>{scope}</option>
              ))}
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default ITUsersTab;
