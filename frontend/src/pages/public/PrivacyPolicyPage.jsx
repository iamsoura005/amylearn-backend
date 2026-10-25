import { Link } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import PublicPageShell from '@/pages/public/PublicPageShell';

const P = ({ children }) => <p className="text-[12px] leading-7 text-slate-600">{children}</p>;
const UL = ({ children }) => <ul className="space-y-1.5 pl-4 text-[11.5px] leading-6 text-slate-600 marker:text-slate-300">{children}</ul>;
const LI = ({ children }) => <li className="pl-1">{children}</li>;
const Strong = ({ children }) => <strong className="font-bold text-deepNavy">{children}</strong>;

const PROCESSORS = [
  {
    provider: 'Cloudinary',
    purpose: 'Media storage, streaming and upload processing',
    data: 'Lecture video, documents, images and OCR uploads'
  },
  {
    provider: 'Gmail SMTP (Google)',
    purpose: 'Transactional email delivery',
    data: 'Email address, one-time codes, library alerts and support replies'
  },
  {
    provider: 'CockroachDB',
    purpose: 'Managed database persistence',
    data: 'Account, tenant, academic and examination records'
  },
  {
    provider: 'Vercel',
    purpose: 'Web client hosting and delivery',
    data: 'Request metadata and technical logs needed to serve the site'
  }
];

