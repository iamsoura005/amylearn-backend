import { useMemo, useState } from 'react';
import { ArrowUpRight, LayoutGrid, Search, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/ui/Primitives';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from './shared/StudentTabKit';
import { STUDENT_NAV_ITEMS, STUDENT_SECTIONS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const SECTION_COPY = {
  general: 'Start here — your day and every module at a glance.',
  lms: 'Learning content, attendance, projects and the AI studio.',
  erp: 'Money, results, examinations and your academic record.'
};

export const StudentBentoHubTab = ({ setTab }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return STUDENT_NAV_ITEMS;
    return STUDENT_NAV_ITEMS.filter(
      (item) => item.label.toLowerCase().includes(value) || item.description.toLowerCase().includes(value)
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Campus hub"
        title="Every module, one grid"
        description="Jump straight to any part of your campus portal. Twenty modules, grouped the same way as the sidebar."
        icon={LayoutGrid}
        tone="indigo"
        actions={<Badge tone="indigo">{filtered.length} modules</Badge>}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search modules — fees, marks, AI, timetable…"
          className="w-full sm:max-w-sm"
          tone="indigo"
        />
        <p className="text-[10px] font-semibold text-slate-500">
          Tip: press <span className="rounded border border-slate-200 bg-white px-1 font-bold text-slate-500">Ctrl</span> +{' '}
          <span className="rounded border border-slate-200 bg-white px-1 font-bold text-slate-500">K</span> from the header to
          search too.
        </p>
      </div>

      {STUDENT_SECTIONS.map((section, sectionIndex) => {
        const items = filtered.filter((item) => item.section === section.id);
        if (!items.length) return null;
        return (
          <SectionCard
            key={section.id}
            title={section.label || 'Portal'}
            description={SECTION_COPY[section.id]}
            icon={sectionIndex === 0 ? Search : undefined}
            tone={section.id === 'lms' ? 'violet' : section.id === 'erp' ? 'emerald' : 'indigo'}
            action={<span className="text-[9px] font-bold text-slate-500">{items.length} modules</span>}
            bodyClassName="p-2.5 sm:p-3"
          >
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const Icon = item.icon;
                const isAi = item.id === 'ai-study';
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`group relative flex items-start gap-3 overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      isAi
                        ? 'border-ai-200 bg-gradient-to-br from-ai-50 via-white to-violet-50 hover:border-ai-300'
                        : 'border-slate-100 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-bento'
                    }`}
                  >
                    {isAi ? <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-ai-300/20 blur-xl" /> : null}
                    <span
                      className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        isAi ? 'bg-gradient-to-br from-ai-500 to-ai-300 text-white' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[11.5px] font-bold text-deepNavy">{item.label}</span>
                        {item.badge ? (
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                              item.badge === 'AI' ? 'bg-ai-100 text-ai-700' : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-[9.5px] font-medium text-slate-500">{item.description}</span>
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="relative mt-1 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500"
                    />
                  </button>
                );
              })}
            </div>
          </SectionCard>
        );
      })}

      {!filtered.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center">
          <Sparkles size={22} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-deepNavy font-jost">No module matched “{query}”</p>
          <p className="mt-1 text-xs text-slate-500">Try “attendance”, “library”, “exam” or clear the search.</p>
        </div>
      ) : null}
    </div>
  );
};

export default StudentBentoHubTab;
