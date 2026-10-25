import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, GraduationCap, MapPin, Search, Sparkles } from 'lucide-react';
import { GlassHeader } from '@/components/global/GlassHeader';
import { Footer } from '@/components/global/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/utils/config';
import { AUTH } from '@/utils/apiEndpoints';
import { useLiveResource } from '@/hooks/useLiveResource';

const FALLBACK_COLLEGES = [
  {
    id: 'demo-northbridge',
    name: 'Northbridge University',
    collegeCode: 'NBR',
    subdomain: 'nbr',
    type: 'college',
    category: 'University',
    location: 'Bangalore, India',
    logoUrl: '/webdata/clg-logo/AmyLearn_demo.png',
    featured: true,
    programmes: 24,
    departments: 4,
    gradient: 'from-[#0A1F44] via-[#1E63D6] to-[#21C7C4]'
  },
  {
    id: 'demo-lakeside',
    name: 'Lakeside Institute of Technology',
    collegeCode: 'LIT',
    subdomain: 'lit',
    type: 'college',
    category: 'Engineering',
    location: 'Pune, India',
    featured: false,
    programmes: 18,
    departments: 6,
    gradient: 'from-[#0f172a] via-[#0369a1] to-[#38bdf8]'
  },
  {
    id: 'demo-highgrove',
    name: 'Highgrove College of Arts & Science',
    collegeCode: 'HCA',
    subdomain: 'hca',
    type: 'college',
    category: 'Arts & Science',
    location: 'Kochi, India',
    featured: false,
    programmes: 14,
    departments: 5,
    gradient: 'from-[#3b0764] via-[#7e22ce] to-[#e879f9]'
  },
  {
    id: 'demo-cobalt',
    name: 'Cobalt School of Business',
    collegeCode: 'CSB',
    subdomain: 'csb',
    type: 'college',
    category: 'Management',
    location: 'Mumbai, India',
    featured: false,
    programmes: 9,
    departments: 3,
    gradient: 'from-[#064e3b] via-[#047857] to-[#6ee7b7]'
  },
  {
    id: 'demo-westfield',
    name: 'Westfield Polytechnic',
    collegeCode: 'WFP',
    subdomain: 'wfp',
    type: 'college',
    category: 'Polytechnic',
    location: 'Nagpur, India',
    featured: false,
    programmes: 11,
    departments: 4,
    gradient: 'from-[#431407] via-[#c2410c] to-[#fdba74]'
  },
  {
    id: 'demo-aurelia',
    name: 'Aurelia Institute of Design',
    collegeCode: 'AID',
    subdomain: 'aid',
    type: 'college',
    category: 'Design',
    location: 'Ahmedabad, India',
    featured: false,
    programmes: 7,
    departments: 2,
    gradient: 'from-[#4a044e] via-[#a21caf] to-[#f0abfc]'
  }
];

const FILTERS = ['All campuses', 'University', 'Engineering', 'Arts & Science', 'Management', 'Polytechnic', 'Design'];

const normalize = (payload) => {
  if (!payload) return FALLBACK_COLLEGES;
  const list = Array.isArray(payload) ? payload : payload.colleges || payload.data || [];
  if (!list.length) return FALLBACK_COLLEGES;
  return list.map((college, index) => ({
    ...FALLBACK_COLLEGES[index % FALLBACK_COLLEGES.length],
    ...college,
    id: college.id || college._id || `college-${index}`,
    programmes: college.programmes ?? FALLBACK_COLLEGES[index % FALLBACK_COLLEGES.length].programmes,
    departments: college.departments ?? FALLBACK_COLLEGES[index % FALLBACK_COLLEGES.length].departments,
    category: college.category || 'University',
    location: college.location || 'India',
    gradient: FALLBACK_COLLEGES[index % FALLBACK_COLLEGES.length].gradient
  }));
};

