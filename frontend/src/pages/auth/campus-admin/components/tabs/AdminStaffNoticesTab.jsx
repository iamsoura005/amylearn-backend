import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Pin, Plus, UserCog } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Avatar, SearchInput } from '@/components/ui/Primitives';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_STAFF_NOTICES } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const EMPTY_DRAFT = { title: '', department: 'HR', category: 'HR', priority: 'medium', audience: 'All staff', body: '', pinned: false };

const PRIORITY_TONE = { high: 'red', medium: 'amber', low: 'slate' };

const AdminStaffNoticesTab = ({ triggerPopup }) => {
  const [notices, setNotices] = useState(MOCK_STAFF_NOTICES);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const categories = useMemo(() => ['All', ...Array.from(new Set(notices.map((notice) => notice.category)))], [notices]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return notices
      .filter((notice) => {
        const matchesQuery = !value || notice.title.toLowerCase().includes(value) || notice.body.toLowerCase().includes(value);
        return matchesQuery && (category === 'All' || notice.category === category);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notices, query, category]);

  const publish = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) {
      triggerPopup('Title and message body are required.', 'error');
      return;
    }
    setNotices((current) => [
      { ...draft, id: `sn-${Date.now()}`, date: new Date().toISOString().slice(0, 10), body: draft.body },
      ...current
    ]);
    triggerPopup(`Staff notice published to ${draft.audience.toLowerCase()}.`, 'success');
    setComposing(false);
    setDraft(EMPTY_DRAFT);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Communication · Internal"
        title="Staff notices"
        description="Announcements visible only to faculty and staff. Students never see this board."
        icon={UserCog}
        tone="teal"
        actions={
          <button
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Plus size={13} /> New staff notice
          </button>
        }
      />

      <SectionCard title="Internal board" description={`${notices.length} notices this term`} icon={UserCog} tone="teal">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder="Search staff notices…" className="w-full sm:max-w-xs" tone="teal" />
          <div className="flex flex-wrap items-center gap-1">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-lg px-2 py-1 text-[9.5px] font-bold transition-colors ${
                  category === item ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {filtered.map((notice) => (
            <article key={notice.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="p-3.5 sm:p-4">
                <div className="flex items-start gap-2.5">
                  <Avatar name={notice.department} size="sm" tone="teal" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[10.5px] font-bold text-deepNavy">{notice.department}</p>
                      {notice.pinned ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
                          <Pin size={8} /> Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[8.5px] font-semibold text-slate-500">
                      {format(new Date(notice.date), 'd MMM yyyy')} · {notice.audience}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={PRIORITY_TONE[notice.priority] || 'slate'}>{notice.priority}</Badge>
                    <Badge>{notice.category}</Badge>
                  </div>
                </div>
                <h3 className="mt-2.5 text-[12.5px] font-extrabold leading-snug text-deepNavy font-jost">{notice.title}</h3>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-600">{notice.body}</p>
              </div>
            </article>
          ))}
          {!filtered.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center">
              <p className="text-sm font-bold text-deepNavy font-jost">No staff notices match</p>
              <p className="mt-1 text-xs text-slate-500">Try another category or clear the search.</p>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <Modal
        open={composing}
        onClose={() => setComposing(false)}
        title="New staff notice"
        description="Internal only — not visible to students."
        tone="teal"
        footer={
          <button
            onClick={publish}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            Publish to staff
          </button>
        }
      >
        <form onSubmit={publish} className="grid gap-3">
          <FormField label="Title *">
            <input
              value={draft.title}
              onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))}
              placeholder="e.g. Faculty meeting rescheduled"
              className={inputClass}
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Office">
              <select value={draft.department} onChange={(event) => setDraft((value) => ({ ...value, department: event.target.value }))} className={inputClass}>
                {['HR', 'Finance', 'Academics', 'IQAC', 'IT Services', 'Administration'].map((office) => (
                  <option key={office}>{office}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Category">
              <select value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value }))} className={inputClass}>
                {['HR', 'Finance', 'Academics', 'Policy', 'Infrastructure'].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Audience">
            <select value={draft.audience} onChange={(event) => setDraft((value) => ({ ...value, audience: event.target.value }))} className={inputClass}>
              {['All staff', 'All faculty', 'HODs only', 'Committee members', 'Lab in-charges'].map((audience) => (
                <option key={audience}>{audience}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Message *">
            <textarea
              value={draft.body}
              onChange={(event) => setDraft((value) => ({ ...value, body: event.target.value }))}
              rows={4}
              placeholder="Write the announcement…"
              className={`${inputClass} resize-none`}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStaffNoticesTab;
