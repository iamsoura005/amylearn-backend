import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, BookOpen, BrainCircuit, FileText, Layers, Loader2, Sparkles, WifiOff, X } from 'lucide-react';
import { api } from '@/utils/config';
import { AI } from '@/utils/apiEndpoints';
import { generateMockAiResponse, MOCK_FILE_SUMMARY, STARTER_PROMPTS } from '@/services/mockAiService';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { FileDropzone } from '@/components/common/FileDropzone';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';

const MODES = [
  { id: 'study', label: 'Study', icon: BookOpen, hint: 'Clear explanations' },
  { id: 'tutor', label: 'Socratic tutor', icon: BrainCircuit, hint: 'Guides, never spoils' },
  { id: 'mindmap', label: 'Mind map', icon: Layers, hint: 'Mermaid diagram' }
];

const TASKS = [
  { id: 'summarize', label: 'Summarise' },
  { id: 'solve', label: 'Solve' },
  { id: 'exam_quiz', label: 'Practice quiz' },
  { id: 'mindmap', label: 'Mind map' }
];

export const AiSurface = ({
  userName = 'there',
  classroomName = 'Computer Science & Engineering',
  initialMode = 'study',
  compact = false,
  onClose,
  className = '',
  showFile = true
}) => {
  const toast = useToast();
  const [mode, setMode] = useState(initialMode);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userName.split(' ')[0]} — I'm your AmyLearn study companion.

