import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarCheck, CheckCircle2, Clock, DoorOpen, ListChecks, Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/portal/PortalKit';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { api } from '@/utils/config';
import { MOCK_FACULTY_TIMETABLE, MOCK_FACULTY_COURSES } from '@/pages/faculty/constants/facultyConstants';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const INITIAL_SYLLABUS = [
  { week: 1, unit: 'Unit 1', topic: 'Introduction to Operating Systems, Kernel Architectures & System Calls', hours: 3, mode: 'Interactive Lecture', status: 'Delivered', date: '2026-08-04', notes: 'Covered monolithic vs microkernel architectures and POSIX fork/exec calls.' },
  { week: 2, unit: 'Unit 1', topic: 'Process Concept, PCB, State Transitions & Process Scheduling Queues', hours: 3, mode: 'Chalk & Talk', status: 'Delivered', date: '2026-08-11', notes: 'Diagrammed context switching overheads and task struct in Linux kernel.' },
  { week: 3, unit: 'Unit 2', topic: 'CPU Scheduling Algorithms: FCFS, SJF, Priority & Multi-level Feedback Queues', hours: 4, mode: 'Interactive Slides', status: 'Delivered', date: '2026-08-18', notes: 'Gantt chart numericals solved. Average turnaround time analysis.' },
  { week: 4, unit: 'Unit 2', topic: 'Process Synchronization: Critical Section Problem, Peterson’s Algorithm & Semaphores', hours: 4, mode: 'Live Demo', status: 'Delivered', date: '2026-08-25', notes: 'Demonstrated race conditions with pthread mutex locks.' },
  { week: 5, unit: 'Unit 2', topic: 'Classic Synchronization Problems: Producer-Consumer, Dining Philosophers & Readers-Writers', hours: 3, mode: 'Live Demo', status: 'Delivered', date: '2026-09-01', notes: 'Implemented bounded buffer with counting semaphores.' },
  { week: 6, unit: 'Unit 3', topic: 'Deadlocks: Characterization, Prevention, Avoidance (Banker’s Algorithm) & Detection', hours: 4, mode: 'Interactive Lecture', status: 'Delivered', date: '2026-09-08', notes: 'Resource allocation graphs and safety state validation.' },
  { week: 7, unit: 'Unit 3', topic: 'Memory Management: Logical vs Physical Address, Swapping, Contiguous Allocation', hours: 3, mode: 'Chalk & Talk', status: 'Delivered', date: '2026-09-15', notes: 'First-fit, best-fit, and fragmentation tradeoffs.' },
  { week: 8, unit: 'Unit 3', topic: 'Paging & Segmentation: Hardware Support, TLB Hit Ratios & Inverted Page Tables', hours: 4, mode: 'Interactive Lecture', status: 'Delivered', date: '2026-09-22', notes: 'Multi-level page tables calculation and effective memory access time.' },
  { week: 9, unit: 'Unit 4', topic: 'Virtual Memory: Demand Paging, Page Fault Handling & Page Replacement Policies', hours: 4, mode: 'Live Demo', status: 'In Progress', date: '2026-09-29', notes: 'FIFO, LRU, Optimal algorithms. Belady’s anomaly demonstration.' },
  { week: 10, unit: 'Unit 4', topic: 'Thrashing, Working-Set Model & Page Fault Frequency Mechanism', hours: 3, mode: 'Interactive Slides', status: 'Planned', date: '2026-10-06', notes: 'Working-set window size tuning.' },
  { week: 11, unit: 'Unit 5', topic: 'File System Interface & Implementation: Directories, Allocation Methods & Free Space', hours: 4, mode: 'Interactive Slides', status: 'Planned', date: '2026-10-13', notes: 'Contiguous, linked and indexed allocation with inode structure.' },
  { week: 12, unit: 'Unit 5', topic: 'Mass-Storage Structure: Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN) & RAID Levels', hours: 4, mode: 'Interactive Lecture', status: 'Planned', date: '2026-10-20', notes: 'RAID 0, 1, 5, 6, 10 parity and redundancy comparison.' },
  { week: 13, unit: 'Unit 5', topic: 'I/O Systems & Kernel Subsystems: Polling, Interrupts, DMA & Device Drivers', hours: 3, mode: 'Chalk & Talk', status: 'Planned', date: '2026-10-27', notes: 'Hardware controller handshakes and buffer caches.' },
  { week: 14, unit: 'Revision', topic: 'Comprehensive Syllabus Revision, Gate/University Question Solving & Doubt Clearing', hours: 4, mode: 'Interactive Lecture', status: 'Planned', date: '2026-11-03', notes: 'Mock question papers and past 5-year exam paper analysis.' }
];

