import { Bell } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { NoticeFeed } from './shared/StudentNoticeFeed';
import { MOCK_NOTICES } from '@/pages/auth/campus-student/constants/campusStudentConstants';

export const StudentNoticesTab = ({ triggerPopup, session, college }) => (
  <div className="space-y-4">
    <PageHeader
      eyebrow={college?.name || 'Northbridge University'}
      title="Campus notices"
      description="Examination updates, library circulars, placement drives and campus-wide announcements."
      icon={Bell}
      tone="indigo"
      actions={<Badge tone="indigo" dot>4 unread</Badge>}
    />
    <NoticeFeed notices={MOCK_NOTICES} tone="indigo" triggerPopup={triggerPopup} studentName={session?.name} />
  </div>
);

export default StudentNoticesTab;
