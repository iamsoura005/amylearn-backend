import { useMemo, useState } from 'react';
import { CalendarCheck, ClipboardCheck, Filter } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { BarChart } from '@/components/common/Charts';
import { SectionCard, FilterChips } from '@/components/portal/PortalKit';
import { formatDay } from '@/components/portal/PortalKit';
import {
  MOCK_ATTENDANCE_DEPT,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_DEPARTMENTS
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminAttendanceTab = ({ triggerPopup }) => {
  const [dept, setDept] = useState('all');

  const filters = [
    { id: 'all', label: 'All departments' },
    ...MOCK_DEPARTMENTS.map((entry) => ({ id: entry.code, label: entry.code }))
  ];

  const records = useMemo(
    () => (dept === 'all' ? MOCK_ATTENDANCE_RECORDS : MOCK_ATTENDANCE_RECORDS.filter((record) => record.department === dept)),
    [dept]
  );

  const chartData = useMemo(
    () =>
      MOCK_ATTENDANCE_DEPT.map((entry) => ({
        label: entry.dept,
        value: entry.percent,
        color: entry.color
      })),
    []
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Academics"
        title="Attendance"
        description="Department-wise coverage and recent class records. Marking is done by faculty."
        icon={ClipboardCheck}
        tone="teal"
        actions={
          <button
            onClick={() => triggerPopup('Faculty mark attendance from their own portal. Admins can review and flag gaps here.', 'info')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/50 px-4 py-2.5 text-[11px] font-bold text-teal-700 hover:bg-teal-50"
          >
            <Filter size={13} /> Review policy
          </button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="Department coverage"
          description="Average attendance yesterday"
          icon={CalendarCheck}
          tone="teal"
          className="lg:col-span-1"
        >
          <BarChart data={chartData} height={170} color="#0F766E" />
        </SectionCard>

        <SectionCard
          title="Class records"
          description="Most recent marked classes"
          icon={ClipboardCheck}
          tone="teal"
          className="lg:col-span-2"
        >
          <FilterChips options={filters} value={dept} onChange={setDept} tone="teal" />
          <div className="mt-3">
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (row) => <span className="font-semibold tabular">{formatDay(row.date)}</span> },
                {
                  key: 'subject',
                  label: 'Class',
                  render: (row) => (
                    <span>
                      <span className="block font-bold text-deepNavy">{row.subject}</span>
                      <span className="text-[9px] font-semibold text-slate-500">{row.code} · {row.department} Sem {row.semester}</span>
                    </span>
                  )
                },
                { key: 'faculty', label: 'Faculty' },
                { key: 'total', label: 'Enrolled', render: (row) => <span className="tabular">{row.total}</span> },
                { key: 'present', label: 'Present', render: (row) => <span className="tabular">{row.present}</span> },
                {
                  key: 'percent',
                  label: 'Coverage',
                  render: (row) => (
                    <span className={`font-bold tabular ${row.percent >= 85 ? 'text-emerald-700' : row.percent >= 75 ? 'text-amber-700' : 'text-rose-600'}`}>
                      {row.percent}%
                    </span>
                  )
                }
              ]}
              rows={records}
              keyField="id"
              empty="No class records for this department yet."
              footer={`${records.length} records · below 75% coverage is flagged to the HOD`}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Attendance policy" description="Institution defaults" icon={CalendarCheck} tone="amber">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: 'Minimum required', value: '75%' },
            { label: 'Shortage notice threshold', value: 'Below 70%' },
            { label: 'Marking window', value: 'Same day until 6 PM' }
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-amber-700">{item.label}</p>
              <p className="mt-1 text-sm font-extrabold text-deepNavy font-jost">{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default AdminAttendanceTab;
