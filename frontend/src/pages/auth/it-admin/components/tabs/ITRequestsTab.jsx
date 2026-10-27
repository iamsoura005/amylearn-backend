import { useEffect, useMemo, useState } from 'react';
import { Building2, Check, CheckCircle2, Globe, LifeBuoy, Mail, MessageSquare, Phone, UserCheck, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips } from '@/components/portal/PortalKit';
import { api } from '@/utils/config';
import { MOCK_SUPPORT_REQUESTS } from '@/pages/auth/it-admin/constants/itAdminConstants';

const TICKET_FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' }
];

const ONBOARDING_FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' }
];

const PRIORITY_TONES = {
  high: 'bg-rose-50 text-rose-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600'
};

const ITRequestsTab = ({ triggerPopup = () => {} }) => {
  const [activeView, setActiveView] = useState('onboarding'); // 'onboarding' | 'support'
  const [ticketStatus, setTicketStatus] = useState('open');
  const [onboardingStatus, setOnboardingStatus] = useState('pending');

  const [tickets, setTickets] = useState(MOCK_SUPPORT_REQUESTS);
  const [viewingTicket, setViewingTicket] = useState(null);

  const [onboardingRequests, setOnboardingRequests] = useState([]);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch Onboarding Requests from Backend
  const fetchOnboardingRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await api.get('/platform/college-requests');
      if (response.data?.requests?.length) {
        setOnboardingRequests(response.data.requests);
      }
    } catch (err) {
      console.warn('Backend college requests error, using sample requests:', err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchOnboardingRequests();
  }, []);

  const onboardingRows = useMemo(() => {
    return onboardingStatus === 'all'
      ? onboardingRequests
      : onboardingRequests.filter((req) => (req.status || 'Pending').toLowerCase() === onboardingStatus);
  }, [onboardingRequests, onboardingStatus]);

  const ticketRows = useMemo(
    () => (ticketStatus === 'all' ? tickets : tickets.filter((ticket) => ticket.status === ticketStatus)),
    [tickets, ticketStatus]
  );

  const advanceTicket = () => {
    if (!viewingTicket) return;
    const next = viewingTicket.status === 'open' ? 'in-progress' : 'resolved';
    setTickets((current) => current.map((ticket) => (ticket.id === viewingTicket.id ? { ...ticket, status: next } : ticket)));
    triggerPopup(
      next === 'in-progress' ? `Ticket ${viewingTicket.id} picked up for investigation.` : `Ticket ${viewingTicket.id} resolved. The campus admin has been notified.`,
      'success'
    );
    setViewingTicket(null);
  };

  const handleActionOnboarding = async (decision) => {
    if (!viewingRequest) return;
    const targetId = viewingRequest.id;

    // Optimistic UI update
    setOnboardingRequests((current) =>
      current.map((req) => (req.id === targetId ? { ...req, status: decision } : req))
    );

    try {
      await api.post(`/platform/college-requests/${targetId}/action`, {
        decision
      });
      triggerPopup(
        decision === 'Approved'
          ? `Onboarding request for ${viewingRequest.collegeName} approved and provisioned!`
          : `Onboarding request for ${viewingRequest.collegeName} rejected.`,
        decision === 'Approved' ? 'success' : 'error'
      );
    } catch (err) {
      triggerPopup(`Request updated locally to ${decision}.`, 'info');
    }

    setViewingRequest(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Platform Operations"
        title={activeView === 'onboarding' ? 'Institution onboarding requests' : 'Support requests & tickets'}
        description={
          activeView === 'onboarding'
            ? 'Review and approve new university and college onboarding applications.'
            : 'Operational issues raised by campus administrators across all tenants.'
        }
        icon={activeView === 'onboarding' ? Building2 : LifeBuoy}
        tone="blue"
        actions={
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setActiveView('onboarding')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                activeView === 'onboarding' ? 'bg-brandBlue text-white shadow-xs' : 'text-slate-600 hover:text-deepNavy'
              }`}
            >
              <Building2 size={13} /> Onboarding requests
            </button>
            <button
              onClick={() => setActiveView('support')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                activeView === 'support' ? 'bg-brandBlue text-white shadow-xs' : 'text-slate-600 hover:text-deepNavy'
              }`}
            >
              <LifeBuoy size={13} /> Support tickets
            </button>
          </div>
        }
      />

      {activeView === 'onboarding' ? (
        /* INSTITUTION ONBOARDING REQUESTS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-xl font-extrabold text-deepNavy font-jost tabular">{onboardingRequests.length}</p>
              <p className="text-[10px] font-bold text-slate-500">Total requests</p>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3.5 shadow-2xs">
              <p className="text-xl font-extrabold text-amber-700 font-jost tabular">
                {onboardingRequests.filter((r) => (r.status || 'Pending').toLowerCase() === 'pending').length}
              </p>
              <p className="text-[10px] font-bold text-amber-700">Pending approval</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 shadow-2xs">
              <p className="text-xl font-extrabold text-emerald-700 font-jost tabular">
                {onboardingRequests.filter((r) => (r.status || '').toLowerCase() === 'approved').length}
              </p>
              <p className="text-[10px] font-bold text-emerald-700">Approved campuses</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-xl font-extrabold text-rose-600 font-jost tabular">
                {onboardingRequests.filter((r) => (r.status || '').toLowerCase() === 'rejected').length}
              </p>
              <p className="text-[10px] font-bold text-slate-500">Rejected</p>
            </div>
          </div>

          <SectionCard
            title="Onboarding applications"
            description="Click a request to review accreditation, sizing, and approve or reject"
            icon={Building2}
            tone="blue"
          >
            <FilterChips options={ONBOARDING_FILTERS} value={onboardingStatus} onChange={setOnboardingStatus} tone="blue" />
            <div className="mt-3">
              <DataTable
                columns={[
                  {
                    key: 'collegeName',
                    label: 'Institution',
                    render: (row) => (
                      <div>
                        <span className="font-bold text-deepNavy">{row.collegeName}</span>
                        <p className="text-[9px] font-semibold text-slate-500">{row.collegeCode} · {row.type}</p>
                      </div>
                    )
                  },
                  {
                    key: 'applicant',
                    label: 'Applicant & Email',
                    render: (row) => (
                      <div>
                        <span className="font-semibold text-deepNavy">{row.applicantName}</span>
                        <p className="text-[9px] text-slate-500">{row.applicantEmail}</p>
                      </div>
                    )
                  },
                  { key: 'campusSize', label: 'Capacity' },
                  {
                    key: 'domain',
                    label: 'Subdomain',
                    render: (row) => (
                      <span className="rounded-lg bg-blue-50 px-2 py-0.5 font-mono text-[9.5px] font-bold text-brandBlue">
                        {row.domain}.amylearn.app
                      </span>
                    )
                  },
                  {
                    key: 'submittedAt',
                    label: 'Submitted',
                    render: (row) => <span className="tabular text-slate-600">{row.submittedAt ? row.submittedAt.split('T')[0] : '—'}</span>
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => <StatusBadge status={(row.status || 'Pending').toLowerCase()} />
                  }
                ]}
                rows={onboardingRows}
                keyField="id"
                onRowClick={setViewingRequest}
                empty="No onboarding requests match this filter."
              />
            </div>
          </SectionCard>
        </div>
      ) : (
        /* CAMPUS SUPPORT TICKETS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {TICKET_FILTERS.filter((filter) => filter.id !== 'all').map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTicketStatus(filter.id)}
                className={`rounded-2xl border p-3.5 text-left shadow-2xs transition-colors ${
                  ticketStatus === filter.id ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200/80 bg-white hover:border-blue-200'
                }`}
              >
                <p className="text-lg font-extrabold text-deepNavy font-jost tabular">
                  {tickets.filter((t) => t.status === filter.id).length}
                </p>
                <p className="text-[10px] font-bold text-slate-500">{filter.label}</p>
              </button>
            ))}
          </div>

          <SectionCard title="Ticket queue" description="Click a ticket to review and act" icon={LifeBuoy} tone="blue">
            <FilterChips options={TICKET_FILTERS} value={ticketStatus} onChange={setTicketStatus} tone="blue" />
            <div className="mt-3">
              <DataTable
                columns={[
                  { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-[10px] font-bold text-deepNavy">{row.id}</span> },
                  { key: 'title', label: 'Issue', render: (row) => <span className="font-bold text-deepNavy">{row.title}</span> },
                  {
                    key: 'campus',
                    label: 'Campus',
                    render: (row) => <span className="grid h-6 w-12 place-items-center rounded-md bg-blue-50 text-[10px] font-bold text-brandBlue">{row.campus}</span>
                  },
                  { key: 'raisedBy', label: 'Raised by' },
                  { key: 'category', label: 'Category' },
                  {
                    key: 'priority',
                    label: 'Priority',
                    render: (row) => <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${PRIORITY_TONES[row.priority]}`}>{row.priority}</span>
                  },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'created', label: 'Created' }
                ]}
                rows={ticketRows}
                keyField="id"
                onRowClick={setViewingTicket}
                empty="No tickets in this state."
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Onboarding Request Review Modal */}
      <Modal
        open={Boolean(viewingRequest)}
        onClose={() => setViewingRequest(null)}
        title={viewingRequest?.collegeName || 'Onboarding Application'}
        description={`${viewingRequest?.collegeCode} · ${viewingRequest?.type}`}
        tone="blue"
        footer={
          viewingRequest && (viewingRequest.status || 'Pending').toLowerCase() === 'pending' ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => handleActionOnboarding('Rejected')}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
              >
                <X size={13} /> Reject application
              </button>
              <button
                onClick={() => handleActionOnboarding('Approved')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                <Check size={14} /> Approve & provision campus
              </button>
            </div>
          ) : null
        }
      >
        {viewingRequest ? (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Applicant</p>
                <p className="mt-0.5 text-[11px] font-bold text-deepNavy">{viewingRequest.applicantName}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-0.5 text-[11px] font-bold text-deepNavy truncate">{viewingRequest.applicantEmail}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Campus Capacity</p>
                <p className="mt-0.5 text-[11px] font-bold text-deepNavy">{viewingRequest.campusSize}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Subdomain</p>
                <p className="mt-0.5 text-[11px] font-bold text-brandBlue font-mono">{viewingRequest.domain}.amylearn.app</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Institutional requirements & notes</p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-deepNavy">{viewingRequest.notes}</p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-[10px] font-semibold text-brandBlue">
              <Globe size={15} className="shrink-0" />
              <span>Approving will provision the tenant database schema, root admin credentials, and assign the custom subdomain.</span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Support Ticket Modal */}
      <Modal
        open={Boolean(viewingTicket)}
        onClose={() => setViewingTicket(null)}
        title={viewingTicket?.title || ''}
        description={`${viewingTicket?.id} · ${viewingTicket?.campus} · raised by ${viewingTicket?.raisedBy}`}
        tone="blue"
        footer={
          viewingTicket && viewingTicket.status !== 'resolved' ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => {
                  triggerPopup('Reply sent to the campus admin from the support queue.', 'info');
                  setViewingTicket(null);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                <MessageSquare size={13} /> Reply
              </button>
              <button
                onClick={advanceTicket}
                className="inline-flex items-center gap-1 rounded-xl bg-brandBlue px-3.5 py-2 text-[11px] font-bold text-white hover:bg-brand-700"
              >
                <CheckCircle2 size={13} /> {viewingTicket.status === 'open' ? 'Start investigation' : 'Mark resolved'}
              </button>
            </div>
          ) : null
        }
      >
        {viewingTicket ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Priority', value: viewingTicket.priority },
                { label: 'Category', value: viewingTicket.category },
                { label: 'Created', value: viewingTicket.created },
                { label: 'Status', value: viewingTicket.status }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-[10.5px] font-bold capitalize text-deepNavy">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Support notes</p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-deepNavy">{viewingTicket.notes}</p>
            </div>
            <p className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 text-[9px] font-semibold leading-snug text-brandBlue">
              Every status change is logged in the audit trail and shared with the campus admin.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ITRequestsTab;

