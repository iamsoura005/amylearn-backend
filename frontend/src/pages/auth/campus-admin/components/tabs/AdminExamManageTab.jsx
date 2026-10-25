import { useState } from 'react';
import { CalendarDays, GraduationCap, Plus, Printer, Send } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FormField, inputClass, FilterChips, formatDay } from '@/components/portal/PortalKit';
import { MOCK_EXAM_SESSIONS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminExamManageTab = ({ triggerPopup }) => {
  const [sessions, setSessions] = useState(MOCK_EXAM_SESSIONS);
  const [activeId, setActiveId] = useState('nov-2026');
  const [addingPaper, setAddingPaper] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [paperForm, setPaperForm] = useState({ subject: '', code: '', date: '', time: '09:30 – 12:30', hall: 'Main Hall A' });

  const active = sessions.find((session) => session.id === activeId) || sessions[0];

  const addPaper = (event) => {
    event.preventDefault();
    if (!paperForm.subject.trim() || !paperForm.code.trim() || !paperForm.date) {
      triggerPopup('Subject, code and date are required.', 'error');
      return;
    }
    const paper = {
      id: `p-${Date.now()}`,
      department: 'CSE',
      semester: 5,
      ...paperForm
    };
    setSessions((current) =>
      current.map((session) => (session.id === activeId ? { ...session, papers: [...session.papers, paper] } : session))
    );
    triggerPopup(`${paper.code} · ${paper.subject} added to the schedule.`, 'success');
    setAddingPaper(false);
    setPaperForm({ subject: '', code: '', date: '', time: '09:30 – 12:30', hall: 'Main Hall A' });
  };

  const publishResults = () => {
    setPublishing(true);
    window.setTimeout(() => {
      setSessions((current) =>
        current.map((session) => (session.id === activeId ? { ...session, status: 'result-published' } : session))
      );
      setPublishing(false);
      triggerPopup('Results published. Students can now view their marks in their portal.', 'success');
    }, 700);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Examinations"
        title="Exams & results"
        description="Exam sessions, paper schedules and result publishing."
        icon={GraduationCap}
        tone="teal"
        actions={
          <button
            onClick={() => setAddingPaper(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Plus size={13} /> Add paper
          </button>
        }
      />

      <FilterChips
        options={sessions.map((session) => ({ id: session.id, label: session.name.split('·')[1]?.trim() || session.name }))}
        value={activeId}
        onChange={setActiveId}
        tone="teal"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard title="Session details" description={active.name} icon={CalendarDays} tone="teal">
          <div className="space-y-2">
            {[
              { label: 'Type', value: active.type },
              { label: 'Form deadline', value: formatDay(active.formDeadline) },
              { label: 'Exams start', value: formatDay(active.startDate) },
              { label: 'Exams end', value: formatDay(active.endDate) },
              { label: 'Papers scheduled', value: active.papers.length }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2">
                <span className="text-[10px] font-semibold text-slate-500">{item.label}</span>
                <span className="text-[10px] font-bold text-deepNavy tabular">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2">
              <span className="text-[10px] font-semibold text-slate-500">Status</span>
              <StatusBadge status={active.status} />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => triggerPopup('Schedule notice drafted and queued for publishing.', 'success')}
                className="flex-1 rounded-lg border border-teal-200 bg-teal-50/50 py-2 text-[10px] font-bold text-teal-700 hover:bg-teal-50"
              >
                Notify students
              </button>
              <button
                onClick={() => triggerPopup('Paper schedule sent to the print queue.', 'info')}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
              >
                <Printer size={11} /> Print
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Paper schedule" description="Chronological order" icon={CalendarDays} tone="blue" className="lg:col-span-2">
          {active.papers.length ? (
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (row) => <span className="font-bold text-deepNavy tabular">{formatDay(row.date)}</span> },
                {
                  key: 'subject',
                  label: 'Paper',
                  render: (row) => (
                    <span>
                      <span className="block font-bold text-deepNavy">{row.subject}</span>
                      <span className="text-[9px] font-semibold text-slate-500">{row.department} · Sem {row.semester}</span>
                    </span>
                  )
                },
                { key: 'code', label: 'Code', render: (row) => <span className="font-mono text-[10px]">{row.code}</span> },
                { key: 'time', label: 'Timing' },
                { key: 'hall', label: 'Hall' }
              ]}
              rows={[...active.papers].sort((a, b) => new Date(a.date) - new Date(b.date))}
              keyField="id"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-[11px] font-semibold text-slate-500">No papers scheduled for this session yet.</p>
            </div>
          )}
        </SectionCard>
      </div>

      {active.status !== 'result-published' ? (
        <SectionCard
          title="Result publishing"
          description="Publish marks for this session to student portals"
          icon={Send}
          tone="emerald"
          action={
            <button
              onClick={publishResults}
              disabled={publishing || !active.papers.length}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              <Send size={13} /> {publishing ? 'Publishing…' : 'Publish results'}
            </button>
          }
        >
          <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
            Results become visible to students immediately after publishing. Verify that all marks entries are locked
            for every paper in this session before proceeding.
          </p>
        </SectionCard>
      ) : null}

      <Modal
        open={addingPaper}
        onClose={() => setAddingPaper(false)}
        title="Add exam paper"
        description={`New paper will be added to ${active.name}.`}
        tone="teal"
        footer={
          <button
            onClick={addPaper}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            Add paper
          </button>
        }
      >
        <form onSubmit={addPaper} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Subject *" className="sm:col-span-2">
            <input value={paperForm.subject} onChange={(event) => setPaperForm((value) => ({ ...value, subject: event.target.value }))} placeholder="Advanced Data Structures" className={inputClass} />
          </FormField>
          <FormField label="Subject code *">
            <input value={paperForm.code} onChange={(event) => setPaperForm((value) => ({ ...value, code: event.target.value }))} placeholder="CS601" className={inputClass} />
          </FormField>
          <FormField label="Date *">
            <input value={paperForm.date} onChange={(event) => setPaperForm((value) => ({ ...value, date: event.target.value }))} type="date" className={inputClass} />
          </FormField>
          <FormField label="Timing">
            <input value={paperForm.time} onChange={(event) => setPaperForm((value) => ({ ...value, time: event.target.value }))} className={inputClass} />
          </FormField>
          <FormField label="Hall">
            <input value={paperForm.hall} onChange={(event) => setPaperForm((value) => ({ ...value, hall: event.target.value }))} className={inputClass} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default AdminExamManageTab;
