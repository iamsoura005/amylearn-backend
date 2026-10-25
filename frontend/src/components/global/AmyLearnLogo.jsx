export const AmyLearnMark = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="amylearn-mark-gradient" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0A1F44" />
        <stop offset="0.52" stopColor="#1E63D6" />
        <stop offset="1" stopColor="#21C7C4" />
      </linearGradient>
      <linearGradient id="amylearn-page-gradient" x1="12" y1="35" x2="36" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.45" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#amylearn-mark-gradient)" />
    <rect x="1" y="1" width="46" height="46" rx="13" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1.5" />
    <path
      d="M13.8 33.6L24 11.8L34.2 33.6"
      stroke="#FFFFFF"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18.1 26.4H29.9" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
    <path
      d="M12.6 38.2C16 36.4 20 36.4 24 38.2C28 36.4 32 36.4 35.4 38.2"
      stroke="url(#amylearn-page-gradient)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="24" r="21" stroke="#FFFFFF" strokeOpacity="0.08" />
  </svg>
);

export const AmyLearnLogo = ({
  variant = 'full',
  size = 38,
  tone = 'dark',
  showTagline = false,
  className = '',
  textClassName = ''
}) => {
  const wordColor = tone === 'light' ? 'text-white' : 'text-deepNavy';
  const subColor = tone === 'light' ? 'text-white/60' : 'text-slate-500';
  const wordmark = (
    <div className="flex flex-col leading-none">
      <span className={`font-jost text-[1.35em] font-bold tracking-tight ${wordColor} ${textClassName}`}>
        Amy<span className="bg-gradient-to-r from-brandBlue to-learningTeal bg-clip-text text-transparent">Learn</span>
      </span>
      {showTagline ? (
        <span className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${subColor}`}>
          Unified academic platform
        </span>
      ) : null}
    </div>
  );

  if (variant === 'mark') return <AmyLearnMark size={size} className={className} />;

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <AmyLearnMark size={size} />
        {wordmark}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <AmyLearnMark size={size} />
      {wordmark}
    </div>
  );
};

export default AmyLearnLogo;
