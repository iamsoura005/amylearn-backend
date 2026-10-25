import { useMemo, useState } from 'react';
import { Eye, Search, ShieldAlert, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Primitives';
import { FilterChips } from '@/components/portal/PortalKit';
import {
  MOCK_STUDENTS,
  MOCK_FACULTY
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const ROLE_FILTERS = [
  { id: 'students', label: 'Students', count: MOCK_STUDENTS.length },
  { id: 'faculty', label: 'Faculty', count: MOCK_FACULTY.length }
];

const AdminUsersTab = ({ triggerPopup }) => {
  const [role, setRole] = useState('students');
  const [query, setQuery] = useState('');
  const [viewUser, setViewUser] = useState(null);

  const students = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return MOCK_STUDENTS;
    return MOCK_STUDENTS.filter(
      (student) =>
        student.name.toLowerCase().includes(value) ||
        student.id.toLowerCase().includes(value) ||
        student.department.toLowerCase().includes(value) ||
        student.email.toLowerCase().includes(value)
    );
  }, [query]);

  const faculty = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return MOCK_FACULTY;
    return MOCK_FACULTY.filter(
      (member) =>
        member.name.toLowerCase().includes(value) ||
        member.id.toLowerCase().includes(value) ||
        member.department.toLowerCase().includes(value) ||
        member.email.toLowerCase().includes(value)
    );
  }, [query]);

  const studentColumns = [
    { key: 'id', label: 'Roll number', render: (row) => <span className="font-bold text-deepNavy">{row.id}</span> },
    {
      key: 'name',
      label: 'Student',
      render: (row) => (
        <span className="flex items-center gap-2">
          <Avatar name={row.name} size="xs" tone="teal" />
          <span className="font-semibold">{row.name}</span>
        </span>
      )
    },
    { key: 'department', label: 'Department' },
    { key: 'semester', label: 'Sem', render: (row) => <span className="tabular">{row.semester}</span> },
    { key: 'attendance', label: 'Attendance', render: (row) => <span className={`font-bold tabular ${row.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>{row.attendance}%</span> },
    { key: 'cgpa', label: 'CGPA', render: (row) => <span className="tabular">{row.cgpa}</span> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => setViewUser({ kind: 'student', ...row })}
          className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-700"
          aria-label={`View ${row.name}`}
        >
          <Eye size={13} />
        </button>
      )
    }
  ];

  const facultyColumns = [
    { key: 'id', label: 'Employee ID', render: (row) => <span className="font-bold text-deepNavy">{row.id}</span> },
    {
      key: 'name',
      label: 'Faculty',
      render: (row) => (
        <span className="flex items-center gap-2">
          <Avatar name={row.name} size="xs" tone="blue" />
          <span className="font-semibold">{row.name}</span>
        </span>
      )
    },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'subjects', label: 'Subjects', render: (row) => <span className="tabular">{row.subjects}</span> },
    { key: 'load', label: 'Hrs/wk', render: (row) => <span className="tabular">{row.load}</span> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => setViewUser({ kind: 'faculty', ...row })}
          className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-700"
          aria-label={`View ${row.name}`}
        >
          <Eye size={13} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="All students and faculty across departments with current status."
        icon={Users}
        tone="teal"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={ROLE_FILTERS} value={role} onChange={setRole} tone="teal" />
        <label className="relative flex w-full max-w-xs items-center">
          <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={role === 'students' ? 'Search roll, name, department…' : 'Search ID, name, department…'}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </div>

      <DataTable
        columns={role === 'students' ? studentColumns : facultyColumns}
        rows={role === 'students' ? students : faculty}
        keyField="id"
        footer={
          role === 'students'
            ? `${students.length} of ${MOCK_STUDENTS.length} students shown · click any row column header to sort`
            : `${faculty.length} of ${MOCK_FACULTY.length} faculty shown · click any row column header to sort`
        }
      />

      <Modal
        open={Boolean(viewUser)}
        onClose={() => setViewUser(null)}
        title={viewUser?.name || ''}
        description={viewUser?.kind === 'student' ? viewUser?.id : viewUser?.id}
        tone="teal"
        footer={
          <button
            onClick={() => {
              triggerPopup(
                viewUser?.status === 'active' ? `${viewUser?.name}'s access has been suspended.` : `${viewUser?.name}'s access has been restored.`,
                'success'
              );
              setViewUser(null);
            }}
            className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            {viewUser?.status === 'active' ? 'Suspend access' : 'Restore access'}
          </button>
        }
      >
        {viewUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <Avatar name={viewUser.name} size="lg" tone={viewUser.kind === 'student' ? 'teal' : 'blue'} />
              <div>
                <p className="text-sm font-extrabold text-deepNavy font-jost">{viewUser.name}</p>
                <p className="text-[10px] font-semibold text-slate-500">{viewUser.email}</p>
                <div className="mt-1"><StatusBadge status={viewUser.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-slate-100 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Department</p>
                <p className="mt-0.5 font-bold text-deepNavy">{viewUser.department}</p>
              </div>
              {viewUser.kind === 'student' ? (
                <>
                  <div className="rounded-lg border border-slate-100 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Semester</p>
                    <p className="mt-0.5 font-bold text-deepNavy tabular">Sem {viewUser.semester}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Attendance</p>
                    <p className={`mt-0.5 font-bold tabular ${viewUser.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>{viewUser.attendance}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">CGPA</p>
                    <p className="mt-0.5 font-bold text-deepNavy tabular">{viewUser.cgpa}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-slate-100 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Designation</p>
                    <p className="mt-0.5 font-bold text-deepNavy">{viewUser.designation}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Subjects</p>
                    <p className="mt-0.5 font-bold text-deepNavy tabular">{viewUser.subjects}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Weekly load</p>
                    <p className="mt-0.5 font-bold text-deepNavy tabular">{viewUser.load} hrs</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-[10px] font-semibold leading-snug text-amber-700">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              Access changes take effect immediately and the user must sign in again to continue.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminUsersTab;