const FacultyTimetableTab = ({ triggerPopup = () => {} }) => {
  const [viewMode, setViewMode] = useState('timetable'); // 'timetable' | 'tracker'
  const [day, setDay] = useState('Monday');
  const [selectedCourse, setSelectedCourse] = useState(MOCK_FACULTY_COURSES[0]?.code || 'CS502');
  const [syllabus, setSyllabus] = useState(INITIAL_SYLLABUS);
  const [editingLesson, setEditingLesson] = useState(null);
  const [logForm, setLogForm] = useState({
    status: 'Delivered',
    date: new Date().toISOString().split('T')[0],
    hours: 3,
    mode: 'Interactive Lecture',
    notes: ''
  });

  const slots = MOCK_FACULTY_TIMETABLE[day] || [];

  // Fetch backend lessons on mount
  useEffect(() => {
    let active = true;
    const fetchLessons = async () => {
      try {
        const response = await api.get('/academic/lessons');
        if (active && response.data?.lessons?.length) {
          setSyllabus((current) => {
            const copy = [...current];
            response.data.lessons.forEach((item) => {
              const idx = copy.findIndex((entry) => entry.week === item.week || entry.topic === item.topic);
              if (idx >= 0) {
                copy[idx] = { ...copy[idx], ...item };
              } else if (item.topic) {
                copy.push(item);
              }
            });
            return copy;
          });
        }
      } catch (err) {
        console.warn('Backend lessons unavailable, using local syllabus store:', err.message);
      }
    };
    fetchLessons();
    return () => { active = false; };
  }, []);

  const deliveredCount = useMemo(() => syllabus.filter((s) => s.status === 'Delivered').length, [syllabus]);
  const completionPercent = Math.round((deliveredCount / syllabus.length) * 100);
  const totalHoursLogged = useMemo(() => syllabus.reduce((acc, s) => acc + (s.status === 'Delivered' ? Number(s.hours || 0) : 0), 0), [syllabus]);

  const handleOpenLogModal = (lesson) => {
    setEditingLesson(lesson);
    setLogForm({
      status: lesson.status || 'Delivered',
      date: lesson.date || new Date().toISOString().split('T')[0],
      hours: lesson.hours || 3,
      mode: lesson.mode || 'Interactive Lecture',
      notes: lesson.notes || ''
    });
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;

    const updatedLesson = {
      ...editingLesson,
      ...logForm,
      subject: selectedCourse,
      week: editingLesson.week,
      topic: editingLesson.topic
    };

    // Optimistically update
    setSyllabus((current) =>
      current.map((item) => (item.week === editingLesson.week ? updatedLesson : item))
    );

    // Call backend API
    try {
      await api.post('/academic/lessons', {
        subject: selectedCourse,
        week: editingLesson.week,
        topic: editingLesson.topic,
        hours: logForm.hours,
        status: logForm.status,
        mode: logForm.mode,
        notes: logForm.notes,
        date: logForm.date
      });
      triggerPopup(`Week ${editingLesson.week} (${editingLesson.topic.slice(0, 30)}...) logged successfully!`, 'success');
    } catch (err) {
      triggerPopup(`Logged locally for Week ${editingLesson.week}`, 'info');
    }

    setEditingLesson(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Teaching"
        title={viewMode === 'timetable' ? 'My timetable' : 'Lesson tracker & delivery log'}
        description={
          viewMode === 'timetable'
            ? 'Weekly class schedule and room allocations managed by campus administration.'
            : 'Track syllabus progress, weekly lecture delivery hours, and pedagogical coverage.'
        }
        icon={viewMode === 'timetable' ? CalendarCheck : ListChecks}
        tone="indigo"
        actions={
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('timetable')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                viewMode === 'timetable' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-deepNavy'
              }`}
            >
              <CalendarCheck size={13} /> Weekly timetable
            </button>
            <button
              onClick={() => setViewMode('tracker')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                viewMode === 'tracker' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-deepNavy'
              }`}
            >
              <ListChecks size={13} /> Lesson tracker
            </button>
          </div>
        }
      />

      {viewMode === 'timetable' ? (
        <>
          <div className="flex flex-wrap gap-1">
            {DAYS.map((item) => (
              <button
                key={item}
                onClick={() => setDay(item)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-colors ${
                  day === item ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <SectionCard title={day} description={`${slots.length} classes scheduled`} icon={CalendarCheck} tone="indigo">
            {slots.length ? (
              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div key={`${slot.code}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-3.5 py-3">
                    <div className="w-28 shrink-0 text-[10px] font-bold text-indigo-700 tabular">{slot.time}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-extrabold text-deepNavy">{slot.subject}</p>
                      <p className="text-[9px] font-semibold text-slate-500">{slot.code} · {slot.class}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">
                      <DoorOpen size={10} /> {slot.room}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-[11px] font-semibold text-slate-500">No classes on {day}. Enjoy the break.</p>
              </div>
            )}
          </SectionCard>
        </>
      ) : (
        /* LESSON TRACKER VIEW */
        <div className="space-y-4">
          {/* Course Selector & Key Metrics */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {MOCK_FACULTY_COURSES.map((course) => (
                <button
                  key={course.code}
                  onClick={() => setSelectedCourse(course.code)}
                  className={`rounded-xl px-3 py-1.5 text-[10.5px] font-bold transition-all ${
                    selectedCourse === course.code
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  {course.code} · {course.subject}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <strong className="text-deepNavy">{deliveredCount}</strong> / {syllabus.length} Delivered
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} className="text-indigo-600" />
                <strong className="text-deepNavy">{totalHoursLogged}</strong> hrs covered
              </span>
            </div>
          </div>

          {/* Progress Bar Banner */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-deepNavy">Syllabus Coverage · {selectedCourse}</p>
                <p className="text-[10px] font-semibold text-slate-500">Target completion prior to End-Semester COE examinations</p>
              </div>
              <span className="text-sm font-extrabold text-indigo-700 font-jost">{completionPercent}% Complete</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Syllabus & Delivery Table */}
          <SectionCard
            title={`Weekly delivery log · ${selectedCourse}`}
            description="Week-wise delivery status, pedagogy mode, and reflection notes"
            icon={BookOpen}
            tone="indigo"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2.5">Week</th>
                    <th className="px-3 py-2.5">Unit</th>
                    <th className="px-3 py-2.5">Topic planned</th>
                    <th className="px-3 py-2.5">Pedagogy mode</th>
                    <th className="px-3 py-2.5">Hours</th>
                    <th className="px-3 py-2.5">Delivered date</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syllabus.map((lesson) => (
                    <tr key={lesson.week} className="hover:bg-slate-50/40">
                      <td className="px-3 py-3 font-extrabold text-deepNavy tabular">W-{lesson.week}</td>
                      <td className="px-3 py-3 font-semibold text-slate-500">{lesson.unit}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-deepNavy">{lesson.topic}</p>
                        {lesson.notes && (
                          <p className="mt-0.5 max-w-md text-[9.5px] font-medium text-slate-500 line-clamp-1 italic">
                            “{lesson.notes}”
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                          {lesson.mode}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold tabular text-deepNavy">{lesson.hours} hrs</td>
                      <td className="px-3 py-3 font-medium text-slate-500 tabular">{lesson.date || '—'}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={lesson.status.toLowerCase()} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleOpenLogModal(lesson)}
                          className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-2.5 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100"
                        >
                          Log delivery
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Log Delivery Modal */}
      <Modal
        open={Boolean(editingLesson)}
        onClose={() => setEditingLesson(null)}
        title={`Log delivery · Week ${editingLesson?.week}`}
        description={`${selectedCourse} · ${editingLesson?.topic}`}
        tone="indigo"
      >
        {editingLesson && (
          <form onSubmit={handleSaveLesson} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</label>
                <select
                  value={logForm.status}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-deepNavy focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Delivered">Delivered</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Delivery date</label>
                <input
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-deepNavy focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Lecture hours</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={logForm.hours}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, hours: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-deepNavy focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Pedagogy mode</label>
                <select
                  value={logForm.mode}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, mode: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-deepNavy focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Interactive Lecture">Interactive Lecture</option>
                  <option value="Chalk & Talk">Chalk & Talk</option>
                  <option value="Interactive Slides">Interactive Slides</option>
                  <option value="Live Demo">Live Demo</option>
                  <option value="Lab Exercise">Lab Exercise</option>
                  <option value="Flipped Classroom">Flipped Classroom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Coverage notes & reflection</label>
              <textarea
                rows={3}
                value={logForm.notes}
                onChange={(e) => setLogForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Key concepts covered, questions raised by students, or follow-up items..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-indigo-700 shadow-xs"
              >
                <CheckCircle2 size={13} /> Save delivery record
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FacultyTimetableTab;

