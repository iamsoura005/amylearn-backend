import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Info, SlidersHorizontal } from 'lucide-react';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/portal/PortalKit';
import { Toggle } from '@/components/ui/Primitives';
import { useAuth } from '@/context/AuthContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import {
  MOCK_PLATFORM_FEATURES,
  MOCK_INSTITUTIONS
} from '@/pages/auth/it-admin/constants/itAdminConstants';

const FeatureManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerPopup } = useErrorPopup();
  const [flags, setFlags] = useState(() => Object.fromEntries(MOCK_PLATFORM_FEATURES.map((flag) => [flag.id, flag.defaultOn])));
  const [overrides, setOverrides] = useState(() =>
    Object.fromEntries(MOCK_INSTITUTIONS.map((campus) => [campus.id, { ai_video_breakdown: campus.id === 'nbr' }]))
  );

  const enabledCount = useMemo(() => Object.values(flags).filter(Boolean).length, [flags]);

  const toggleGlobal = (id) => {
    const next = !flags[id];
    setFlags((current) => ({ ...current, [id]: next }));
    const flag = MOCK_PLATFORM_FEATURES.find((item) => item.id === id);
    triggerPopup(
      next
        ? `${flag.label} enabled platform-wide.`
        : `${flag.label} disabled for every tenant. Per-tenant overrides are paused.`,
      next ? 'success' : 'info'
    );
  };

  const toggleOverride = (campusId, flagId) => {
    setOverrides((current) => ({
      ...current,
      [campusId]: { ...(current[campusId] || {}), [flagId]: !current[campusId]?.[flagId] }
    }));
    const campus = MOCK_INSTITUTIONS.find((item) => item.id === campusId);
    const flag = MOCK_PLATFORM_FEATURES.find((item) => item.id === flagId);
    triggerPopup(`Override applied: ${flag.label} ${overrides[campusId]?.[flagId] ? 'off' : 'on'} for ${campus.code}.`, 'success');
  };

  const liveCampuses = MOCK_INSTITUTIONS.filter((campus) => campus.status === 'live').slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F2F6FC]">
      <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center gap-3 px-3 sm:px-5">
          <button
            onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brandBlue hover:bg-blue-100"
            aria-label="Back to console"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <AmyLearnLogo size={28} />
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:block">
              Platform feature flags
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-brandBlue sm:block">
              {user?.name || 'Platform admin'}
            </span>
            <Link
              to="/it-admin"
              className="rounded-xl bg-brandBlue px-4 py-2 text-[10px] font-bold text-white hover:bg-brand-700"
            >
              Console
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-4 px-3 pb-10 pt-4 sm:px-5 sm:pt-6">
        <PageHeader
          eyebrow="Platform console · System"
          title="Feature flags"
          description="Global platform features and per-tenant overrides. Campus admins can further narrow these inside their own feature manager."
          icon={SlidersHorizontal}
          tone="blue"
        />

        <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5">
          <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-[10px] font-semibold leading-relaxed text-blue-700">
            {enabledCount} of {MOCK_PLATFORM_FEATURES.length} platform features enabled. A disabled global feature is hidden
            everywhere; an override re-enables it only for the selected tenant. Beta features ship off by default.
          </p>
        </div>

        <SectionCard title="Platform features" description="Applies to every tenant unless overridden" icon={SlidersHorizontal} tone="blue">
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {MOCK_PLATFORM_FEATURES.map((flag) => (
              <div
                key={flag.id}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-colors ${
                  flags[flag.id] ? 'border-slate-200/80 bg-white' : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-[11px] font-extrabold ${flags[flag.id] ? 'text-deepNavy' : 'text-slate-500'}`}>{flag.label}</p>
                  <p className="mt-0.5 text-[9px] font-semibold leading-snug text-slate-500">{flag.description}</p>
                </div>
                <Toggle checked={flags[flag.id]} onChange={() => toggleGlobal(flag.id)} label={flag.label} tone="blue" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Per-tenant overrides"
          description="Toggle a feature for a specific campus regardless of the global default"
          icon={Building2}
          tone="violet"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Feature</th>
                  {liveCampuses.map((campus) => (
                    <th key={campus.id} className="px-3 py-2.5 text-center">
                      <span className="block text-[10px] font-bold text-deepNavy">{campus.code}</span>
                      <span className="block text-[8px] font-semibold text-slate-500">{campus.name.split(' ')[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_PLATFORM_FEATURES.filter((flag) => flag.id !== 'notices' && flag.id !== 'org_calendar' && flag.id !== 'fees_module' && flag.id !== 'attendance_tracking' && flag.id !== 'staff_notices').map((flag) => (
                  <tr key={flag.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-2">
                      <p className="text-[10px] font-bold text-deepNavy">{flag.label}</p>
                      <p className="text-[8px] font-semibold text-slate-500">
                        {flags[flag.id] ? 'On globally' : 'Off globally'}
                      </p>
                    </td>
                    {liveCampuses.map((campus) => {
                      const overridden = Boolean(overrides[campus.id]?.[flag.id]);
                      return (
                        <td key={campus.id} className="px-3 py-2 text-center">
                          <button
                            onClick={() => toggleOverride(campus.id, flag.id)}
                            className={`mx-auto block h-6 w-11 rounded-full transition-colors ${
                              overridden ? 'bg-violet-600' : 'bg-slate-200'
                            }`}
                            role="switch"
                            aria-checked={overridden}
                            aria-label={`${flag.label} for ${campus.code}`}
                          >
                            <span
                              className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                overridden ? 'translate-x-[22px]' : 'translate-x-0.5'
                              }`}
                              style={{ marginTop: 2 }}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[9px] font-semibold text-slate-500">
            Overrides only affect the listed live campuses. New tenants inherit the global defaults.
          </p>
        </SectionCard>
      </main>
    </div>
  );
};

export default FeatureManager;
