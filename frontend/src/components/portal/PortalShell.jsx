import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight, LogOut, Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';
import { SidebarFooterLinks } from '@/components/global/SidebarFooterLinks';
import { Avatar } from '@/components/ui/Primitives';
import { AiDrawer } from '@/components/ai/AiDrawer';

const PALETTES = {
  teal: {
    sidebar: 'bg-gradient-to-b from-[#042f2e] via-[#0a4a45] to-[#0f766e]',
    accentText: 'text-learningTeal',
    accentBg: 'bg-learningTeal',
    activeItem: 'bg-white/14 text-white',
    inactiveItem: 'text-white/60 hover:bg-white/8 hover:text-white/90',
    iconActive: 'bg-white/12 text-learningTeal',
    pageBg: 'bg-[#F0FDFA]',
    headerBorder: 'border-teal-100/80',
    focusRing: 'focus:border-teal-300 focus:ring-teal-100',
    searchBg: 'bg-[#F6FEFC]',
    avatarTone: 'teal',
    chip: 'bg-teal-50 text-teal-700',
    skeletonTone: 'teal'
  },
  navy: {
    sidebar: 'bg-gradient-to-b from-[#0A1F44] via-[#102a5c] to-[#1E63D6]',
    accentText: 'text-sky-300',
    accentBg: 'bg-sky-400',
    activeItem: 'bg-white/14 text-white',
    inactiveItem: 'text-white/60 hover:bg-white/8 hover:text-white/90',
    iconActive: 'bg-white/12 text-sky-300',
    pageBg: 'bg-[#F2F6FC]',
    headerBorder: 'border-blue-100/80',
    focusRing: 'focus:border-blue-300 focus:ring-blue-100',
    searchBg: 'bg-[#F6F9FE]',
    avatarTone: 'blue',
    chip: 'bg-blue-50 text-brandBlue',
    skeletonTone: 'blue'
  },
  indigo: {
    sidebar: 'bg-gradient-to-b from-[#14112e] via-[#1d1747] to-[#2b2666]',
    accentText: 'text-indigo-300',
    accentBg: 'bg-indigo-400',
    activeItem: 'bg-white/14 text-white',
    inactiveItem: 'text-white/60 hover:bg-white/8 hover:text-white/90',
    iconActive: 'bg-white/12 text-indigo-300',
    pageBg: 'bg-[#F5F4FF]',
    headerBorder: 'border-indigo-100/80',
    focusRing: 'focus:border-indigo-300 focus:ring-indigo-100',
    searchBg: 'bg-[#F8F7FF]',
    avatarTone: 'indigo',
    chip: 'bg-indigo-50 text-indigo-700',
    skeletonTone: 'indigo'
  }
};

