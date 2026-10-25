import {
  BookOpen,
  BrainCircuit,
  CalendarClock,
  FileText,
  Layers,
  Lightbulb,
  Sparkles,
  Target,
  Wand2
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { AiSurface } from '@/components/ai/AiSurface';
import { SectionCard, RowItem } from './shared/StudentTabKit';

const CAPABILITIES = [
  { icon: BrainCircuit, title: 'Socratic tutor', text: 'Guides you to the answer with questions instead of handing it over.' },
  { icon: Layers, title: 'Mind maps', text: 'Turns a unit into a Mermaid diagram you can revise from.' },
  { icon: FileText, title: 'File summaries', text: 'Reads PDFs, slides, spreadsheets and scanned pages into a study brief.' }
];

export const StudentAiStudyTab = ({ session }) => (
  <div className="space-y-4">
    <PageHeader
      eyebrow="AI study studio"
      title="Learn with Amy"
      description="A tutor, mind-map builder and file summariser tuned to your Semester 5 syllabus. Ask anything, or drop in a lecture file."
      icon={Sparkles}
      tone="violet"
      actions={
        <div className="flex items-center gap-1.5">
          <Badge tone="ai" dot>AI</Badge>
          <Badge tone="slate">Socratic · mind maps · summaries</Badge>
        </div>
      }
    />

    <div className="grid gap-3 xl:grid-cols-3">
      <div className="h-[620px] xl:col-span-2 xl:h-[680px]">
        <AiSurface
          compact
          userName={session?.name || 'Aarav Sharma'}
          classroomName={session?.department || 'Computer Science & Engineering'}
          className="h-full"
        />
      </div>

      <div className="space-y-3">
        <SectionCard title="What Amy can do" description="Three modes, one study surface" icon={Sparkles} tone="violet" bodyClassName="p-3">
          <div className="space-y-2">
            {CAPABILITIES.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.title} className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ai-50 text-ai-600">
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-bold text-deepNavy">{capability.title}</p>
                    <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">{capability.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Your exam countdown" description="Odd semester examinations" icon={CalendarClock} tone="amber" bodyClassName="p-3.5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold leading-none text-deepNavy font-jost tabular">14</p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-500">days until 9 November</p>
            </div>
            <Badge tone="amber">6 papers</Badge>
          </div>
          <div className="mt-2.5 space-y-1">
            <RowItem>
              <span className="text-[9.5px] font-semibold text-slate-500">Weakest unit</span>
              <span className="text-[9.5px] font-bold text-deepNavy">TCP congestion</span>
            </RowItem>
            <RowItem>
              <span className="text-[9.5px] font-semibold text-slate-500">Pending assignments</span>
              <span className="text-[9.5px] font-bold text-deepNavy">3</span>
            </RowItem>
            <RowItem>
              <span className="text-[9.5px] font-semibold text-slate-500">Backlog paper</span>
              <span className="text-[9.5px] font-bold text-deepNavy">CS301 · DS</span>
            </RowItem>
          </div>
        </SectionCard>

        <SectionCard title="Try these prompts" description="Copy into the studio" icon={Lightbulb} tone="indigo" bodyClassName="p-2.5">
          <div className="space-y-1">
            {[
              'Explain query optimisation with a simple example',
              'Quiz me on deadlock avoidance',
              'Make a mind map for TCP congestion control',
              'Turn my DBMS notes into 20 flashcards'
            ].map((prompt) => (
              <div key={prompt} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-indigo-50/50">
                <Wand2 size={11} className="mt-0.5 shrink-0 text-indigo-400" />
                <p className="text-[9.5px] font-semibold leading-relaxed text-slate-600">{prompt}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Study ritual" description="A repeatable 40-minute loop" icon={Target} tone="emerald" bodyClassName="p-3">
          <div className="space-y-1.5">
            {[
              { time: '10 min', label: 'Recall yesterday’s unit from memory' },
              { time: '20 min', label: 'Study one new sub-topic with Amy' },
              { time: '10 min', label: 'Self-quiz and log weak spots' }
            ].map((step) => (
              <div key={step.time} className="flex items-center gap-2">
                <span className="w-11 shrink-0 rounded-md bg-emerald-50 py-1 text-center text-[8px] font-extrabold text-emerald-700">{step.time}</span>
                <span className="text-[9.5px] font-semibold text-slate-600">{step.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
            <BookOpen size={11} className="text-slate-400" />
            <p className="text-[8.5px] font-semibold text-slate-500">Amy remembers the mode you pick, not your personal data.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  </div>
);

export default StudentAiStudyTab;