Ask me to explain a concept, quiz you, or build a mind map. You can also upload a PDF or slide deck and I'll turn it into a study brief.`
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(false);
  const [fileTask, setFileTask] = useState('summarize');
  const [files, setFiles] = useState([]);
  const [summarizing, setSummarizing] = useState(false);
  const scrollRef = useRef(null);
  const counter = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, summarizing]);

  const push = (message) => setMessages((prev) => [...prev, { id: `m-${++counter.current}`, ...message }]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    push({ role: 'user', content: message });
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post(AI.CHAT, { message, context: { userName, classroomName }, mode });
      const reply = data?.reply || data?.data?.reply;
      if (!reply) throw new Error('Empty AI response');
      push({ role: 'assistant', content: reply });
    } catch {
      const fallback = generateMockAiResponse(message, mode, userName);
      push({ role: 'assistant', content: fallback.reply, offline: true });
      setOffline(true);
    } finally {
      setSending(false);
    }
  };

  const summarize = async () => {
    if (!files.length || summarizing) return;
    const file = files[0];
    push({ role: 'user', content: `Please ${TASKS.find((t) => t.id === fileTask)?.label.toLowerCase() || 'summarise'} **${file.name}**.` });
    setSummarizing(true);
    const form = new FormData();
    form.append('file', file);
    form.append('taskType', fileTask);
    try {
      const { data } = await api.post(AI.SUMMARIZE_FILE, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const summary = data?.summary || data?.data?.summary;
      if (!summary) throw new Error('Empty summary');
      push({ role: 'assistant', content: summary });
    } catch {
      push({ role: 'assistant', content: MOCK_FILE_SUMMARY[fileTask] || MOCK_FILE_SUMMARY.summarize, offline: true });
      setOffline(true);
      toast.info('Showing an offline sample summary. Start the AI service for live analysis.');
    } finally {
      setSummarizing(false);
      setFiles([]);
    }
  };

  return (
    <div className={`flex flex-col overflow-hidden rounded-3xl border border-ai-200/70 bg-white shadow-bento ${compact ? 'h-full' : 'h-[640px]'} ${className}`}>
      <div className="ai-mesh relative border-b border-ai-100 px-4 py-3.5">
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-ai-500 to-ai-300 text-white shadow-ai-glow">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-sm font-extrabold text-deepNavy font-jost">AmyLearn AI studio</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ai-600">
                {mode === 'tutor' ? 'Socratic tutor' : mode === 'mindmap' ? 'Mind map builder' : 'Study companion'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {offline ? (
              <Badge tone="amber" className="hidden sm:inline-flex">
                <WifiOff size={9} /> Offline demo
              </Badge>
            ) : (
              <Badge tone="ai" dot>
                Live
              </Badge>
            )}
            {onClose ? (
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white/70 hover:text-deepNavy"
                aria-label="Close AI studio"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {MODES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                title={item.hint}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                  mode === item.id
                    ? 'border-ai-300 bg-white text-ai-700 shadow-2xs'
                    : 'border-transparent bg-white/40 text-slate-500 hover:bg-white/70'
                }`}
              >
                <Icon size={11} /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#FCFBFF] px-3.5 py-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' ? (
              <div className="max-w-[92%]">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-ai-100 text-ai-600">
                    <Sparkles size={10} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">AmyLearn AI</span>
                  {message.offline ? <span className="text-[8px] font-semibold text-amber-700">offline sample</span> : null}
                </div>
                <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 shadow-2xs">
                  <MarkdownBlock content={message.content} />
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ai-600 px-3.5 py-2.5 text-[12px] font-medium leading-relaxed text-white shadow-2xs">
                {message.content}
              </div>
            )}
          </motion.div>
        ))}

        {sending || summarizing ? (
          <div className="flex items-center gap-2 rounded-xl border border-ai-100 bg-white px-3 py-2 text-[10px] font-semibold text-ai-600">
            <Loader2 size={13} className="animate-spin" />
            {summarizing ? 'Reading your file and building a brief…' : 'Thinking through the best explanation…'}
          </div>
        ) : null}

        {messages.length <= 1 ? (
          <div className="grid gap-1.5 pt-1 sm:grid-cols-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                className="rounded-xl border border-ai-100 bg-white px-2.5 py-2 text-left text-[10px] font-semibold leading-snug text-slate-600 transition-colors hover:border-ai-300 hover:text-ai-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-100 bg-white px-3.5 py-3">
        {showFile ? (
          <details className="group mb-2 rounded-xl border border-slate-100 bg-slate-50/70">
            <summary className="flex cursor-pointer list-none items-center justify-between px-2.5 py-2 text-[10px] font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <FileText size={12} className="text-ai-600" /> Summarise a file
              </span>
              <span className="text-[9px] font-semibold text-slate-500 group-open:hidden">PDF · DOCX · slides · image</span>
              <span className="hidden text-[9px] font-semibold text-slate-500 group-open:inline">close</span>
            </summary>
            <div className="space-y-2 px-2.5 pb-2.5">
              <div className="flex flex-wrap gap-1">
                {TASKS.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setFileTask(task.id)}
                    className={`rounded-md border px-2 py-1 text-[9px] font-bold ${
                      fileTask === task.id
                        ? 'border-ai-300 bg-white text-ai-700'
                        : 'border-transparent bg-white/60 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {task.label}
                  </button>
                ))}
              </div>
              <FileDropzone
                onFiles={setFiles}
                multiple={false}
                maxSizeMb={20}
                tone="violet"
                label="Drop a lecture file"
                hint="Digital PDF/DOCX · scanned pages · spreadsheets · images"
              />
              <button
                onClick={summarize}
                disabled={!files.length || summarizing}
                className="w-full rounded-lg bg-ai-600 py-2 text-[10px] font-bold text-white disabled:opacity-40"
              >
                {summarizing ? 'Analysing…' : 'Analyse file'}
              </button>
            </div>
          </details>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={mode === 'tutor' ? 'Ask for a hint, not the answer…' : 'Ask a question about your syllabus…'}
            className="max-h-24 min-h-[38px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-ai-300 focus:outline-none focus:ring-2 focus:ring-ai-100"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-ai-600 text-white transition-colors hover:bg-ai-700 disabled:opacity-40"
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[8px] font-medium text-slate-500">
          AI can make mistakes. Verify formulas and exam rules with your faculty or handbook.
        </p>
      </div>
    </div>
  );
};

export default AiSurface;
