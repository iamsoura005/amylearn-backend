import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, Eye, EyeOff, GraduationCap, Lock, ShieldCheck } from 'lucide-react';
import { AuthShell, AuthField } from '@/pages/auth/AuthShell';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const CampusLogin = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loginCollege, selectedCollege, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const college = selectedCollege || { name: 'Northbridge University', collegeCode: 'NBR' };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginCollege(identifier, password, selectedCollege);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
      return;
    }
    toast.success(`Welcome back, ${result.user.name.split(' ')[0]}.`);
    navigate('/dashboard');
  };

  const fill = (account) => {
    setIdentifier(account.identifier);
    setPassword(account.password);
    setError('');
  };

  return (
    <AuthShell
      tone="indigo"
      badge="Campus portal"
      title="Welcome back to campus"
      subtitle={
        <>
          Signing in to <span className="font-bold text-indigo-700">{college.name}</span> ·{' '}
          <Link to="/select-college" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-deepNavy">
            change campus
          </Link>
        </>
      }
      asideTitle="One calm place for your entire academic week."
      asideText="Attendance, marks, lecture notes, exam forms, admit cards and an AI study companion — all under your campus login."
      bullets={[
        'Live attendance and published results',
        'Lecture modules with completion tracking',
        'Socratic AI tutor and mind-map builder',
        'Library loans and digital resources'
      ]}
      stats={[
        { value: '20+', label: 'Student modules' },
        { value: '14d', label: 'Library loans' },
        { value: '24/7', label: 'AI study help' }
      ]}
      demoAccounts={[DEMO_ACCOUNTS.student, DEMO_ACCOUNTS.faculty]}
      onDemoSelect={fill}
      crossLink={{ to: '/campus-admin-login', label: 'Campus admin' }}
      backLabel="Back to AmyLearn"
    >
      {user ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800">
          You are already signed in as {user.name}.{' '}
          <Link to="/dashboard" className="underline underline-offset-2">
            Continue to dashboard
          </Link>
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-3.5">
        <AuthField label="Campus identifier" icon={AtSign}>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            placeholder="Roll number, email or faculty ID"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-deepNavy shadow-2xs placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </AuthField>

        <AuthField
          label="Password"
          icon={Lock}
          hint={
            <button
              type="button"
              onClick={() => setHelpOpen((value) => !value)}
              className="font-semibold normal-case tracking-normal text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>
          }
        >
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs font-medium text-deepNavy shadow-2xs placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </AuthField>

        {helpOpen ? (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 text-[10px] leading-relaxed text-indigo-800">
            Password resets are handled by your campus administrator. Write to{' '}
            <a href="mailto:support@amylearn.app" className="font-bold underline underline-offset-2">
              support@amylearn.app
            </a>{' '}
            with your roll number and department.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold font-jost text-white shadow-[0_12px_26px_-14px_rgba(79,70,229,0.9)] transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </>
          ) : (
            <>
              Enter campus <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-600" /> Sessions last 24 hours
        </span>
        <Link to="/campus-admin-login" className="font-bold text-indigo-700 hover:underline">
          Admin sign in
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          to="/select-college"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
        >
          <GraduationCap size={13} /> Find your campus
        </Link>
        <Link
          to="/it-login"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
        >
          AmyLearn platform team
        </Link>
      </div>
    </AuthShell>
  );
};

export default CampusLogin;