export const CollegeSelection = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { setSelectedCollege, selectedCollege } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All campuses');

  const { data, loading } = useLiveResource(() => api.get(AUTH.PUBLIC_COLLEGES), {
    fallback: FALLBACK_COLLEGES,
    minLoading: 420,
    deps: []
  });

  const colleges = useMemo(() => normalize(data), [data]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return colleges.filter((college) => {
      const matchesQuery =
        !text ||
        college.name?.toLowerCase().includes(text) ||
        college.collegeCode?.toLowerCase().includes(text) ||
        college.location?.toLowerCase().includes(text);
      const matchesFilter = filter === 'All campuses' || college.category === filter;
      return matchesQuery && matchesFilter;
    });
  }, [colleges, query, filter]);

  const choose = (college) => {
    setSelectedCollege(college);
    toast.success(`${college.name} selected.`);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FD]">
      <GlassHeader
        links={[
          { label: 'For institutions', to: '/for-institutions' },
          { label: 'For students', to: '/for-students' },
          { label: 'Platform', to: '/it-login' }
        ]}
      />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
            <div className="absolute left-1/3 top-40 h-60 w-60 rounded-full bg-violet-200/30 blur-3xl" />
            <div className="landing-grid absolute inset-0 opacity-60" />
          </div>

          <div className="relative mx-auto max-w-container-max px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brandBlue">
                <Sparkles size={11} /> Campus directory
              </span>
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-deepNavy font-jost sm:text-5xl">
                Find your campus.
                <br />
                <span className="primary-gradient-text">Step into your semester.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
                AmyLearn powers the student, faculty and administrator experience for each institution independently.
                Select your campus to continue to the right portal.
              </p>

              <div className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-bento">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by college name, code or city"
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium text-deepNavy placeholder:text-slate-400 focus:outline-none"
                />
                <span className="hidden rounded-xl bg-brandBlue px-3.5 py-2 text-[11px] font-bold text-white sm:block">
                  {filtered.length} campuses
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                {FILTERS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors ${
                      filter === item
                        ? 'border-brandBlue bg-brandBlue text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Active deployments</p>
              <h2 className="mt-1 text-2xl font-extrabold text-deepNavy font-jost">Choose your institution</h2>
            </div>
            {selectedCollege ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:inline-flex">
                <CheckCircle2 size={12} /> Last used: {selectedCollege.name}
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[190px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((college, index) => (
                <motion.button
                  key={college.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  onClick={() => choose(college)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-bento"
                >
                  <div className={`relative h-20 bg-gradient-to-br ${college.gradient || 'from-[#0A1F44] via-[#1E63D6] to-[#21C7C4]'}`}>
                    <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
                    <div className="absolute right-3 top-3 flex items-center gap-1">
                      {college.featured ? (
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                          Featured
                        </span>
                      ) : null}
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        Active
                      </span>
                    </div>
                    <div className="absolute -bottom-5 left-4 grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/95 text-sm font-bold text-deepNavy shadow-sm font-jost">
                      {college.collegeCode || college.name?.slice(0, 3).toUpperCase()}
                    </div>
                  </div>
                  <div className="p-4 pt-7">
                    <p className="truncate text-sm font-extrabold text-deepNavy font-jost">{college.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <MapPin size={10} /> {college.location}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap size={11} /> {college.programmes} programmes
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={11} /> {college.departments} departments
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{college.category}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brandBlue">
                        Continue <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <p className="text-sm font-bold text-deepNavy font-jost">No campus matches “{query}”</p>
              <p className="mt-1 text-xs text-slate-500">Check the spelling or request onboarding for your institution.</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:flex-row">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-brandBlue">
                <Building2 size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-deepNavy font-jost">Your campus not listed?</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  AmyLearn can usually provision a new institution within two weeks.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@amylearn.app?subject=Campus%20onboarding%20request"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2.5 text-[11px] font-bold font-jost text-white hover:bg-brand-700"
            >
              Request onboarding <ArrowRight size={13} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CollegeSelection;
