import { Check, X } from 'lucide-react';

const ROWS = [
  {
    workflow: 'Student records',
    without: 'Duplicate sheets kept by each department',
    withAmy: 'One tenant-scoped record with role-based access'
  },
  {
    workflow: 'Attendance',
    without: 'Paper registers and week-late entry',
    withAmy: 'Daily faculty marking with a student self-view'
  },
  {
    workflow: 'Exam eligibility',
    without: 'Manual checks against changing term rules',
    withAmy: 'Eligibility resolved from the same curriculum structure'
  },
  {
    workflow: 'Exam forms and fees',
    without: 'Separate forms, screenshots and payment reminders',
    withAmy: 'Regular and backlog forms tied to a fee ledger'
  },
  {
    workflow: 'Admit cards',
    without: 'Copy-paste templates and a print queue',
    withAmy: 'QR-coded admit cards issued in bulk'
  },
  {
    workflow: 'Marks and results',
    without: 'Email attachments and version confusion',
    withAmy: 'Bulk upload with publish and unpublish control'
  },
  {
    workflow: 'Learning material',
    without: 'Shared drives with broken links',
    withAmy: 'Topic modules with completion and download rules'
  },
  {
    workflow: 'Library circulation',
    without: 'Diary entries and manual reminders',
    withAmy: '14-day loans with automated overdue alerts'
  }
];

export const ComparisonSection = () => (
  <section id="comparison" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">Operating model</p>
        <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-deepNavy sm:text-4xl">
          Less stitching. More campus.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          The difference is not a longer feature list. It is what stops happening between departments when the record
          is shared from the start.
        </p>
      </div>

      <p className="mt-6 text-center text-[10px] font-semibold text-slate-500 sm:hidden">Swipe the table to compare</p>

      <div className="mt-2 overflow-hidden rounded-3xl border border-slate-200/80 shadow-bento sm:mt-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[660px] border-collapse text-left">
            <caption className="sr-only">Comparison of disconnected tools and AmyLearn by campus workflow</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-bgLight">
                <th scope="col" className="w-[24%] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Workflow
                </th>
                <th scope="col" className="w-[38%] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Spreadsheets and disconnected tools
                </th>
                <th scope="col" className="w-[38%] bg-brand-50/80 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-brandBlue">
                  AmyLearn
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => (
                <tr key={row.workflow} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <th scope="row" className="px-5 py-4 text-xs font-bold text-deepNavy">
                    {row.workflow}
                  </th>
                  <td className="px-5 py-4">
                    <span className="flex items-start gap-2 text-[11px] font-medium leading-5 text-slate-500">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
                        <X size={9} />
                      </span>
                      {row.without}
                    </span>
                  </td>
                  <td className="bg-brand-50/40 px-5 py-4">
                    <span className="flex items-start gap-2 text-[11px] font-semibold leading-5 text-deepNavy">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brandBlue text-white">
                        <Check size={9} />
                      </span>
                      {row.withAmy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-bgLight px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-bold text-deepNavy">Switching does not require a big-bang migration.</p>
          <p className="mt-1 max-w-2xl text-[10px] font-medium leading-relaxed text-slate-500">
            Start with academic structure and active rosters. Keep historical archives where they are until the new
            records are verified, then retire the old process department by department.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Phased rollout supported
        </span>
      </div>
    </div>
  </section>
);

export default ComparisonSection;
