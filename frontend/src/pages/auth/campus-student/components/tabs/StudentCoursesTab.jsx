import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  PlayCircle,
  Search
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress, SearchInput } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { VideoPlayer, PdfViewer } from '@/components/common/VideoPlayer';
import { SectionCard, SoftStat } from './shared/StudentTabKit';
import { useLocalStorage } from '@/hooks/useLiveResource';
import { MOCK_COURSES, MOCK_COURSE_MODULES } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const OPEN_KEY = 'amylearn_course_completion';

export const StudentCoursesTab = ({ triggerPopup }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeCourse, setActiveCourse] = useState(MOCK_COURSES[0].id);
  const [openModule, setOpenModule] = useState(MOCK_COURSE_MODULES[MOCK_COURSES[0].id][0].id);
  const [viewer, setViewer] = useState(null);
  const [completed, setCompleted] = useLocalStorage(OPEN_KEY, {});

  const courses = useMemo(() => {
    const value = query.trim().toLowerCase();
    return MOCK_COURSES.filter((course) => {
      const matchesQuery =
        !value || course.title.toLowerCase().includes(value) || course.code.toLowerCase().includes(value) || course.faculty.toLowerCase().includes(value);
      const matchesFilter =
        filter === 'all' || (filter === 'active' && course.progress < 85) || (filter === 'finishing' && course.progress >= 85);
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const course = MOCK_COURSES.find((item) => item.id === activeCourse) || MOCK_COURSES[0];
  const modules = MOCK_COURSE_MODULES[course.id] || [];
  const courseContents = modules.flatMap((module) => module.contents);
  const completedCount = courseContents.filter((item) => completed[item.id]).length;
  const liveProgress = courseContents.length ? Math.round((completedCount / courseContents.length) * 100) : course.progress;
  const averageProgress = Math.round(MOCK_COURSES.reduce((sum, item) => sum + item.progress, 0) / MOCK_COURSES.length);
  const selectedOpen = openModule && modules.some((module) => module.id === openModule) ? openModule : modules[0]?.id;

  const toggleComplete = (content) => {
    setCompleted({ ...completed, [content.id]: !completed[content.id] });
    triggerPopup?.(
      completed[content.id] ? `Marked “${content.title}” as not completed.` : `“${content.title}” marked complete.`,
      'success'
    );
  };

  const openContent = (content) => {
    if (content.type === 'Document' && !content.downloadEnabled) {
      setViewer(content);
      return;
    }
    setViewer(content);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Learning management"
        title="My courses"
        description="Six registered courses for Semester 5. Open a course to watch lectures, read notes and track what you have finished."
        icon={BookOpen}
        tone="violet"
        actions={<Badge tone="violet">Semester 5 · 20 credits</Badge>}
      />

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <SoftStat label="Active courses" value={MOCK_COURSES.length} hint="All registered" icon={BookOpen} tone="violet" />
        <SoftStat label="Average progress" value={`${averageProgress}%`} hint="Across modules" icon={GraduationCap} tone="indigo" />
        <SoftStat label="Credits" value="20" hint="6 subjects" icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search course, code or faculty…" className="w-full sm:max-w-xs" tone="violet" />
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: 'All courses' },
            { id: 'active', label: 'In progress' },
            { id: 'finishing', label: 'Nearly done' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                filter === item.id ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((item) => {
          const active = item.id === activeCourse;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveCourse(item.id);
                setOpenModule(MOCK_COURSE_MODULES[item.id]?.[0]?.id);
                document.getElementById('course-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all ${
                active ? 'border-violet-300 bg-violet-50/40 shadow-bento' : 'border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-bento'
              }`}
            >
              <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full opacity-[0.07]" style={{ background: item.color }} />
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold ${item.tint}`}>{item.code}</span>
                <span className="text-[9px] font-bold text-slate-500">{item.credits} credits</span>
              </div>
              <h3 className="mt-2 line-clamp-2 min-h-[32px] text-[12.5px] font-extrabold leading-tight text-deepNavy font-jost">
                {item.title}
              </h3>
              <p className="mt-0.5 truncate text-[9.5px] font-semibold text-slate-500">{item.faculty}</p>
              <div className="mt-2.5">
                <Progress value={item.progress} tone={item.id === 'ai' ? 'violet' : item.id === 'networks' ? 'teal' : 'blue'} label="Course progress" sublabel={`${item.progress}%`} />
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="inline-flex min-w-0 items-center gap-1 text-[9px] font-semibold text-slate-500">
                  <Clock size={10} className="shrink-0" />
                  <span className="truncate">{item.next}</span>
                </span>
                <ArrowRight size={12} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-600" />
              </div>
            </button>
          );
        })}
      </div>

      {!courses.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center">
          <Search size={20} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-deepNavy font-jost">No course matched that search</p>
        </div>
      ) : null}

      <div id="course-detail" className="scroll-mt-20">
        <SectionCard
          title={course.title}
          description={`${course.code} · ${course.faculty} · ${modules.length} modules · ${courseContents.length} resources`}
          icon={BookOpen}
          tone="violet"
          action={
            <div className="flex items-center gap-2">
              <Badge tone="violet">{liveProgress}% complete</Badge>
              <Badge tone="slate">{completedCount}/{courseContents.length}</Badge>
            </div>
          }
          bodyClassName="p-2.5 sm:p-3"
        >
          <div className="mb-2.5 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-violet-900">
              <span>Your progress in this course</span>
              <span>{liveProgress}%</span>
            </div>
            <Progress value={liveProgress} tone="violet" className="mt-1.5" thickness="h-1" />
            <p className="mt-1 text-[9px] font-medium text-violet-700/70">Next class · {course.next} · {course.nextAt}</p>
          </div>

          <div className="space-y-1.5">
            {modules.map((module, index) => {
              const open = module.id === selectedOpen;
              const moduleDone = module.contents.filter((content) => completed[content.id]).length;
              return (
                <div key={module.id} className={`overflow-hidden rounded-xl border ${open ? 'border-violet-200 bg-violet-50/20' : 'border-slate-100 bg-white'}`}>
                  <button
                    onClick={() => setOpenModule(open ? null : module.id)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-extrabold ${open ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11.5px] font-bold text-deepNavy">{module.title}</span>
                      <span className="mt-0.5 block truncate text-[9px] font-medium text-slate-500">{module.description}</span>
                    </span>
                    <span className="shrink-0 text-[9px] font-bold text-slate-500">
                      {moduleDone}/{module.contents.length}
                    </span>
                    <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? (
                    <div className="space-y-1 px-2 pb-2 sm:px-3">
                      {module.contents.map((content) => {
                        const done = Boolean(completed[content.id]);
                        return (
                          <div key={content.id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
                            <button
                              onClick={() => toggleComplete(content)}
                              aria-label={done ? `Mark ${content.title} incomplete` : `Mark ${content.title} complete`}
                              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                                done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-emerald-400'
                              }`}
                            >
                              <CheckCircle2 size={11} />
                            </button>
                            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${content.type === 'Video' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-brandBlue'}`}>
                              {content.type === 'Video' ? <PlayCircle size={13} /> : <FileText size={13} />}
                            </span>
                            <button onClick={() => openContent(content)} className="min-w-0 flex-1 text-left">
                              <span className={`block truncate text-[10.5px] font-bold ${done ? 'text-slate-500 line-through' : 'text-deepNavy'}`}>
                                {content.title}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-[8.5px] font-semibold text-slate-500">
                                {content.type} · {content.duration}
                                {content.downloadEnabled ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-700">
                                    <Download size={8} /> Downloadable
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-amber-700">
                                    <Lock size={8} /> View only
                                  </span>
                                )}
                              </span>
                            </button>
                            <button
                              onClick={() => openContent(content)}
                              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-violet-600"
                              aria-label={`Open ${content.title}`}
                            >
                              <ExternalLink size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <Modal
        open={Boolean(viewer)}
        onClose={() => setViewer(null)}
        title={viewer?.title || 'Course resource'}
        description={viewer ? `${course.code} · ${viewer.type} · ${viewer.duration}` : undefined}
        size="lg"
        footer={
          viewer ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setViewer(null)}>
                Close
              </Button>
              {viewer.type === 'Document' && viewer.downloadEnabled ? (
                <a href={viewer.url} target="_blank" rel="noreferrer">
                  <Button size="sm" icon={Download}>Download</Button>
                </a>
              ) : null}
            </>
          ) : null
        }
      >
        {viewer?.type === 'Video' ? (
          <VideoPlayer
            url={viewer.url}
            title={viewer.title}
            downloadEnabled={viewer.downloadEnabled}
            duration={viewer.duration}
            subtitle={`${course.title} · streamed from the campus media library`}
          />
        ) : viewer ? (
          <PdfViewer url={viewer.url} title={viewer.title} downloadEnabled={viewer.downloadEnabled} />
        ) : null}
      </Modal>
    </div>
  );
};

export default StudentCoursesTab;
