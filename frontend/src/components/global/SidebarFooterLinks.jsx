import { Link } from 'react-router-dom';
import { LifeBuoy, Shield, ScrollText } from 'lucide-react';

export const SidebarFooterLinks = ({ tone = 'light' }) => {
  const dark = tone === 'light';
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[9px] font-semibold ${dark ? 'text-white/55' : 'text-slate-500'}`}>
      <Link to="/terms" className={`inline-flex items-center gap-1 ${dark ? 'hover:text-white/80' : 'hover:text-slate-700'}`}>
        <ScrollText size={10} /> Terms
      </Link>
      <Link to="/privacy" className={`inline-flex items-center gap-1 ${dark ? 'hover:text-white/80' : 'hover:text-slate-700'}`}>
        <Shield size={10} /> Privacy
      </Link>
      <a href="mailto:support@amylearn.app" className={`inline-flex items-center gap-1 ${dark ? 'hover:text-white/80' : 'hover:text-slate-700'}`}>
        <LifeBuoy size={10} /> Support
      </a>
    </div>
  );
};

export default SidebarFooterLinks;
