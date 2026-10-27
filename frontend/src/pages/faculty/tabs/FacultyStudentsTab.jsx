import { useMemo, useState } from 'react';
import { Award, CheckCircle2, Download, Eye, GraduationCap, Plus, Save, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Primitives';
import { SectionCard, FilterChips } from '@/components/portal/PortalKit';
import { api } from '@/utils/config';
import { MOCK_FACULTY_STUDENTS, MOCK_FACULTY_COURSES } from '@/pages/faculty/constants/facultyConstants';

const COURSE_FILTERS = [
  { id: 'all', label: 'All students' },
  ...MOCK_FACULTY_COURSES.map((course) => ({ id: course.code, label: `${course.code} · ${course.subject.split(' ')[0]}` }))
];

const gradeFor = (pct) => {
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
};

const FacultyStudentsTab = ({ triggerPopup = () => {} }) => {
  const [course, setCourse] = useState('all');
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState(MOCK_FACULTY_STUDENTS);
  const [viewing, setViewing] = useState(null);

  // Marks Entry Modal State
  const [marksModalOpen, setMarksModalOpen] = useState(false);
  const [assessmentType, setAssessmentType] = useState('ia2'); // 'ia1' | 'ia2' | 'lab'
  const [targetCourse, setTargetCourse] = useState('CS502');
  const [marksDraft, setMarksDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesCourse = course === 'all' || student.course === course;
      const matchesQuery = !value || student.name.toLowerCase().includes(value) || student.id.toLowerCase().includes(value);
      return matchesCourse && matchesQuery;
    });
  }, [students, course, query]);

  const handleOpenMarksModal = () => {
    // Preload current marks into draft
    const initialDraft = {};
    students.forEach((student) => {
      const currentVal = assessmentType === 'ia1' ? student.ia1 : student.ia2;
      initialDraft[student.id] = currentVal !== undefined ? currentVal : 35;
    });
    setMarksDraft(initialDraft);
    setMarksModalOpen(true);
  };

  const handlePublishMarks = async (e) => {
    e.preventDefault();
    setSaving(true);

    const maxMarks = assessmentType === 'lab' ? 25 : 50;
    const records = Object.entries(marksDraft).map(([rollNumber, score]) => ({
      rollNumber,
      marks: Number(score) || 0,
      grade: gradeFor(((Number(score) || 0) / maxMarks) * 100)
    }));

    try {
      await api.post('/coe/upload-marks', {
        subjectId: targetCourse,
        marks: records
      });
      triggerPopup(`Published ${assessmentType.toUpperCase()} marks for ${records.length} students to the COE!`, 'success');
    } catch (err) {
      console.warn('Backend mark upload failed, saving locally:', err.message);
      triggerPopup(`Saved ${assessmentType.toUpperCase()} marks locally (${records.length} students).`, 'info');
    }

    // Update local state
    setStudents((current) =>
      current.map((student) => {
        if (marksDraft[student.id] !== undefined) {
          return {
            ...student,
            [assessmentType === 'ia1' ? 'ia1' : 'ia2']: Number(marksDraft[student.id])
          };
        }
        return student;
      })
    );

    setSaving(false);
    setMarksModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Teaching"
        title="My students & internal marks"
        description="Students across your current courses with attendance and internal assessment marks."
        icon={Users}
        tone="indigo"
        actions={
          <button
            onClick={handleOpenMarksModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-[11px] font-bold text-white shadow-2xs hover:bg-indigo-700"
          >
            <Award size={14} /> Enter & publish marks
          </button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={COURSE_FILTERS} value={course} onChange={setCourse} tone="indigo" />
        <label className="relative flex w-full max-w-xs items-center">
          <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or roll number…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      <SectionCard title="Class list" description={`${rows.length} students`} icon={Users} tone="indigo">
        <DataTable
          columns={[
            { key: 'id', label: 'Roll number', render: (row) => <span className="font-bold text-deepNavy">{row.id}</span> },
            {
              key: 'name',
              label: 'Student',
              render: (row) => (
                <span className="flex items-center gap-2">
                  <Avatar name={row.name} size="xs" tone="indigo" />
                  <span className="font-semibold">{row.name}</span>
                </span>
              )
            },
            {
              key: 'attendance',
              label: 'Attendance',
              render: (row) => (
                <span className={`font-bold tabular ${row.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {row.attendance}%
                </span>
              )
            },
            { key: 'ia1', label: 'IA-1 /50', render: (row) => <span className="tabular font-bold text-deepNavy">{row.ia1}</span> },
            { key: 'ia2', label: 'IA-2 /50', render: (row) => <span className="tabular font-bold text-deepNavy">{row.ia2}</span> },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'actions',
              label: '',
              sortable: false,
              render: (row) => (
                <button
                  onClick={() => setViewing(row)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-700"
                  aria-label={`View ${row.name}`}
                >
                  <Eye size={13} />
                </button>
              )
            }
          ]}
          rows={rows}
          keyField="id"
          empty="No students match this filter."
          footer="Attendance below 75% flags the student for the COE eligibility check."
        />
      </SectionCard>

      {/* Student Detail Modal */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || ''}
        description={`${viewing?.id} · ${viewing?.course}`}
        tone="indigo"
      >
        {viewing ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Attendance', value: `${viewing.attendance}%`, alert: viewing.attendance < 75 },
              { label: 'IA-1', value: `${viewing.ia1}/50` },
              { label: 'IA-2', value: `${viewing.ia2}/50` },
              { label: 'Status', value: viewing.status }
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`mt-0.5 text-[10.5px] font-bold capitalize ${item.alert ? 'text-rose-600' : 'text-deepNavy'}`}>{item.value}</p>
              </div>
            ))}
            {viewing.attendance < 75 ? (
              <p className="col-span-2 rounded-xl border border-rose-100 bg-rose-50/60 p-2.5 text-[9px] font-semibold leading-snug text-rose-700 sm:col-span-4">
                This student is below the 75% attendance threshold and has been flagged to the COE for the current exam cycle.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      {/* Marks Entry & Publishing Modal */}
      <Modal
        open={marksModalOpen}
        onClose={() => setMarksModalOpen(false)}
        title="Internal assessment marks entry"
        description="Enter continuous assessment marks and publish directly to the Controller of Examinations."
        tone="indigo"
      >
        <form onSubmit={handlePublishMarks} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Course / Subject</label>
              <select
                value={targetCourse}
                onChange={(e) => setTargetCourse(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-deepNavy focus:border-indigo-400 focus:outline-none"
              >
                {MOCK_FACULTY_COURSES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} · {c.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessment component</label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-deepNavy focus:border-indigo-400 focus:outline-none"
              >
                <option value="ia1">Internal Assessment 1 (IA-1 / 50)</option>
                <option value="ia2">Internal Assessment 2 (IA-2 / 50)</option>
                <option value="lab">Lab Practical & Viva (/ 25)</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
            <p className="text-[10px] font-semibold text-slate-600">
              Entering scores for <strong>{assessmentType.toUpperCase()}</strong> (Maximum score: {assessmentType === 'lab' ? 25 : 50}). Grades are calculated automatically according to university rubrics.
            </p>
          </div>

          {/* Marks Spreadsheet Table */}
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-[11px]">
              <thead className="sticky top-0 bg-slate-50 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Roll No</th>
                  <th className="px-3 py-2">Student Name</th>
                  <th className="px-3 py-2 w-28">Score</th>
                  <th className="px-3 py-2 text-center w-20">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const score = marksDraft[student.id] !== undefined ? marksDraft[student.id] : 35;
                  const max = assessmentType === 'lab' ? 25 : 50;
                  const pct = (Number(score) / max) * 100;
                  const grade = gradeFor(pct);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono font-bold text-deepNavy">{student.id}</td>
                      <td className="px-3 py-2 font-semibold text-slate-700">{student.name}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max={max}
                          value={score}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMarksDraft((prev) => ({ ...prev, [student.id]: val }));
                          }}
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center font-bold text-deepNavy focus:border-indigo-400 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold ${
                          grade === 'O' || grade === 'A+' ? 'bg-emerald-50 text-emerald-700' :
                          grade === 'F' ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMarksModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50"
            >
              <Save size={13} /> {saving ? 'Publishing...' : 'Submit & publish to COE'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyStudentsTab;

