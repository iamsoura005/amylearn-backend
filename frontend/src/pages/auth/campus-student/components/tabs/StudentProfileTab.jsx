import { useState } from 'react';
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Droplets,
  GraduationCap,
  Home,
  Contact,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCog
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, Divider, Toggle } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { InfoRow } from '@/components/common/StatCard';
import { SectionCard, SoftStat } from './shared/StudentTabKit';
import api from '@/utils/config';

const DEFAULT_PREFERENCES = {
  emailNotices: true,
  smsAlerts: true,
  placementEmails: true,
  autoDownload: false,
  aiHistory: true
};

export const StudentProfileTab = ({ session, college, triggerPopup }) => {
  const student = session || {};
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState({
    phone: student.phone || '+91 98450 22118',
    email: student.email || 'aarav.sharma@student.nbr.edu',
    address: student.address || '24, 3rd Cross, Jayanagar 4th Block, Bengaluru 560011'
  });
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [changing, setChanging] = useState(false);

  const changePassword = async () => {
    if (passwords.next.length < 8) {
      triggerPopup?.('New password must be at least 8 characters.', 'warning');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      triggerPopup?.('New password and confirmation do not match.', 'warning');
      return;
    }
    setChanging(true);
    try {
      const res = await api.patch('/api/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      triggerPopup?.(res.data?.message || 'Password updated successfully.', 'success');
      setPasswordOpen(false);
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Check your current password.';
      triggerPopup?.(msg, 'error');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Your identity, academic record, contact preferences and account security."
        icon={User}
        tone="slate"
        actions={<Badge tone="emerald" dot>Verified student</Badge>}
      />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Banner with subtle ambient gradient */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-r from-[#14112e] via-[#2b2666] to-[#4338CA]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Profile info block situated cleanly on white surface */}
        <div className="px-5 pb-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar circle overlapping the banner boundary */}
              <div className="-mt-11 sm:-mt-12 shrink-0 self-start sm:self-auto rounded-full border-4 border-white bg-white shadow-md ring-1 ring-slate-200/70">
                <Avatar name={student.name || 'Aarav Sharma'} size="xl" tone="indigo" />
              </div>

              {/* Student identity details */}
              <div className="pt-0.5 sm:pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-deepNavy font-jost tracking-tight leading-snug">
                    {student.name || 'Aarav Sharma'}
                  </h2>
                  <BadgeCheck size={18} className="text-blue-600 shrink-0" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-brandBlue">
                    {student.rollNumber || 'NBR2024CS042'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {student.program || 'B.Tech · Computer Science & Engineering'}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges on right side */}
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
              <Badge tone="indigo">Semester {student.semester || 5}</Badge>
              <Badge tone="slate">{college?.collegeCode || 'NBR'} · {college?.name || 'Northbridge University'}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="CGPA" value={student.cgpa || 8.42} hint="Semester 4" icon={GraduationCap} tone="violet" />
        <SoftStat label="Credits" value={student.creditsEarned || 96} hint="of 160" icon={BookOpen} tone="indigo" />
        <SoftStat label="Attendance" value={`${student.attendance || 87}%`} hint="Semester 5" icon={CheckCircle2} tone="emerald" />
        <SoftStat label="Batch" value="2024–28" hint={student.section ? `Section ${student.section}` : 'Section A'} icon={CalendarDays} tone="blue" />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <SectionCard title="Academic record" description="Verified by the registrar" icon={GraduationCap} tone="indigo" bodyClassName="p-3.5">
          <div className="divide-y divide-slate-50">
            <InfoRow label="Department" value={student.department || 'Computer Science & Engineering'} />
            <InfoRow label="Programme" value={student.program || 'B.Tech · CSE'} />
            <InfoRow label="Semester" value={`${student.semester || 5} · Section ${student.section || 'A'}`} />
            <InfoRow label="Batch" value={student.batch || '2024 – 2028'} />
            <InfoRow label="Academic advisor" value={student.advisor || 'Dr. Ananya Rao'} />
            <InfoRow label="Credits earned" value={`${student.creditsEarned || 96} / 160`} />
            <InfoRow label="Backlogs" value="1 · CS301 Data Structures" />
            <InfoRow label="Joined" value={student.joined || 'August 2024'} />
          </div>
        </SectionCard>

        <SectionCard
          title="Contact details"
          description="Used for notices and receipts"
          icon={Mail}
          tone="blue"
          action={
            <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 hover:underline">
              {editing ? <Save size={10} /> : <Pencil size={10} />}
              {editing ? 'Save' : 'Edit'}
            </button>
          }
          bodyClassName="p-3.5"
        >
          {editing ? (
            <div className="space-y-2">
              {[
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'address', label: 'Address', icon: MapPin }
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <label key={field.key} className="block">
                    <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                      <Icon size={9} /> {field.label}
                    </span>
                    <input
                      value={contact[field.key]}
                      onChange={(event) => setContact((prev) => ({ ...prev, [field.key]: event.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-[10px] font-semibold text-deepNavy focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                );
              })}
              <Button
                size="xs"
                icon={Save}
                className="w-full"
                onClick={() => {
                  setEditing(false);
                  triggerPopup?.('Contact details updated.', 'success');
                }}
              >
                Save contact details
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                { icon: Mail, label: 'Campus email', value: contact.email },
                { icon: Phone, label: 'Mobile', value: contact.phone },
                { icon: MapPin, label: 'Address', value: contact.address },
                { icon: Home, label: 'Hostel', value: student.hostel || 'Kaveri Block · Room 214' },
                { icon: Droplets, label: 'Blood group', value: student.bloodGroup || 'O+' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon size={12} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                      <p className="text-[10px] font-semibold leading-snug text-deepNavy">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Identity & documents" description="Campus-issued records" icon={Contact} tone="violet" bodyClassName="p-3">
          <div className="space-y-1.5">
            {[
              { label: 'Student ID card', detail: 'Valid until May 2028', icon: Contact },
              { label: 'Semester 5 fee receipt', detail: 'NBR-FEE-2026-0912', icon: BadgeCheck },
              { label: 'Exam form acknowledgement', detail: 'Submitted 20 Oct 2026', icon: CheckCircle2 }
            ].map((document) => {
              const Icon = document.icon;
              return (
                <button
                  key={document.label}
                  onClick={() => triggerPopup?.(`${document.label} opened in the document viewer.`, 'info')}
                  className="flex w-full items-center gap-2 rounded-xl border border-slate-100 px-2.5 py-2 text-left hover:border-violet-200 hover:bg-violet-50/40"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700">
                    <Icon size={12} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9.5px] font-bold text-deepNavy">{document.label}</span>
                    <span className="block truncate text-[8px] font-semibold text-slate-500">{document.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2">
            <Building2 size={12} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-[8px] font-semibold leading-relaxed text-slate-500">
              Physical documents can be collected from the registrar's office with a valid photo ID.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <SectionCard title="Notification preferences" description="Choose what reaches your inbox" icon={Bell} tone="amber" className="xl:col-span-2" bodyClassName="p-3">
          <div className="space-y-1">
            {[
              { key: 'emailNotices', icon: Bell, title: 'Email notices', text: 'Campus and department announcements' },
              { key: 'smsAlerts', icon: Smartphone, title: 'SMS alerts', text: 'Fee deadlines and exam-day reminders' },
              { key: 'placementEmails', icon: UserCog, title: 'Placement updates', text: 'Drive registrations and interview calls' },
              { key: 'autoDownload', icon: BookOpen, title: 'Auto-download materials', text: 'Save new course notes when you open a module' },
              { key: 'aiHistory', icon: Sparkles, title: 'Keep AI study history', text: 'Let Amy remember your previous study threads' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-slate-50">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-deepNavy">{item.title}</p>
                    <p className="text-[8.5px] font-semibold text-slate-500">{item.text}</p>
                  </div>
                  <Toggle
                    checked={preferences[item.key]}
                    onChange={(value) => {
                      setPreferences((prev) => ({ ...prev, [item.key]: value }));
                      triggerPopup?.(`${item.title} ${value ? 'enabled' : 'disabled'}.`, 'info');
                    }}
                    label={item.title}
                    tone="indigo"
                  />
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Account security" description="Protect your campus identity" icon={ShieldCheck} tone="emerald" bodyClassName="p-3.5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-2.5 py-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <div>
                <p className="text-[9.5px] font-bold text-emerald-900">Two-factor enabled</p>
                <p className="text-[8px] font-semibold text-emerald-700/80">OTP on every new device</p>
              </div>
            </div>
            <Divider />
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-semibold text-slate-500">Current session</span>
              <Badge tone="emerald">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-semibold text-slate-500">Last sign-in</span>
              <span className="font-bold text-deepNavy">26 Oct, 08:41</span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-semibold text-slate-500">Device</span>
              <span className="font-bold text-deepNavy">Chrome · Windows</span>
            </div>
            <Button variant="white" size="sm" icon={KeyRound} className="mt-1 w-full" onClick={() => setPasswordOpen(true)}>
              Change password
            </Button>
          </div>
        </SectionCard>
      </div>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        description="Use at least 8 characters with a mix of letters and numbers."
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" icon={KeyRound} loading={changing} onClick={changePassword}>
              Update password
            </Button>
          </>
        }
      >
        <div className="space-y-2.5">
          {[
            { key: 'current', label: 'Current password', placeholder: 'Enter your current password' },
            { key: 'next', label: 'New password', placeholder: 'At least 8 characters' },
            { key: 'confirm', label: 'Confirm new password', placeholder: 'Repeat the new password' }
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{field.label}</span>
              <input
                type="password"
                value={passwords[field.key]}
                onChange={(event) => setPasswords((prev) => ({ ...prev, [field.key]: event.target.value }))}
                placeholder={field.placeholder}
                className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-[10.5px] font-semibold text-deepNavy placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          ))}
          <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[8.5px] font-semibold leading-relaxed text-amber-800">
            Changing your password signs out every other device. Your current session stays active.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfileTab;
