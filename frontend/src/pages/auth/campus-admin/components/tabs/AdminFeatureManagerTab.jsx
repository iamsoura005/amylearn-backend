import { useMemo, useState } from 'react';
import { Info, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/portal/PortalKit';
import { Toggle } from '@/components/ui/Primitives';
import { MOCK_FEATURE_FLAGS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminFeatureManagerTab = ({ triggerPopup }) => {
  const [flags, setFlags] = useState(() => Object.fromEntries(MOCK_FEATURE_FLAGS.map((flag) => [flag.id, flag.defaultOn])));

  const toggle = (id) => {
    const next = !flags[id];
    setFlags((current) => ({ ...current, [id]: next }));
    const flag = MOCK_FEATURE_FLAGS.find((item) => item.id === id);
    triggerPopup(
      next
        ? `${flag.label} enabled for ${flag.roles.join(' and ')} roles.`
        : `${flag.label} disabled. Users will see the module hidden after their next refresh.`,
      next ? 'success' : 'info'
    );
  };

  const enabledCount = useMemo(() => Object.values(flags).filter(Boolean).length, [flags]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="System"
        title="Feature manager"
        description="Switch campus modules on or off. Platform-level flags set by AmyLearn take precedence."
        icon={SlidersHorizontal}
        tone="teal"
      />

      <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5">
        <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-[10px] font-semibold leading-relaxed text-blue-700">
          {enabledCount} of {MOCK_FEATURE_FLAGS.length} features are currently enabled. Disabled modules are hidden from
          the relevant portals but their data is preserved. Platform admins can override these choices at the AmyLearn
          console.
        </p>
      </div>

      <SectionCard title="Campus features" description="Toggle per module — changes apply instantly" icon={SlidersHorizontal} tone="teal">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_FEATURE_FLAGS.map((flag) => (
            <div
              key={flag.id}
              className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-colors ${
                flags[flag.id] ? 'border-slate-200/80 bg-white' : 'border-slate-100 bg-slate-50/60'
              }`}
            >
              <div className="min-w-0">
                <p className={`text-[11px] font-extrabold ${flags[flag.id] ? 'text-deepNavy' : 'text-slate-500'}`}>{flag.label}</p>
                <p className="mt-0.5 text-[9px] font-semibold leading-snug text-slate-500">{flag.description}</p>
                <p className="mt-1.5">
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                    {flag.roles.includes('all') ? 'All roles' : flag.roles.map((role) => role.charAt(0).toUpperCase() + role.slice(1)).join(' · ')}
                  </span>
                </p>
              </div>
              <Toggle checked={flags[flag.id]} onChange={() => toggle(flag.id)} label={flag.label} tone="teal" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default AdminFeatureManagerTab;
