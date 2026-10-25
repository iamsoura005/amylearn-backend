import { Megaphone, Pin } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { NoticeFeed } from './shared/StudentNoticeFeed';
import { MOCK_DEPT_NOTICES } from '@/pages/auth/campus-student/constants/campusStudentConstants';

export const StudentDeptNoticesTab = ({ triggerPopup, session }) => (
  <div className="space-y-4">
    <PageHeader
      eyebrow="Computer Science & Engineering"
      title="Department notices"
      description="Project reviews, seminars, lab updates and academic instructions from your department."
      icon={Megaphone}
      tone="orange"
      actions={
        <div className="flex items-center gap-1.5">
          <Badge tone="orange" dot>3 new</Badge>
          <Badge tone="slate"><Pin size={9} /> 1 pinned</Badge>
        </div>
      }
    />
    <NoticeFeed notices={MOCK_DEPT_NOTICES} tone="orange" triggerPopup={triggerPopup} studentName={session?.name} />
  </div>
);

export default StudentDeptNoticesTab;
