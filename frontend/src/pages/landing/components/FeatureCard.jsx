import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

const TONES = {
  blue: {
    icon: 'bg-blue-50 text-brandBlue',
    accent: 'from-brandBlue/70 via-skyBlue/40 to-transparent',
    badge: 'blue'
  },
  teal: {
    icon: 'bg-teal-50 text-teal-700',
    accent: 'from-learningTeal/80 via-teal-300/40 to-transparent',
    badge: 'teal'
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-700',
    accent: 'from-indigo-500/70 via-indigo-300/40 to-transparent',
    badge: 'indigo'
  },
  violet: {
    icon: 'bg-ai-50 text-ai-600',
    accent: 'from-ai-500/70 via-ai-300/40 to-transparent',
    badge: 'violet'
  },
  navy: {
    icon: 'bg-slate-100 text-deepNavy',
    accent: 'from-deepNavy/70 via-slate-400/30 to-transparent',
    badge: 'slate'
  }
};

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  bullets = [],
  badge,
  tone = 'blue',
  className = '',
  children
}) => {
  const colors = TONES[tone] || TONES.blue;

  return (
    <motion.div whileHover={{ y: -3, transition: { duration: 0.15 } }} className={`h-full ${className}`}>
      <Card className="group relative flex h-full flex-col overflow-hidden p-5 sm:p-6">
        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${colors.accent}`} />
        <div className="flex items-start justify-between gap-2">
          {Icon ? (
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colors.icon}`}>
              <Icon size={18} />
            </span>
          ) : null}
          {badge ? <Badge tone={colors.badge}>{badge}</Badge> : null}
        </div>

        <h3 className="mt-4 text-lg font-extrabold leading-snug text-deepNavy">{title}</h3>
        <p className="mt-2 text-xs leading-6 text-slate-500">{description}</p>

        {bullets.length ? (
          <ul className="mt-3 space-y-1.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <Check size={8} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}

        {children ? <div className="mt-auto pt-4">{children}</div> : null}
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