const Sidebar = ({ palette, activeTab, setTab, user, college, sections, onLogout, onClose }) => {
  const tones = PALETTES[palette];
  return (
    <div className={`flex h-full flex-col ${tones.sidebar}`}>
      <div className="flex items-center justify-between px-4 pb-4 pt-4">
        <Link to="/" onClick={onClose}>
          <AmyLearnLogo size={32} tone="light" showTagline />
        </Link>
        {onClose ? (
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/70 lg:hidden" aria-label="Close menu">
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="mx-3 rounded-2xl border border-white/10 bg-white/5 p-2.5">
        <div className="flex items-center gap-2">
          <Avatar name={user.name} size="sm" tone={tones.avatarTone} className="!bg-white/15 !text-white" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-white">{user.name}</p>
            <p className="truncate text-[9px] font-medium text-white/55">{user.subtitle}</p>
          </div>
          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${tones.accentBg} text-deepNavy`}>{user.badge}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 border-t border-white/8 pt-2 text-[9px] font-semibold text-white/55">
          <span className="grid h-4 w-4 place-items-center rounded bg-white/10 text-[7px] font-bold text-white/60">
            {college?.collegeCode || 'NBR'}
          </span>
          <span className="truncate">{college?.name || 'Northbridge University'}</span>
        </div>
      </div>

      <nav className="portal-sidebar-scroll mt-3 flex-1 overflow-y-auto px-3 pb-3">
        {sections.map((section) => (
          <div key={section.id} className={section.label ? 'mt-4' : ''}>
            <p className="mb-1.5 px-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/55">
              {section.label || 'Portal'}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      onClose?.();
                    }}
                    className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      active ? tones.activeItem : tones.inactiveItem
                    }`}
                  >
                    {active ? <span className={`absolute -left-2 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full ${tones.accentBg}`} /> : null}
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? tones.iconActive : 'text-white/45 group-hover:text-white/80'}`}>
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[11px] font-semibold ${active ? 'text-white' : ''}`}>{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                        active ? 'bg-white/15 text-white/80' : 'bg-white/8 text-white/55'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-3">
        <div className="mt-1 flex items-center justify-between">
          <SidebarFooterLinks tone="light" />
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[9px] font-bold text-white/55 hover:bg-white/10 hover:text-white/80"
          >
            <LogOut size={10} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export const PortalShell = ({
  palette = 'teal',
  portalLabel = 'Portal',
  sections = [],
  navItems = [],
  user,
  college,
  onLogout,
  initialTab = 'overview',
  tabComponents = {},
  activeTab,
  onTabChange,
  loading = false,
  skeleton = null,
  notifications = [],
  onOpenNotif,
  headerActions,
  aiEnabled = false,
  aiUserName,
  aiClassroom,
  footerNote,
  children
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerPopup } = useErrorPopup();
  const [internalTab, setInternalTab] = useState(tabComponents[initialTab] ? initialTab : 'overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visited = useRef(new Set());
  const tones = PALETTES[palette] || PALETTES.teal;

  const currentTab = activeTab || internalTab;
  const setTab = (tab) => {
    if (!tabComponents[tab]) return;
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (searchParams.get('tab') !== currentTab) {
      setSearchParams(currentTab === 'overview' ? {} : { tab: currentTab }, { replace: true });
    }
    visited.current.add(currentTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const activeItem = navItems.find((item) => item.id === currentTab) || navItems[0];

  const headerSearch = (event) => {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;
    const match = navItems.find((item) => item.label.toLowerCase().includes(value) || item.id.includes(value));
    if (match) setTab(match.id);
    else triggerPopup(`No module matched “${query}”. Try one of the sidebar labels.`, 'info');
    setQuery('');
  };

  const sectionGroups = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        items: navItems.filter((item) => item.section === section.id)
      })),
    [sections, navItems]
  );

  return (
    <div className={`min-h-screen ${tones.pageBg}`}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] lg:block">
        <Sidebar
          palette={palette}
          activeTab={currentTab}
          setTab={setTab}
          user={user}
          college={college}
          sections={sectionGroups}
          onLogout={onLogout}
        />
      </aside>

      <AnimatePresence>
        {mobileMenu ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-deepNavy/45 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenu(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="h-full w-[82%] max-w-[300px] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Sidebar
                palette={palette}
                activeTab={currentTab}
                setTab={setTab}
                user={user}
                college={college}
                sections={sectionGroups}
                onLogout={onLogout}
                onClose={() => setMobileMenu(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-[258px]">
        <header className={`sticky top-0 z-30 border-b ${tones.headerBorder} bg-white/85 backdrop-blur-xl`}>
          <div className="flex h-[60px] items-center gap-3 px-3 sm:px-5">
            <button
              onClick={() => setMobileMenu(true)}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones.chip} lg:hidden`}
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>

            <div className="hidden min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500 md:flex">
              <span>{portalLabel}</span>
              <ChevronRight size={11} />
              <span className="truncate text-deepNavy">{activeItem?.label || 'Overview'}</span>
            </div>

            <form onSubmit={headerSearch} className="ml-auto hidden max-w-xs flex-1 items-center sm:flex lg:ml-6">
              <label className="relative flex w-full items-center">
                <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Jump to a module…"
                  className={`w-full rounded-xl border border-slate-100 ${tones.searchBg} py-2 pl-8 pr-3 text-[11px] font-medium text-deepNavy placeholder:text-slate-400 focus:outline-none focus:ring-2 ${tones.focusRing}`}
                />
              </label>
            </form>

            <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
              {headerActions}

              {aiEnabled ? (
                <button
                  onClick={() => setAiOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-ai-500 to-ai-300 px-2.5 py-2 text-[10px] font-bold font-jost text-white shadow-ai-glow hover:opacity-95"
                >
                  <SparklesIcon size={13} />
                  <span className="hidden sm:inline">Ask Amy</span>
                </button>
              ) : null}

              {notifications.length ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen((value) => !value);
                      setProfileOpen(false);
                    }}
                    className={`relative grid h-9 w-9 place-items-center rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-deepNavy`}
                    aria-label="Notifications"
                  >
                    <Bell size={15} />
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  </button>
                  {notifOpen ? (
                    <div className="absolute right-0 mt-2 w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-bento">
                      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                        <p className="text-[11px] font-bold text-deepNavy font-jost">Notifications</p>
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${tones.chip}`}>
                          {notifications.length} new
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {notifications.slice(0, 4).map((notice, index) => (
                          <button
                            key={notice.id || index}
                            onClick={() => {
                              setNotifOpen(false);
                              if (notice.tab) setTab(notice.tab);
                              onOpenNotif?.(notice);
                            }}
                            className="w-full rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
                          >
                            <p className="truncate text-[10px] font-bold text-deepNavy">{notice.title}</p>
                            <p className="mt-0.5 text-[9px] text-slate-500">{notice.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="relative">
                <button
                  onClick={() => {
                    setProfileOpen((value) => !value);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white py-1 pl-1 pr-2.5 hover:bg-slate-50"
                >
                  <Avatar name={user.name} size="sm" tone={tones.avatarTone} />
                  <span className="hidden text-left sm:block">
                    <span className="block text-[10px] font-bold leading-tight text-deepNavy">{user.name.split(' ')[0]}</span>
                    <span className="block text-[8px] font-semibold leading-tight text-slate-500">{user.roleLabel}</span>
                  </span>
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-bento">
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[11px] font-bold text-deepNavy">{user.name}</p>
                      <p className="truncate text-[9px] text-slate-500">{user.subtitle}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={13} /> Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-3 pb-10 pt-4 sm:px-5 sm:pt-6">
          {loading ? (
            skeleton || null
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}

          <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-200/70 pt-4 text-[9px] font-semibold text-slate-600 sm:flex-row">
            <p>{footerNote || `AmyLearn ${portalLabel} · ${college?.name || 'Northbridge University'}`}</p>
            <div className="flex items-center gap-3">
              <Link to="/terms" className="hover:text-slate-700">Terms</Link>
              <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
              <span className="text-slate-600">AmyLearn · v1.0</span>
            </div>
          </footer>
        </main>
      </div>

      {aiEnabled ? (
        <AiDrawer
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          userName={aiUserName || user.name}
          classroomName={aiClassroom || 'Campus workspace'}
        />
      ) : null}
    </div>
  );
};

const SparklesIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default PortalShell;