const SECTIONS = [
  {
    id: 'scope',
    title: '1. Scope and who we are',
    body: (
      <>
        <P>
          This Privacy Policy explains how AmyLearn processes personal data when an institution uses the platform, when
          someone visits the public website, and when a person contacts support. It covers the campus portals, the AI
          study features, the public marketing pages and related email.
        </P>
        <P>
          AmyLearn is a multi-tenant academic platform for higher-education institutions. In this policy, “AmyLearn”,
          “we”, “us” and “our” refer to the operator of the platform. “Institution” means the college, university or
          group that licenses the platform. “You” means a visitor, student, faculty member, administrator or other
          authorised user.
        </P>
        <P>
          This document describes our practices for platform transparency. It is not legal advice, and it does not
          replace the data-processing agreement signed by an institution. This policy is provided for platform
          transparency.
        </P>
      </>
    )
  },
  {
    id: 'roles',
    title: '2. Our role: controller or processor',
    body: (
      <>
        <P>
          For account, academic and examination records processed inside a campus, the institution is normally the data
          controller (or equivalent decision-maker) and AmyLearn acts as a processor on the institution’s instructions.
          The institution decides what is collected, who can see it and how long academic records are kept.
        </P>
        <P>
          For our public website, support correspondence, security logs and the operation of our own commercial
          relationship, AmyLearn acts as a controller. Where we act as a processor, we process personal data only to
          provide the service, secure it, follow the institution’s documented instructions and meet legal obligations.
        </P>
        <P>
          If you are a student or staff member, the fastest route for an access or correction request is usually your
          institution’s academic office. We will assist the institution in responding.
        </P>
      </>
    )
  },
  {
    id: 'data-we-collect',
    title: '3. Personal data we collect',
    body: (
      <>
        <P>Depending on the modules enabled by a campus, we may process the following categories:</P>
        <UL>
          <LI>
            <Strong>Account and identity:</Strong> name, institutional identifier or roll number, email address,
            role, campus code, account status and authentication events.
          </LI>
          <LI>
            <Strong>Academic records:</Strong> department, stream, subject, batch, semester or trimester enrolment,
            attendance, internal marks, examination eligibility, results and semester feedback.
          </LI>
          <LI>
            <Strong>Examination and fee records:</Strong> regular or backlog form submissions, fee-ledger entries,
            payment status, admit-card issue and result publication events.
          </LI>
          <LI>
            <Strong>Learning content:</Strong> uploaded notes, lecture video, assignment material, completion records,
            library loans, fines and digital-vault approvals.
          </LI>
          <LI>
            <Strong>AI inputs and outputs:</Strong> prompts, uploaded files, images and lecture recordings submitted to an
            AI feature, plus the generated explanation, summary, mind map or revision brief.
          </LI>
          <LI>
            <Strong>Technical data:</Strong> IP-derived request metadata, browser type, device information, timestamps,
            error logs and security events needed to operate and protect the service.
          </LI>
          <LI>
            <Strong>Communications:</Strong> support emails, procurement correspondence and messages sent through a
            campus contact form (where the form is configured to transmit).
          </LI>
        </UL>
        <P>
          We do not ask for payment card details on the public website. Fee records inside a campus reflect the status
          recorded by the institution; they are not a separate payment gateway unless the institution configures one.
        </P>
      </>
    )
  },
  {
    id: 'how-we-use',
    title: '4. How we use personal data',
    body: (
      <>
        <P>We use personal data to provide, secure and support the platform, including to:</P>
        <UL>
          <LI>Authenticate users, resolve the correct campus and enforce role-based access.</LI>
          <LI>Operate attendance, timetable, examinations, fee ledgers, learning modules and library circulation.</LI>
          <LI>Generate AI responses when a user chooses to use an AI feature.</LI>
          <LI>Send transactional email such as one-time codes, library reminders and support replies.</LI>
          <LI>Detect misuse, investigate security incidents and maintain audit records.</LI>
          <LI>Provide support, troubleshoot errors and communicate material service changes.</LI>
          <LI>Produce aggregated, de-identified service metrics that do not identify a person or campus.</LI>
        </UL>
        <P>
          We do not sell personal data, use it for advertising, or disclose it to a third party for that party’s own
          marketing. We do not use Institution Data to train foundation models without written instruction.
        </P>
      </>
    )
  },
  {
    id: 'legal-bases',
    title: '5. Legal bases for processing',
    body: (
      <>
        <P>
          Where the institution acts as controller, it is responsible for identifying its legal basis. Where AmyLearn
          acts as controller, we rely on one or more of the following, as applicable:
        </P>
        <UL>
          <LI><Strong>Contract:</Strong> processing needed to provide the platform and support the institution’s account.</LI>
          <LI><Strong>Legitimate interests:</Strong> securing the service, preventing abuse, maintaining audit logs and improving reliability, balanced against individual rights.</LI>
          <LI><Strong>Consent:</Strong> where required for a specific optional feature, such as certain AI processing or marketing communication.</LI>
          <LI><Strong>Legal obligation:</Strong> retaining records, responding to lawful requests and meeting applicable law.</LI>
        </UL>
        <P>
          An institution that uploads student data is responsible for obtaining any consent or authorisation required by
          applicable law, including the Digital Personal Data Protection Act, 2023 where it applies.
        </P>
      </>
    )
  },
  {
    id: 'institution-data',
    title: '6. Institution data and student records',
    body: (
      <>
        <P>
          Institution Data remains the property of the institution. AmyLearn processes it to operate the campus and does
          not independently decide academic outcomes. Attendance, eligibility, marks and results are entered, reviewed
          or published by authorised campus users.
        </P>
        <P>
          Retention of academic records is primarily determined by the institution. While a campus is active, we retain
          the records needed to provide the service. After termination, the institution may request a structured extract
          within 30 days, after which tenant data is deleted within 90 days, subject to legal holds, security
          investigations and backup rotation.
        </P>
        <P>
          Some records — such as audit events showing who published a result or changed a fee entry — may be retained
          longer where necessary for security, dispute resolution or legal compliance. They are access-restricted and
          used only for those purposes.
        </P>
      </>
    )
  },
  {
    id: 'ai-processing',
    title: '7. AI processing',
    body: (
      <>
        <P>
          AI features are optional and can be disabled per campus. When a user submits a prompt, document, image or
          lecture recording, the content is processed to generate the requested explanation, summary, mind map or
          lecture breakdown. Output is returned to the campus workspace and stored according to the institution’s
          configuration.
        </P>
        <P>
          Uploaded files may be parsed or OCR-processed. Lecture recordings may be transcribed or segmented for
          breakdown. We limit processing to what is needed to deliver the response and to maintain the service. We do not
          use Institution Data to train foundation models without written instruction from the institution.
        </P>
        <P>
          AI output can be inaccurate or incomplete and should be verified against faculty material. Users should not
          submit sensitive personal data, examination answer keys or another person’s information unless the institution
          has authorised that use. Institutions can restrict AI access through feature flags and role settings.
        </P>
      </>
    )
  },
  {
    id: 'cookies',
    title: '8. Cookies and browser storage',
    body: (
      <>
        <P>
          The platform uses first-party browser storage to keep a session working and remember basic choices. This may
          include an authentication token, the selected campus, the landing-page preference, theme preference and
          short-lived UI state. These values are used to operate the service, not to build an advertising profile.
        </P>
        <P>
          The public pages do not set advertising cookies or third-party marketing trackers. Infrastructure providers may
          process request logs needed to serve and protect the site. You can clear browser storage at any time; doing so
          will usually sign you out or reset your campus selection.
        </P>
      </>
    )
  },
  {
    id: 'sharing',
    title: '9. Sharing and third-party processors',
    body: (
      <>
        <P>
          We share personal data with service providers that help us operate the platform, under contracts that limit
          their use of the data to our instructions. The current processors relevant to institution data are:
        </P>
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">Third-party processors used by AmyLearn</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th scope="col" className="px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Provider</th>
                  <th scope="col" className="px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Purpose</th>
                  <th scope="col" className="px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Data involved</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSORS.map((processor, index) => (
                  <tr key={processor.provider} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="px-3 py-2.5 text-[10px] font-bold text-deepNavy">{processor.provider}</td>
                    <td className="px-3 py-2.5 text-[9px] font-medium leading-4 text-slate-500">{processor.purpose}</td>
                    <td className="px-3 py-2.5 text-[9px] font-medium leading-4 text-slate-500">{processor.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <P>
          We may also disclose data if required by law, to protect the rights and safety of users, or in connection with
          a merger or acquisition subject to appropriate confidentiality. We do not sell personal data. A material
          change to the processor list will be notified to institution administrators where required.
        </P>
      </>
    )
  },
  {
    id: 'retention',
    title: '10. Retention',
    body: (
      <>
        <P>We keep personal data only for as long as needed for the purpose for which it was collected:</P>
        <UL>
          <LI><Strong>Active campus records:</Strong> for the duration of the institution’s agreement and the academic cycles it operates.</LI>
          <LI><Strong>Post-termination retrieval:</Strong> a 30-day window for a structured export, followed by tenant deletion within 90 days, subject to legal holds.</LI>
          <LI><Strong>Backups:</Strong> rotated on a 35-day cycle; deleted backups are not restored into active service except for disaster recovery.</LI>
          <LI><Strong>Security and audit logs:</Strong> up to 12 months, or longer where needed for an active investigation or legal obligation.</LI>
          <LI><Strong>Support correspondence:</Strong> up to 24 months after the last interaction, unless it is needed for a dispute.</LI>
          <LI><Strong>AI outputs:</Strong> retained in the campus workspace until deleted by the user or institution, or until the agreement ends; transient processing copies are removed on the operational schedule.</LI>
        </UL>
        <P>
          Aggregated metrics that cannot identify a person or campus may be retained for service planning. Where a legal
          hold applies, deletion is paused until the hold is lifted.
        </P>
      </>
    )
  },
  {
    id: 'security',
    title: '11. Security',
    body: (
      <>
        <P>
          We use administrative, technical and organisational safeguards appropriate to an academic records platform.
          These include encrypted transport, role-based access, tenant-scoped queries, revocable sessions, restricted
          administrative access, encrypted library credentials, audit logging, backups and incident-response procedures.
        </P>
        <P>
          Campus isolation is enforced at query time: a session resolves to a user, campus membership and role before
          data is read. A college code selects a campus but does not grant access on its own. Platform-wide roles are
          limited to authorised AmyLearn operations staff.
        </P>
        <P>
          No method of transmission or storage is completely secure. If you suspect unauthorised access, contact the
          institution’s administrator and support@amylearn.app immediately. We will investigate and, where required,
          notify affected institutions and authorities. This page does not claim ISO, SOC 2 or any other certification;
          current security documentation is available during procurement.
        </P>
      </>
    )
  },
  {
    id: 'rights',
    title: '12. Your rights and choices',
    body: (
      <>
        <P>
          Depending on applicable law, you may have the right to access, correct, delete, restrict or object to certain
          processing, and to request a portable copy of your data. You may also withdraw consent where processing is based
          on consent.
        </P>
        <P>
          Because the institution controls campus records, please raise academic data requests with your institution
          first. We will assist the institution and verify requests where we act as controller. You can contact us at
          support@amylearn.app with the subject “Privacy request”; we may ask for information needed to verify your
          identity and locate the correct campus.
        </P>
        <P>
          You can clear browser storage to reset your session, and you can ask your institution to restrict AI features or
          correct a record. If you believe your data has been mishandled, you may also complain to the institution or the
          relevant data-protection authority.
        </P>
      </>
    )
  },
  {
    id: 'students',
    title: '13. Students and minors',
    body: (
      <>
        <P>
          AmyLearn accounts are issued through an institution. We do not knowingly collect personal data directly from a
          child outside an institution-provided account or a support request initiated by a parent or guardian.
        </P>
        <P>
          Where a student is under 18, the institution is responsible for obtaining verifiable parental or guardian
          consent if required by applicable law, and for configuring modules appropriately. Institutions should avoid
          uploading sensitive categories of data that are not needed for the academic purpose.
        </P>
      </>
    )
  },
  {
    id: 'transfers',
    title: '14. International transfers and policy changes',
    body: (
      <>
        <P>
          Our service providers may process data in countries other than the institution’s location. Where required, we
          use contractual protections and provider safeguards for cross-border transfers. The institution should review
          the processor list and any transfer terms during procurement.
        </P>
        <P>
          We may update this policy to reflect changes in the service, providers or law. The effective date at the top of
          the page will change, and material updates will be notified to institution administrators. Continued use after
          the effective date means the updated policy applies. If a change materially affects an institution’s rights,
          the institution may contact us before continuing.
        </P>
      </>
    )
  },
  {
    id: 'contact',
    title: '15. Contact',
    body: (
      <>
        <P>
          For privacy questions, data-processing terms or a security questionnaire, contact the AmyLearn team. Include the
          campus name and, if you have one, the college code so we can route the request correctly.
        </P>
        <a
          href="mailto:support@amylearn.app?subject=AmyLearn%20privacy"
          className="mt-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-deepNavy shadow-2xs transition-colors hover:border-brandBlue/30 hover:text-brandBlue"
        >
          <Mail size={13} /> support@amylearn.app
        </a>
      </>
    )
  }
];

export const PrivacyPolicyPage = () => (
  <PublicPageShell
    eyebrow="Legal"
    title="Privacy Policy"
    description="How AmyLearn processes personal data across the public site, campus portals, examinations, library records and AI features. Effective 26 October 2026."
    breadcrumb={[{ label: 'Legal' }, { label: 'Privacy policy' }]}
  >
    <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">On this page</p>
          <nav aria-label="Privacy policy contents" className="mt-2.5">
            <ul className="space-y-1">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-2 py-1.5 text-[10px] font-semibold leading-4 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brandBlue"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[9px] font-semibold text-slate-500">Effective</p>
            <time dateTime="2026-10-26" className="text-[10px] font-bold text-deepNavy">
              26 October 2026
            </time>
            <p className="mt-2 flex items-start gap-1.5 text-[8px] font-medium leading-4 text-slate-500">
              <ShieldCheck size={10} className="mt-0.5 shrink-0 text-learningTeal" />
              Written for platform transparency, not legal advice.
            </p>
          </div>
        </div>
      </aside>

      <article className="min-w-0">
        <div className="rounded-2xl border border-brandBlue/10 bg-brand-50/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brandBlue/15 bg-white px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-brandBlue">
              Privacy Policy
            </span>
            <span className="text-[9px] font-semibold text-slate-500">
              Effective <time dateTime="2026-10-26">26 October 2026</time>
            </span>
          </div>
          <p className="mt-2.5 text-[11px] font-medium leading-6 text-slate-600">
            AmyLearn processes academic records on behalf of institutions and limited data as a controller for the public
            site and support. This policy explains the categories, purposes, processors, retention and choices involved.
          </p>
          <p className="mt-1.5 text-[10px] font-medium leading-5 text-slate-500">
            Read with the{' '}
            <Link to="/terms" className="font-bold text-brandBlue underline underline-offset-2">
              Terms of Service
            </Link>
            . This policy is provided for platform transparency and is not legal advice.
          </p>
        </div>

        <details className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-3 lg:hidden">
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Contents · 15 sections
          </summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="block py-1 text-[10px] font-semibold text-slate-500 hover:text-brandBlue">
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </details>

        <div className="mt-6 space-y-7">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0"
            >
              <h2 className="text-lg font-extrabold tracking-tight text-deepNavy sm:text-xl">{section.title}</h2>
              <div className="mt-3 space-y-3">{section.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-deepNavy">Need the processor and retention pack?</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Ask for the current DPA, subprocessor list and security summary.</p>
          </div>
          <a
            href="mailto:support@amylearn.app?subject=AmyLearn%20privacy%20pack"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-3.5 py-2 text-[10px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Contact support <ArrowRight size={12} />
          </a>
        </div>
      </article>
    </div>
  </PublicPageShell>
);

export default PrivacyPolicyPage;
