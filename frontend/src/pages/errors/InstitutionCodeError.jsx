import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorPage } from '@/pages/errors/ErrorPage';
import { useToast } from '@/context/ToastContext';

export const InstitutionCodeError = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [code, setCode] = useState('');

  return (
    <ErrorPage
      code="400"
      eyebrow="Institution code"
      title="That campus code did not match"
      description="Campus codes are three letters issued during onboarding (for example, NBR). Check the code on your admission letter or ask your administrator."
      icon={KeyRound}
      tone="teal"
      primary={{ label: 'Open campus directory', to: '/select-college' }}
      secondary={{ label: 'Back to home', to: '/' }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!code.trim()) {
            toast.error('Enter a campus code first.');
            return;
          }
          toast.info(`Looking up ${code.trim().toUpperCase()} in the campus directory…`);
          navigate('/select-college');
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 8))}
          placeholder="e.g. NBR"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-deepNavy placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-[11px] font-bold font-jost text-white hover:bg-teal-700"
        >
          Check code
        </button>
      </form>
    </ErrorPage>
  );
};

export default InstitutionCodeError;
