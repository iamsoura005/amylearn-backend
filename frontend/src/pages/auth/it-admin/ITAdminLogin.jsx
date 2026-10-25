import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { AuthShell, AuthField } from '@/pages/auth/AuthShell';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const ITAdminLogin = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loginIT } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginIT(identifier, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
      return;
    }
    toast.success('Platform console unlocked.');
    navigate('/dashboard');
  };

  return (
    <AuthShell
      tone="blue"
      badge="Restricted · AmyLearn staff"
      title="AmyLearn platform console"
      subtitle="Operations and tenant administration for the entire AmyLearn network."
      asideTitle="Every institution. One operating rhythm."
      asideText="Provision campuses, manage administrator roles, publish feature menus and keep the platform healthy from a single console."
      bullets={[
        'Tenant onboarding and lifecycle controls',
        'Per-tenant menu and feature flags',
        'Global role and administrator management',
        'Operational analytics and audit visibility'
      ]}
      stats={[
        { value: '8h', label: 'Platform session' },
        { value: '∞', label: 'Tenants' },
        { value: 'AES', label: 'At-rest secrets' }
      ]}
      demoAccounts={[DEMO_ACCOUNTS.itAdmin, DEMO_ACCOUNTS.itManager]}
      onDemoSelect={(account) => {
        setIdentifier(account.identifier);
        setPassword(account.password);
        setError('');
      }}
      crossLink={{ to: '/login', label: 'Campus portal' }}
      backLabel="Back to AmyLearn"
    >
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] leading-relaxed text-amber-900">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <span>
          Authorised AmyLearn staff only. All console activity is attributable to the signed-in operator and retained for
          audit review.
        </span>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <AuthField label="Work email" icon={AtSign}>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            placeholder="name@amylearn.app"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-deepNavy shadow-2xs placeholder:text-slate-400 focus:border-brandBlue focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </AuthField>

        <AuthField label="Platform password" icon={Lock}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your platform password"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs font-medium text-deepNavy shadow-2xs placeholder:text-slate-400 focus:border-brandBlue focus:outline-none focus:ring-2 focus:ring-blue-100"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brandBlue py-2.5 text-xs font-bold font-jost text-white shadow-[0_12px_26px_-14px_rgba(30,99,214,0.9)] transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Verifying operator…
            </>
          ) : (
            <>
              Unlock platform console <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <KeyRound size={12} className="text-brandBlue" /> JWT with server-side revocation
        </span>
        <Link to="/campus-admin-login" className="font-bold text-brandBlue hover:underline">
          Campus admin
        </Link>
      </div>
    </AuthShell>
  );
};

export default ITAdminLogin;
