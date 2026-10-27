import { useMemo, useState } from 'react';
import { CheckCheck, ClipboardCheck, Save } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, FilterChips, formatDay } from '@/components/portal/PortalKit';
import { Avatar } from '@/components/ui/Primitives';
import { MOCK_ATTENDANCE_SESSIONS } from '@/pages/faculty/constants/facultyConstants';

const FacultyAttendanceTab = ({ triggerPopup }) => {
  const [sessions, setSessions] = useState(MOCK_ATTENDANCE_SESSIONS);
  const [activeId, setActiveId] = useState(MOCK_ATTENDANCE_SESSIONS.find((session) => !session.marked)?.id || MOCK_ATTENDANCE_SESSIONS[0].id);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);

  const active = sessions.find((session) => session.id === activeId) || sessions[0];

  const roster = useMemo(() => {
    if (!active || !active.students.length) return [];
    return active.students.map((student) => ({ ...student, present: marks[`${active.id}-${student.id}`] ?? true }));
  }, [active, marks]);

  const presentCount = roster.filter((student) => student.present).length;

  const toggle = (studentId) => {
    setMarks((current) => ({ ...current, [`${active.id}-${studentId}`]: !(current[`${active.id}-${studentId}`] ?? true) }));
  };

  const markAll = (value) => {
    const next = {};
    active.students.forEach((student) => {
      next[`${active.id}-${student.id}`] = value;
    });
    setMarks(next);
  };

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSessions((current) =>
        current.map((session) => (session.id === activeId ? { ...session, marked: true } : session))
      );
      setSaving(false);
      setMarks({});
      triggerPopup(`Attendance saved: ${presentCount} present, ${roster.length - presentCount} absent for ${active.course}.`, 'success');
    }, 600);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Teaching"
        title="Mark attendance"
        description="Pick a session, mark present or absent, and save. Saved sessions lock after 6 PM."
        icon={ClipboardCheck}
        tone="indigo"
      />

      <FilterChips
        options={sessions.map((session) => ({
          id: session.id,
          label: `${session.marked ? '✓ ' : ''}${session.course.split('·')[0].trim()} · ${session.date}`
        }))}
        value={activeId}
        onChange={setActiveId}
        tone="indigo"
      />

      {active ? (
        <>
          <SectionCard
            title={active.course}
            description={`${active.class} · ${formatDay(active.date)} · ${active.time}`}
            icon={ClipboardCheck}
            tone="indigo"
            action={
              !active.marked ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      markAll(true);
                      triggerPopup?.('Marked all students as present.', 'success');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[9.5px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCheck size={12} className="text-emerald-600" /> Mark all present
                  </button>
                  <button
                    onClick={() => {
                      markAll(false);
                      triggerPopup?.('Marked all students as absent.', 'info');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[9.5px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Mark all absent
                  </button>
                </div>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">Saved</span>
              )
            }
          >
            {active.marked ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6 text-center">
                <p className="text-sm font-extrabold text-deepNavy font-jost">Attendance saved for this session</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">Sessions lock at 6 PM on the class date. Contact the campus admin for corrections.</p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-2">
                  <span className="text-[10px] font-bold text-indigo-700 tabular">{presentCount} present · {roster.length - presentCount} absent · {roster.length} total</span>
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${roster.length ? (presentCount / roster.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {roster.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => toggle(student.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        student.present ? 'border-slate-100 bg-white hover:border-indigo-200' : 'border-rose-100 bg-rose-50/40 hover:border-rose-200'
                      }`}
                    >
                      <Avatar name={student.name} size="sm" tone="indigo" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-deepNavy">{student.name}</p>
                        <p className="text-[9px] font-semibold text-slate-500">{student.id}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          student.present ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {student.present ? 'Present' : 'Absent'}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setMarks({})}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save size={13} /> {saving ? 'Saving…' : 'Save attendance'}
                  </button>
                </div>
              </>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
};

export default FacultyAttendanceTab;
