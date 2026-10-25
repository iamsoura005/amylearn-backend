import { ArrowRight, LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_TAB_DESCRIPTIONS
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminBentoHubTab = ({ setTab }) => (
  <div className="space-y-4">
    <PageHeader
      eyebrow="Shortcuts"
      title="Quick hub"
      description="Every admin module, one tap away. Descriptions mirror the sidebar order."
      icon={LayoutGrid}
      tone="teal"
    />

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ADMIN_NAV_ITEMS.filter((item) => item.id !== 'overview' && item.id !== 'bento-hub').map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-bento"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
              <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-extrabold text-deepNavy font-jost">{item.label}</span>
                {item.badge ? (
                  <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-700">{item.badge}</span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
                {ADMIN_TAB_DESCRIPTIONS[item.id] || 'Open this module.'}
              </span>
            </span>
            <ArrowRight size={14} className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-teal-600" />
          </button>
        );
      })}
    </div>
  </div>
);

export default AdminBentoHubTab;
