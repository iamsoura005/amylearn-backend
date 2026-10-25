import { Compass } from 'lucide-react';
import { ErrorPage } from '@/pages/errors/ErrorPage';

export const NotFound = () => (
  <ErrorPage
    code="404"
    eyebrow="Lost in the campus map"
    title="This page is not on the timetable"
    description="The address does not match any AmyLearn route. It may have moved, or the link may be incomplete."
    icon={Compass}
    tone="indigo"
    primary={{ label: 'Back to home', to: '/' }}
    secondary={{ label: 'Open campus directory', to: '/select-college' }}
  />
);

export default NotFound;
