import { useMemo } from 'react';
import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { NoticeFeed } from '@/pages/auth/campus-student/components/tabs/shared/StudentNoticeFeed';
import { MOCK_FACULTY_NOTICES } from '@/pages/faculty/constants/facultyConstants';

const FacultyNoticesTab = ({ session, triggerPopup }) => {
  const feedNotices = useMemo(
    () =>
      MOCK_FACULTY_NOTICES.map((notice, index) => ({
        ...notice,
        content: notice.body,
        poster: `${notice.department} Office`,
        posterRole: notice.department === 'COE' ? 'COE' : notice.department === 'Library' ? 'Library' : 'Faculty',
        reactions: 4 + index,
        comments: 1,
        type: 'staff'
      })),
    []
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Communication"
        title="Notices"
        description="Campus announcements relevant to faculty."
        icon={Megaphone}
        tone="indigo"
      />

      <NoticeFeed
        notices={feedNotices}
        tone="indigo"
        triggerPopup={triggerPopup}
        studentName={session.name}
        commenterRole="Faculty"
      />
    </div>
  );
};

export default FacultyNoticesTab;
