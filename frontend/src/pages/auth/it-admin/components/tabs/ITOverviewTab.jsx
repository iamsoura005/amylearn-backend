import { useMemo, useState } from 'react';
import { Activity, Building2, LifeBuoy, Server, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { TrendChart } from '@/components/common/Charts';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, SoftStat } from '@/components/portal/PortalKit';
import {
  MOCK_PLATFORM_STATS,
  MOCK_INSTITUTIONS,
  MOCK_SUPPORT_REQUESTS,
  MOCK_AUDIT_EVENTS
} from '@/pages/auth/it-admin/constants/itAdminConstants';

const STAT_ICONS = {
  campuses: Building2,
  students: Sparkles,
  uptime: Server,
  tickets: LifeBuoy
};

const ITOverviewTab = ({ session, triggerPopup, setTab }) => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const signupTrend = useMemo(() => [5120, 5480, 5900, 6340, 6890, 7210, 7690, 8214], []);
  const signupLabels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

  const openHigh = MOCK_SUPPORT_REQUESTS.filter((ticket) => ticket.status === 'open' && ticket.priority === 'high').length;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="AmyLearn platform console"
        title={`${greeting}, ${session.name.split(' ')[0]}`}
        description="Multi-tenant health across all institutions, support load and platform activity."
        icon={Sparkles}
        tone="blue"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MOCK_PLATFORM_STATS.map((stat) => {
          const Icon = STAT_ICONS[stat.id] || Activity;
          return <SoftStat key={stat.id} label={stat.label} value={stat.value} hint={stat.hint} icon={Icon} tone={stat.tone} />;
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="Students across tenants"
          description="Cumulative active students"
          icon={Activity}
          tone="blue"
          className="lg:col-span-2"
        >
          <TrendChart data={signupTrend} labels={signupLabels} height={180} color="#1E63D6" />
        </SectionCard>

        <SectionCard title="Tenant status" description="Live, onboarding and suspended" icon={Building2} tone="blue">
          <div className="space-y-2">
            {MOCK_INSTITUTIONS.map((campus) => (
              <div key={campus.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-deepNavy">{campus.name}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{campus.code} · {campus.plan}</p>
                </div>
                <StatusBadge status={campus.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="Support queue"
          description={`${openHigh} high-priority open tickets`}
          icon={LifeBuoy}
          tone="amber"
          action={
            <button onClick={() => setTab('requests')} className="text-[10px] font-bold text-brandBlue hover:underline">
              Open queue
            </button>
          }
        >
          <div className="space-y-2">
            {MOCK_SUPPORT_REQUESTS.filter((ticket) => ticket.status === 'open').map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-slate-100 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[10px] font-bold text-deepNavy">{ticket.title}</p>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                    ticket.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-[9px] font-semibold text-slate-500">{ticket.id} · {ticket.campus} · {ticket.created}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Latest platform events"
          icon={Activity}
          tone="teal"
          action={
            <button onClick={() => setTab('audit')} className="text-[10px] font-bold text-brandBlue hover:underline">
              Full audit log
            </button>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-1.5">
            {MOCK_AUDIT_EVENTS.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-2.5 py-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-50 text-[9px] font-bold text-brandBlue">
                  {event.action.split('.')[0].slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-deepNavy">
                    {event.action} <span className="font-semibold text-slate-500">→ {event.target}</span>
                  </p>
                  <p className="text-[9px] font-semibold text-slate-500">{event.actor} · {event.detail}</p>
                </div>
                <span className="shrink-0 text-[8px] font-semibold text-slate-500 tabular">
                  {new Date(event.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ITOverviewTab;
