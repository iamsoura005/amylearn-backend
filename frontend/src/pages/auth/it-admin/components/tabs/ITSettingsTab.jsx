import { useState } from 'react';
import { KeyRound, Mail, Save, Settings, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_PLATFORM_SETTINGS } from '@/pages/auth/it-admin/constants/itAdminConstants';

const ITSettingsTab = ({ triggerPopup }) => {
  const [form, setForm] = useState(MOCK_PLATFORM_SETTINGS);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const save = (event) => {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      triggerPopup('Platform settings saved. Changes propagate to all tenants.', 'success');
    }, 600);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Platform-wide email, security and session configuration."
        icon={Settings}
        tone="blue"
      />

      <form onSubmit={save} className="grid gap-3 lg:grid-cols-3">
        <SectionCard title="Email gateway" description="Transactional mail for every tenant" icon={Mail} tone="blue" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="SMTP host">
              <input value={form.smtpHost} onChange={set('smtpHost')} className={inputClass} />
            </FormField>
            <FormField label="SMTP port">
              <input value={form.smtpPort} onChange={set('smtpPort')} type="number" className={inputClass} />
            </FormField>
            <FormField label="From address">
              <input value={form.smtpUser} onChange={set('smtpUser')} type="email" className={inputClass} />
            </FormField>
            <FormField label="Hourly rate limit">
              <input value={form.rateLimitPerHour} onChange={set('rateLimitPerHour')} type="number" className={inputClass} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Security" description="Auth and token policy" icon={ShieldCheck} tone="violet">
          <div className="space-y-3">
            <FormField label="JWT access TTL">
              <input value={form.jwtAccessTtl} onChange={set('jwtAccessTtl')} className={inputClass} />
            </FormField>
            <FormField label="Token blacklist retention">
              <input value={form.tokenBlacklistDays} onChange={set('tokenBlacklistDays')} type="number" className={inputClass} />
            </FormField>
            <FormField label="Max upload size (MB)">
              <input value={form.maxUploadMb} onChange={set('maxUploadMb')} type="number" className={inputClass} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Session TTLs" description="Per-role session durations" icon={KeyRound} tone="teal">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="IT admin (hrs)">
              <input value={form.sessionTtls.it} onChange={(event) => setForm((value) => ({ ...value, sessionTtls: { ...value.sessionTtls, it: event.target.value } }))} type="number" className={inputClass} />
            </FormField>
            <FormField label="Campus admin (hrs)">
              <input value={form.sessionTtls.campusAdmin} onChange={(event) => setForm((value) => ({ ...value, sessionTtls: { ...value.sessionTtls, campusAdmin: event.target.value } }))} type="number" className={inputClass} />
            </FormField>
            <FormField label="College (hrs)">
              <input value={form.sessionTtls.college} onChange={(event) => setForm((value) => ({ ...value, sessionTtls: { ...value.sessionTtls, college: event.target.value } }))} type="number" className={inputClass} />
            </FormField>
            <FormField label="Student (hrs)">
              <input value={form.sessionTtls.student} onChange={(event) => setForm((value) => ({ ...value, sessionTtls: { ...value.sessionTtls, student: event.target.value } }))} type="number" className={inputClass} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Danger zone" description="Platform-wide irreversible actions" icon={ShieldCheck} tone="rose">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => triggerPopup('All active sessions across every tenant have been revoked.', 'success')}
              className="w-full rounded-xl border border-rose-200 bg-rose-50/50 py-2.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
            >
              Revoke all sessions
            </button>
            <button
              type="button"
              onClick={() => triggerPopup('Maintenance banner shown to all portals. Sign-ins are unaffected.', 'info')}
              className="w-full rounded-xl border border-amber-200 bg-amber-50/50 py-2.5 text-[10px] font-bold text-amber-700 hover:bg-amber-50"
            >
              Enable maintenance banner
            </button>
          </div>
        </SectionCard>

        <div className="flex items-center gap-2 lg:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-5 py-2.5 text-[11px] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Save size={13} /> {saving ? 'Saving…' : 'Save settings'}
          </button>
          <span className="text-[9px] font-semibold text-slate-500">All platform changes are recorded in the audit log.</span>
        </div>
      </form>
    </div>
  );
};

export default ITSettingsTab;
