export const Card = ({ children, className = '', hover = false, as: Tag = 'div', ...props }) => (
  <Tag
    className={`rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${
      hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-bento' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

export const CardHeader = ({
  title,
  description,
  icon: Icon,
  iconWrap = 'bg-slate-100 text-slate-600',
  action,
  className = ''
}) => (
  <div className={`flex items-start justify-between gap-3 ${className}`}>
    <div className="flex min-w-0 items-start gap-2.5">
      {Icon ? (
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${iconWrap}`}>
          <Icon size={15} />
        </span>
      ) : null}
      <div className="min-w-0">
        <h3 className="truncate text-lg font-extrabold leading-tight text-deepNavy font-jost">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const CardBody = ({ children, className = '' }) => <div className={className}>{children}</div>;
export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-slate-100 ${className}`}>{children}</div>
);

export default Card;
