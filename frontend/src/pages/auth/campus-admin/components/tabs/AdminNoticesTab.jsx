import { useMemo, useState } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { SectionCard, FormField, inputClass } from '@/components/portal/PortalKit';
import { NoticeFeed } from '@/pages/auth/campus-student/components/tabs/shared/StudentNoticeFeed';
import { MOCK_NOTICES } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const EMPTY_DRAFT = { title: '', department: 'Academics', category: 'Academics', priority: 'medium', body: '', pinned: false };

const AdminNoticesTab = ({ triggerPopup }) => {
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const feedNotices = useMemo(
    () =>
      notices.map((notice, index) => ({
        ...notice,
        content: notice.body,
        poster: `${notice.department} Office`,
        posterRole: notice.department === 'COE' ? 'COE' : notice.department === 'Library' ? 'Library' : notice.department === 'IQAC' ? 'Faculty' : 'Admin',
        reactions: 5 + index * 2,
        comments: 2,
        type: 'staff'
      })),
    [notices]
  );

  const publish = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) {
      triggerPopup('Title and message body are required.', 'error');
      return;
    }
    const notice = {
      ...draft,
      id: `n-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      body: draft.body
    };
    setNotices((current) => [notice, ...current]);
    triggerPopup('Notice published to all students and faculty.', 'success');
    setComposing(false);
    setDraft(EMPTY_DRAFT);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Communication"
        title="Notices"
        description="Broadcast announcements to the whole campus. Students see these in their portal feed."
        icon={Megaphone}
        tone="teal"
        actions={
          <button
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Plus size={13} /> New notice
          </button>
        }
      />

      <NoticeFeed
        notices={feedNotices}
        tone="teal"
        triggerPopup={triggerPopup}
        studentName="Dr. Meera Iyer"
        commenterRole="Admin"
      />

      <Modal
        open={composing}
        onClose={() => setComposing(false)}
        title="Publish notice"
        description="Visible immediately in student and faculty portals."
        tone="teal"
        footer={
          <button
            onClick={publish}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            Publish notice
          </button>
        }
      >
        <form onSubmit={publish} className="grid gap-3">
          <FormField label="Title *">
            <input
              value={draft.title}
              onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))}
              placeholder="e.g. Revised timetable for IA-2"
              className={inputClass}
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Publishing office">
              <select value={draft.department} onChange={(event) => setDraft((value) => ({ ...value, department: event.target.value }))} className={inputClass}>
                {['Academics', 'COE', 'Library', 'IT Services', 'Student Affairs', 'IQAC', 'Administration'].map((office) => (
                  <option key={office}>{office}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Category">
              <select value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value }))} className={inputClass}>
                {['Academics', 'Examinations', 'Events', 'Infrastructure', 'General'].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Priority">
            <div className="mt-1.5 flex gap-2">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setDraft((value) => ({ ...value, priority }))}
                  className={`rounded-lg border px-3 py-2 text-[10px] font-bold capitalize ${
                    draft.priority === priority
                      ? priority === 'high'
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : priority === 'medium'
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
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
          <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={draft.pinned}
              onChange={(event) => setDraft((value) => ({ ...value, pinned: event.target.checked }))}
              className="h-3.5 w-3.5 accent-teal-700"
            />
            Pin this notice to the top of every feed
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default AdminNoticesTab;
