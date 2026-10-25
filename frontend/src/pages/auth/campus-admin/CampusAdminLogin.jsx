import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, Building2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { AuthShell, AuthField } from '@/pages/auth/AuthShell';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const CampusAdminLogin = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loginCampusAdmin, selectedCollege } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const college = selectedCollege || { name: 'Northbridge University', collegeCode: 'NBR' };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginCampusAdmin(identifier, password, selectedCollege);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
      return;
    }
    toast.success('Campus console ready.');
    navigate('/dashboard');
  };

  return (
    <AuthShell
      tone="teal"
      badge="Campus administrator"
      title="Run your campus on one console"
      subtitle={
        <>
          Institution console for <span className="font-bold text-teal-700">{college.name}</span> ·{' '}
          <Link to="/select-college" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-deepNavy">
            change campus
          </Link>
        </>
      }
      asideTitle="Departments, exams, faculty and students — finally in one system."
      asideText="Configure streams and curriculum, publish results, manage library circulation and keep every department aligned."
      bullets={[
        'Curriculum & roster configuration',
        'Exam forms, fees and result publishing',
        'Faculty attendance and leave approvals',
        'Library circulation with overdue alerts'
      ]}
      stats={[
        { value: '12h', label: 'Admin session' },
        { value: '6', label: 'Core modules' },
        { value: '100%', label: 'Tenant isolated' }
      ]}
      demoAccounts={[DEMO_ACCOUNTS.campusAdmin]}
      onDemoSelect={(account) => {
        setIdentifier(account.identifier);
        setPassword(account.password);
        setError('');
      }}
      crossLink={{ to: '/login', label: 'Student / faculty' }}
      backLabel="Back to AmyLearn"
    >
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-teal-100 bg-teal-50/70 px-3 py-2.5 text-[10px] leading-relaxed text-teal-900">
        <Building2 size={14} className="mt-0.5 shrink-0" />
        <span>
          Campus administrator access is issued by the AmyLearn platform team. Contact support if your institution has
          not been activated yet.
        </span>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <AuthField label="Administrator email" icon={AtSign}>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            placeholder="admin.campus@amylearn.demo"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-deepNavy shadow-2xs placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </AuthField>

        <AuthField label="Password" icon={Lock}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs font-medium text-deepNavy shadow-2xs placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
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

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-bold font-jost text-white shadow-[0_12px_26px_-14px_rgba(13,148,136,0.9)] transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Opening console…
            </>
          ) : (
            <>
              Open campus console <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-teal-600" /> 12-hour administrative session
        </span>
        <Link to="/login" className="font-bold text-teal-700 hover:underline">
          Student portal
        </Link>
      </div>
    </AuthShell>
  );
};

export default CampusAdminLogin;
