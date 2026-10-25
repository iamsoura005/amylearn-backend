import { KeyRound, Library } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, dueLabel } from '@/components/portal/PortalKit';
import { StatusBadge } from '@/components/ui/Badge';
import { MOCK_FACULTY_LOANS } from '@/pages/faculty/constants/facultyConstants';

const FacultyLibraryTab = ({ triggerPopup }) => (
  <div className="space-y-4">
    <PageHeader
      eyebrow="Resources"
      title="Library & vault"
      description="Your loans, digital access and encrypted credential vault."
      icon={Library}
      tone="indigo"
    />

    <div className="grid gap-3 lg:grid-cols-3">
      <SectionCard
        title="My loans"
        description="Books and resources checked out"
        icon={Library}
        tone="indigo"
        className="lg:col-span-2"
      >
        <div className="space-y-2">
          {MOCK_FACULTY_LOANS.map((loan) => (
            <div key={loan.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                {loan.type === 'Book' ? <Library size={15} /> : <KeyRound size={15} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-extrabold text-deepNavy">{loan.title}</p>
                <p className="text-[9px] font-semibold text-slate-500">{loan.type} · due {dueLabel(loan.due)}</p>
              </div>
              <StatusBadge status={new Date(loan.due) < new Date() ? 'overdue' : 'issued'} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Digital vault" description="Encrypted access you hold" icon={KeyRound} tone="violet">
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3">
            <p className="text-[10px] font-bold text-deepNavy">IEEE Xplore</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-500">Department access · CSE</p>
            <button
              onClick={() => triggerPopup('Credential copied to clipboard. It is never shown in full on screen.', 'info')}
              className="mt-2 w-full rounded-lg bg-violet-600 py-2 text-[9px] font-bold text-white hover:bg-violet-700"
            >
              Copy credential
            </button>
          </div>
          <button
            onClick={() => triggerPopup('New vault request sent to the library for approval.', 'success')}
            className="w-full rounded-xl border border-violet-200 bg-violet-50/50 py-2.5 text-[10px] font-bold text-violet-700 hover:bg-violet-50"
          >
            Request new resource
          </button>
          <p className="text-[8px] font-semibold leading-snug text-slate-500">
            Vault credentials are encrypted at rest and rotated by the library every term.
          </p>
        </div>
      </SectionCard>
    </div>
  </div>
);

export default FacultyLibraryTab;
