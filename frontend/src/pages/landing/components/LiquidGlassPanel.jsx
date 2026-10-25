export const LiquidGlassPanel = ({
  children,
  tone = 'light',
  className = '',
  as: Tag = 'div',
  ...props
}) => (
  <Tag
    className={`relative overflow-hidden rounded-3xl border ${
      tone === 'dark'
        ? 'border-white/15 bg-white/[0.07] text-white shadow-[0_24px_70px_-34px_rgba(0,0,0,0.7)] backdrop-blur-xl'
        : 'glass-panel text-deepNavy'
    } ${className}`}
    {...props}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -left-14 -top-16 h-36 w-36 rounded-full blur-2xl ${
        tone === 'dark' ? 'bg-skyBlue/25' : 'bg-skyBlue/20'
      }`}
    />
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -bottom-20 -right-10 h-40 w-40 rounded-full blur-3xl ${
        tone === 'dark' ? 'bg-learningTeal/20' : 'bg-learningTeal/15'
      }`}
    />
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
    />
    <div className="relative">{children}</div>
  </Tag>
);

export default LiquidGlassPanel;
