import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-brandBlue text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_8px_20px_-10px_rgba(30,99,214,0.7)]',
  teal: 'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-[0_8px_20px_-10px_rgba(15,118,110,0.7)]',
  indigo:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.7)]',
  violet:
    'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 shadow-[0_8px_20px_-10px_rgba(124,58,237,0.7)]',
  ai: 'bg-gradient-to-r from-ai-500 to-ai-300 text-white hover:opacity-95 shadow-ai-glow',
  secondary:
    'bg-slate-50 text-deepNavy border border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs',
  white: 'bg-white text-deepNavy border border-slate-200 hover:bg-slate-50 shadow-2xs',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-deepNavy',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  'danger-soft': 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  link: 'bg-transparent text-brandBlue hover:underline underline-offset-4 px-0'
};

const SIZES = {
  xs: 'px-2.5 py-1.5 text-[10px] rounded-lg gap-1',
  sm: 'px-3 py-1.5 text-[11px] rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  xl: 'px-6 py-3 text-sm rounded-2xl gap-2.5'
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold font-jost tracking-wide transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={14} /> : null}
    </button>
  );
});

export default Button;
