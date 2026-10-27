import { useMemo, useState, useEffect } from 'react';
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Primitives';
import { SectionCard, SoftStat } from './shared/StudentTabKit';
import { MOCK_COURSES, MOCK_FEEDBACK_QUESTIONS } from '@/pages/auth/campus-student/constants/campusStudentConstants';
import api from '@/utils/config';

const SCALE = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' }
];

export const StudentSemFeedbackTab = ({ triggerPopup }) => {
  const [courseId, setCourseId] = useState(MOCK_COURSES[0].id);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const loadFeedback = async () => {
      try {
        const res = await api.get('/api/student/sem-feedback');
        if (active && res.data?.feedback) {
          const map = {};
          (Array.isArray(res.data.feedback) ? res.data.feedback : [res.data.feedback]).forEach((f) => {
            if (f && f.responses) {
              f.responses.forEach((r) => {
                if (r.subjectId) map[r.subjectId] = true;
              });
            }
            if (f && f.courseId) map[f.courseId] = true;
          });
          setSubmitted((prev) => ({ ...prev, ...map }));
        }
      } catch {
        // Fallback
      }
    };
    loadFeedback();
    return () => {
      active = false;
    };
  }, []);

  const course = MOCK_COURSES.find((item) => item.id === courseId);
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / MOCK_FEEDBACK_QUESTIONS.length) * 100);
  const done = Boolean(submitted[courseId]);
  const submittedCount = Object.keys(submitted).length;

  const average = useMemo(() => {
    const values = Object.values(answers);
    if (!values.length) return 0;
    return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
  }, [answers]);

  const submit = async () => {
    if (answered < MOCK_FEEDBACK_QUESTIONS.length) {
      triggerPopup?.('Please answer every statement before submitting your feedback.', 'warning');
      return;
    }
    setSending(true);
    try {
      const avg = Number(average) || 4;
      await api.post('/api/student/sem-feedback', {
        responses: [
          {
            subjectId: courseId,
            rating: Math.round(avg),
            comments: comment || 'Course feedback submitted.'
          }
        ],
        extra: {
          courseId,
          courseName: course?.name,
          answers,
          comment
        }
      });
      setSubmitted((prev) => ({ ...prev, [courseId]: true }));
      setAnswers({});
      setComment('');
      triggerPopup?.('Feedback submitted and recorded in institutional ledger. Thank you!', 'success');
    } catch (err) {
      triggerPopup?.(err?.response?.data?.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Semester 5 · feedback window"
        title="Semester feedback"
        description="Share anonymous course feedback. Faculty see aggregated results only after results are published."
        icon={MessageSquare}
        tone="teal"
        actions={<Badge tone="teal" dot>Open until 5 Nov</Badge>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Courses" value={MOCK_COURSES.length} hint="Awaiting feedback" icon={BookOpen} tone="teal" />
        <SoftStat label="Submitted" value={submittedCount} hint={`${MOCK_COURSES.length - submittedCount} remaining`} icon={CheckCircle2} tone="emerald" />
        <SoftStat label="Statements" value={MOCK_FEEDBACK_QUESTIONS.length} hint="Per course" icon={MessageSquare} tone="indigo" />
        <SoftStat label="Privacy" value="Anon" hint="No name attached" icon={Lock} tone="violet" />
      </div>

      <div className="grid gap-3 xl:grid-cols-4">
        <SectionCard title="Choose a course" description="One form per registered course" icon={BookOpen} tone="teal" className="xl:col-span-1" bodyClassName="p-2">
          <div className="space-y-1">
            {MOCK_COURSES.map((item) => {
              const active = item.id === courseId;
              const complete = submitted[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCourseId(item.id);
                    setAnswers({});
                    setComment('');
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${
                    active ? 'bg-teal-50 text-teal-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`h-6 w-1 shrink-0 rounded-full ${active ? 'bg-teal-600' : 'bg-slate-200'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-bold">{item.title}</span>
                    <span className="block text-[8px] font-semibold text-slate-500">{item.code} · {item.faculty}</span>
                  </span>
                  {complete ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" /> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex items-start gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-[8px] font-semibold leading-relaxed text-slate-500">
              Responses are anonymised and released only as aggregates of five or more students.
            </p>
          </div>
        </SectionCard>

        <div className="xl:col-span-3">
          {done ? (
            <SectionCard title={course.title} description="Feedback already submitted" icon={BadgeCheck} tone="emerald" bodyClassName="p-6">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={26} />
                </span>
                <p className="mt-3 text-lg font-extrabold text-deepNavy font-jost">Thank you for your feedback</p>
                <p className="mt-1 max-w-md text-[11px] leading-relaxed text-slate-500">
                  Your response for <span className="font-bold text-slate-700">{course.title}</span> has been recorded
                  anonymously. You can submit feedback for the other five courses from the list.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge tone="emerald">Anonymous</Badge>
                  <Badge tone="slate">Received 26 Oct 2026</Badge>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSubmitted((prev) => ({ ...prev, [courseId]: false }))}
                >
                  Edit response
                </Button>
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              title={course.title}
              description={`${course.code} · ${course.faculty}`}
              icon={MessageSquare}
              tone="teal"
              action={
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Completion</p>
                  <p className="text-[11px] font-extrabold text-teal-700 tabular">{answered}/{MOCK_FEEDBACK_QUESTIONS.length}</p>
                </div>
              }
              bodyClassName="p-3.5"
            >
              <Progress value={progress} tone="teal" className="mb-3" thickness="h-1" />

              <div className="space-y-2.5">
                {MOCK_FEEDBACK_QUESTIONS.map((question, index) => (
                  <div key={question.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-start gap-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-teal-50 text-[8.5px] font-extrabold text-teal-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge tone="teal">{question.category}</Badge>
                        </div>
                        <p className="mt-1 text-[10.5px] font-semibold leading-snug text-slate-700">{question.prompt}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {SCALE.map((option) => {
                            const active = answers[question.id] === option.value;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }))}
                                title={option.label}
                                className={`flex h-8 min-w-[34px] flex-1 items-center justify-center rounded-lg border text-[10px] font-extrabold transition-all sm:flex-none sm:px-3 ${
                                  active
                                    ? 'border-teal-600 bg-teal-600 text-white shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-700'
                                }`}
                              >
                                {option.value}
                              </button>
                            );
                          })}
                          <span className="hidden w-full pt-0.5 text-[8px] font-semibold text-slate-500 sm:block">
                            {answers[question.id] ? SCALE.find((option) => option.value === answers[question.id])?.label : 'Select a rating from 1 (strongly disagree) to 5 (strongly agree)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="text-[8.5px] font-bold uppercase tracking-wide text-slate-500">Anything else? (optional)</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={3}
                  placeholder="What worked well? What should change next semester?"
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-[10.5px] text-deepNavy placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                  <Sparkles size={12} className="text-teal-500" />
                  {answered ? `Average rating ${average} / 5` : 'Rate every statement to unlock submission'}
                </div>
                <Button size="sm" icon={Send} loading={sending} onClick={submit} disabled={answered < MOCK_FEEDBACK_QUESTIONS.length}>
                  Submit anonymously
                </Button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSemFeedbackTab;
