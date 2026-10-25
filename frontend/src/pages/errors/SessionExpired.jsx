import { useNavigate } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { ErrorPage } from '@/pages/errors/ErrorPage';
import { useAuth } from '@/context/AuthContext';

export const SessionExpired = () => {
  const navigate = useNavigate();
  const { logout, clearExpiredFlag } = useAuth();

  return (
    <ErrorPage
      code="401"
      eyebrow="Session expired"
      title="Your session timed out"
      description="For your security, AmyLearn signs you out after a period of inactivity. Sign in again to pick up exactly where you left off."
      icon={Clock3}
      tone="amber"
      primary={{
        label: 'Sign in again',
        to: '/login',
        onClick: () => {
          logout();
          clearExpiredFlag();
          navigate('/login');
        }
      }}
      secondary={{ label: 'Switch campus', to: '/select-college' }}
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] leading-relaxed text-amber-900">
        Unsaved work in long forms may not be preserved. Drafts for exam forms and feedback are kept locally in your
        browser whenever possible.
      </div>
    </ErrorPage>
  );
};

export default SessionExpired;
