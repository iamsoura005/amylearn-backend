import { Building2 } from 'lucide-react';
import { ErrorPage } from '@/pages/errors/ErrorPage';

export const InstitutionError = () => (
  <ErrorPage
    code="403"
    eyebrow="Institution unavailable"
    title="This campus is not active right now"
    description="Your institution's AmyLearn deployment may be paused for maintenance, billing review or onboarding. Your data stays safe while access is suspended."
    icon={Building2}
    tone="rose"
    primary={{ label: 'Choose another campus', to: '/select-college' }}
    secondary={{ label: 'Back to home', to: '/' }}
  >
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[10px] leading-relaxed text-rose-900">
      If you are a campus administrator, contact the AmyLearn platform team at{' '}
      <a href="mailto:support@amylearn.app" className="font-bold underline underline-offset-2">
        support@amylearn.app
      </a>{' '}
      to restore access.
    </div>
  </ErrorPage>
);

export default InstitutionError;
