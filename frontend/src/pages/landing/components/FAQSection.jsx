import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import FAQItem from '@/pages/landing/components/FAQItem';

const FAQS = [
  {
    question: 'How does migration work if our records live in spreadsheets?',
    answer:
      'Onboarding starts with a structured mapping workshop, not a bulk dump. We agree the department, stream, subject, batch and active-roster structure first, then validate the data before the first login is issued. Historical archives can stay in your existing system until the new records have been checked. We do not promise a one-click import; exceptions are reviewed with your registrar or exam cell.'
  },
  {
    question: 'Is our institution isolated from every other campus?',
    answer:
      'Yes. AmyLearn is a shared deployment with logical tenant isolation. A session resolves to a user, an active campus membership and a role before any query runs, and every campus-scoped query filters by that tenant. A college code selects the campus; it does not grant access on its own. Platform-wide roles are limited to the AmyLearn operations team.'
  },
  {
    question: 'Can we demo the platform without connecting live campus data?',
    answer:
      'Yes. Demos run in a sandbox campus with sample records, so no student or staff data needs to leave your institution. The same approach applies to an offline walkthrough: the product can be shown from a prepared environment without an integration, and nothing is written back to your systems.'
  },
  {
    question: 'How is pricing structured?',
    answer:
      'A campus licence is quoted after a short discovery call. The quote reflects active student count, the modules switched on, implementation support and the contract term. There is no public list price because a 900-student arts college and a 9,000-student multi-campus group are not the same deployment. Onboarding is included in the quoted scope; the ROI model on this page is illustrative and is not a quote.'
  },
  {
    question: 'What training and handover do we get?',
    answer:
      'Rollout includes role-based sessions for campus administrators, faculty coordinators and student representatives, plus a written administrator runbook. We support a pilot department before campus-wide access and stay available through the first examination or fee cycle. Training is scheduled around your academic calendar rather than delivered as a single generic webinar.'
  },
  {
    question: 'Can we use our own name, logo and college code?',
    answer:
      'Yes. The campus portal uses your institution name and logo, and the college code is the entry point students and staff use. Module labels, roles and visible features are configurable per campus. AmyLearn remains the platform brand in the footer and in support communication, so users always know who operates the service.'
  },
  {
    question: 'Which systems can AmyLearn integrate with?',
    answer:
      'AmyLearn does not require an integration to operate; the academic core, examinations, learning, library and AI modules are self-contained. If you already run a student information system, payment gateway or identity provider, raise it during scoping. Some integrations are available through configuration or a services engagement, and some are not available out of the box — we will say which is which before signing.'
  },
  {
    question: 'What happens if the platform is unavailable?',
    answer:
      'AmyLearn targets 99.9% monthly availability, with planned maintenance announced in advance. Incidents are communicated through the support channel and a written post-incident note follows material outages. The target is not a contractual guarantee unless your agreement says so. Because the portals run in the browser, recovery does not require a student or faculty app update.'
  },
  {
    question: 'Does the AI use our students’ content to train models?',
    answer:
      'No. Institution content is not used to train foundation models without written instruction from the institution. AI requests are processed to return the explanation, summary, mind map or lecture breakdown, and outputs stay inside the campus workspace. AI modules can be switched off per campus through feature flags, and the privacy policy explains the processing in more detail.'
  },
  {
    question: 'Who owns the data if we leave?',
    answer:
      'The institution owns its institutional and academic data. On written request at the end of an agreement, we provide a structured extract of the data AmyLearn holds for that campus. After the retrieval window described in the privacy policy, tenant data is deleted subject to legal holds, security logs and backup rotation. Students and staff can also ask their institution to correct records.'
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-container-max gap-9 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:px-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Badge tone="blue" dot>Straight answers</Badge>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-deepNavy sm:text-4xl">
            The questions a campus actually asks.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Migration, isolation, pricing, training and the awkward edge cases. If your question is not here, ask it
            directly — we would rather answer before a contract than after one.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-bgLight p-4">
            <p className="text-xs font-bold text-deepNavy">Still evaluating?</p>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
              Send the campus name, approximate student count and the modules you care about. We will reply with a
              scoped next step, not a generic deck.
            </p>
            <a
              href="mailto:support@amylearn.app?subject=AmyLearn%20campus%20question"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-brandBlue shadow-2xs transition-colors hover:text-brand-700"
            >
              <Mail size={12} /> support@amylearn.app
            </a>
            <Link
              to="/for-institutions"
              className="mt-2 flex items-center gap-1.5 px-1 text-[10px] font-bold text-slate-500 transition-colors hover:text-deepNavy"
            >
              Read the institution brief <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white px-4 shadow-bento sm:px-6">
          {FAQS.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
