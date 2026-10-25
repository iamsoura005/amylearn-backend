import { useMemo, useState } from 'react';
import { Eye, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Primitives';
import { SectionCard, FilterChips } from '@/components/portal/PortalKit';
import { MOCK_FACULTY_STUDENTS, MOCK_FACULTY_COURSES } from '@/pages/faculty/constants/facultyConstants';

const COURSE_FILTERS = [
  { id: 'all', label: 'All students' },
  ...MOCK_FACULTY_COURSES.map((course) => ({ id: course.code, label: `${course.code} · ${course.subject.split(' ')[0]}` }))
];

const FacultyStudentsTab = () => {
  const [course, setCourse] = useState('all');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return MOCK_FACULTY_STUDENTS.filter((student) => {
      const matchesCourse = course === 'all' || student.course === course;
      const matchesQuery = !value || student.name.toLowerCase().includes(value) || student.id.toLowerCase().includes(value);
      return matchesCourse && matchesQuery;
    });
  }, [course, query]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Teaching"
        title="My students"
        description="Students across your current courses with attendance and internal assessment marks."
        icon={Users}
        tone="indigo"
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
            { key: 'ia1', label: 'IA-1 /50', render: (row) => <span className="tabular">{row.ia1}</span> },
            { key: 'ia2', label: 'IA-2 /50', render: (row) => <span className="tabular">{row.ia2}</span> },
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
    </div>
  );
};

export default FacultyStudentsTab;
