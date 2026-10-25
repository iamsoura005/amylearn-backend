import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import PublicPageShell from '@/pages/public/PublicPageShell';

const P = ({ children }) => <p className="text-[12px] leading-7 text-slate-600">{children}</p>;
const UL = ({ children }) => <ul className="space-y-1.5 pl-4 text-[11.5px] leading-6 text-slate-600 marker:text-slate-300">{children}</ul>;
const LI = ({ children }) => <li className="pl-1">{children}</li>;
const Strong = ({ children }) => <strong className="font-bold text-deepNavy">{children}</strong>;

const SECTIONS = [
  {
    id: 'agreement',
    title: '1. Agreement and scope',
    body: (
      <>
        <P>
          These Terms of Service (“Terms”) govern access to AmyLearn, a multi-tenant academic platform for
          higher-education institutions. “AmyLearn”, “we”, “us” and “our” refer to the operator of the platform. An
          institution that subscribes to AmyLearn is the “institution”; its students, faculty and administrators are
          “users”.
        </P>
        <P>
          By signing in, issuing a college code or using any part of the platform, the institution confirms that it is
          authorised to accept these Terms and that its users will be informed of them. If an order form, master service
          agreement or data-processing agreement has been signed, that document prevails where it conflicts with these
          Terms.
        </P>
        <P>
          This document is an operational description of the service terms, not legal advice. This policy is provided for
          platform transparency.
        </P>
      </>
    )
  },
  {
    id: 'accounts',
    title: '2. Accounts and access',
    body: (
      <>
        <P>
          Campus accounts are created under an institution’s college code. Registration and verification use a one-time
          code delivered by email; role assignment is controlled by the institution’s campus administrators or the
          AmyLearn platform team. A college code identifies the campus but does not, by itself, grant access to records.
        </P>
        <UL>
          <LI>
            <Strong>One person, one account.</Strong> Credentials may not be shared, sold or used by more than one
            person. Institutions must deactivate accounts when a student graduates, a staff member leaves or a role
            changes.
          </LI>
          <LI>
            <Strong>Session control.</Strong> Sessions are carried by tokens that can be revoked server-side. We may
            revoke a session immediately if we detect compromise, credential sharing or a security risk.
          </LI>
          <LI>
            <Strong>Demo accounts.</Strong> Demo and sandbox accounts contain fabricated records. They must not be used
            to process real student, staff or examination data.
          </LI>
        </UL>
        <P>
          Users are responsible for keeping their email account and device secure. Suspected unauthorised access should
          be reported to the institution’s administrator and to support@amylearn.app without delay.
        </P>
      </>
    )
  },
  {
    id: 'institution-responsibilities',
    title: '3. Institution responsibilities',
    body: (
      <>
        <P>
          The institution remains responsible for its academic policies, admission decisions, eligibility rules, fee
          schedules, examination conduct and the accuracy of the records it uploads or approves. AmyLearn provides the
          workflow and the record; it does not admit students, grant degrees or decide examination outcomes.
        </P>
        <UL>
          <LI>Ensure it has a lawful basis and any necessary consents to upload student and staff data.</LI>
          <LI>Keep administrator contact details current and maintain an appropriate number of trained administrators.</LI>
          <LI>Tell users how their data is used and how to raise a correction or access request.</LI>
          <LI>Only upload content it owns or is licensed to use, including lecture videos and library resources.</LI>
          <LI>Configure roles, feature flags and module visibility in line with its own policies.</LI>
        </UL>
        <P>
          The institution must not use AmyLearn to make solely automated decisions that produce legal or similarly
          significant effects on a student without human review and a lawful basis.
        </P>
      </>
    )
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable use',
    body: (
      <>
        <P>Access to AmyLearn is conditional on responsible use. The following are prohibited:</P>
        <UL>
          <LI>Attempting to access another campus, tenant, user account or examination record without authorisation.</LI>
          <LI>Probing, scanning, scraping or automating requests in a way that degrades the service or bypasses rate limits.</LI>
          <LI>Uploading malware, unlawful content, or material that infringes another person’s intellectual property or privacy.</LI>
          <LI>Impersonating a student, faculty member, administrator or AmyLearn staff member.</LI>
          <LI>Using the AI features to generate abusive, deceptive or exam-substitution content, or to attempt to extract another user’s data.</LI>
          <LI>Reverse engineering, reselling, sublicensing or copying the platform except as permitted by law or a written agreement.</LI>
          <LI>Interfering with examination integrity, including unauthorised access to question papers, answer keys or unpublished marks.</LI>
        </UL>
        <P>
          We may investigate suspected misuse and suspend access while an investigation is underway. Where the matter
          belongs to the institution, we will refer it to the institution’s designated administrator.
        </P>
      </>
    )
  },
  {
    id: 'academic-records',
    title: '5. Academic records and examination integrity',
    body: (
      <>
        <P>
          The institution is the source of truth for attendance, eligibility, fees, marks and results. AmyLearn applies
          the rules configured by authorised campus users and records who changed what and when. Result publishing is a
          controlled action: marks are not visible to students until an authorised user publishes them.
        </P>
        <P>
          Examination data is sensitive. Access is limited by role and tenant, and bulk operations such as marks upload or
          admit-card issue should be performed only by trained staff. If a student disputes an attendance mark, fee
          entry or result, the institution’s academic grievance process applies; we will provide technical records to
          assist that process.
        </P>
      </>
    )
  },
  {
    id: 'institution-data',
    title: '6. Institution data, ownership and retention',
    body: (
      <>
        <P>
          The institution owns its institutional data, academic records and content (“Institution Data”). The institution
          grants AmyLearn a limited licence to host, process, transmit and display Institution Data solely to provide and
          support the service, meet legal obligations and secure the platform.
        </P>
        <P>
          We do not sell Institution Data or use it for advertising. We may use aggregated, de-identified service metrics
          that cannot reasonably identify a person or campus to operate, benchmark and improve the platform.
        </P>
        <P>
          During an active agreement, data is retained for the operation of the campus. After termination or expiry, the
          institution may request a structured extract within 30 days. Tenant data is then deleted within 90 days,
          except where a legal hold applies, security logs are needed for investigation, or a backup rotation has not
          yet expired. Backups are isolated and deleted on their normal cycle. The privacy policy sets out the retention
          schedule in more detail.
        </P>
      </>
    )
  },
  {
    id: 'ai',
    title: '7. AI processing',
    body: (
      <>
        <P>
          AI features are optional and can be switched off for a campus. They include a Socratic tutor, mind-map
          generation, document and image summarisation, and lecture video breakdown. Prompts, uploaded files and the
          resulting output are processed to return the requested response and are stored in the campus workspace
          according to the institution’s configuration.
        </P>
        <P>
          AI output can be incomplete, outdated or wrong. It is a study aid, not an authoritative academic record or a
          substitute for faculty judgement. Users must verify formulas, citations and answers against course material.
          Institutions must not rely on AI output for eligibility, grading, disciplinary or other high-impact decisions
          without human review.
        </P>
        <P>
          We do not use Institution Data to train foundation models without written instruction from the institution.
          Inference is served through a controlled pipeline; provider and retention details are described in the privacy
          policy. Misuse of AI features is a breach of the acceptable-use section.
        </P>
      </>
    )
  },
  {
    id: 'third-parties',
    title: '8. Third-party services',
    body: (
      <>
        <P>
          AmyLearn uses third-party providers for infrastructure and delivery. The current set relevant to institution
          data is:
        </P>
        <UL>
          <LI><Strong>Cloudinary</Strong> — storage and delivery of lecture video, documents and OCR uploads.</LI>
          <LI><Strong>Gmail SMTP</Strong> — transactional email such as one-time codes, library reminders and support replies.</LI>
          <LI><Strong>CockroachDB</Strong> — the managed database that stores tenant and academic records.</LI>
          <LI><Strong>Vercel</Strong> — hosting and delivery of the web client.</LI>
        </UL>
        <P>
          These providers process data on our instructions and under their own security and availability terms. Their
          services may be delivered from regions where they operate. We will give notice of a material change to the
          processor list where required by the agreement or law. The privacy policy identifies the role of each provider.
        </P>
      </>
    )
  },
  {
    id: 'fees',
    title: '9. Fees, quotes and renewals',
    body: (
      <>
        <P>
          Fees are set out in a written quote or order form and are quoted in Indian rupees unless stated otherwise.
          Quotes are based on active student count, modules, implementation scope and contract term. Amounts are
          exclusive of applicable taxes unless the quote says they are inclusive.
        </P>
        <P>
          Invoices are payable within the period stated on the invoice. We may suspend access for undisputed amounts that
          remain unpaid after written notice. Pilot, implementation and renewal terms are governed by the signed
          agreement. Except where required by law or expressly agreed, fees are non-refundable.
        </P>
      </>
    )
  },
  {
    id: 'availability',
    title: '10. Availability, support and changes',
    body: (
      <>
        <P>
          AmyLearn targets 99.9% monthly availability, excluding planned maintenance and events outside our reasonable
          control. A target is not a guarantee unless the signed agreement contains a service-level commitment with
          remedies. Planned maintenance is announced in advance through the support channel where practicable.
        </P>
        <P>
          Support is available through support@amylearn.app. We may update features, interfaces and these Terms to
          reflect product, security or legal changes. Material changes will be notified to institution administrators;
          continued use after the effective date constitutes acceptance. If a change materially reduces the service, the
          institution may terminate as provided in its agreement.
        </P>
      </>
    )
  },
  {
    id: 'termination',
    title: '11. Suspension and termination',
    body: (
      <>
        <P>
          We may suspend or terminate access if an institution or user materially breaches these Terms, fails to pay
          undisputed fees, creates a security or legal risk, or uses the platform unlawfully. Where the issue can be
          remedied, we will normally give notice and a reasonable opportunity to fix it, unless urgent action is needed
          to protect users or the platform.
        </P>
        <P>
          The institution may terminate in accordance with its agreement. On termination, access ends, users are
          deactivated and the data-retrieval and deletion process in section 6 applies. Provisions that by their nature
          should survive — including intellectual property, confidentiality, liability and governing law — continue to
          apply.
        </P>
      </>
    )
  },
  {
    id: 'intellectual-property',
    title: '12. Intellectual property',
    body: (
      <>
        <P>
          AmyLearn, its software, design system, documentation, marks and underlying technology are owned by us or our
          licensors. These Terms grant a limited, non-exclusive, non-transferable right to use the platform for the
          institution’s internal academic operations during the agreement. No ownership is transferred.
        </P>
        <P>
          Institution Data remains the institution’s property. If an institution sends feedback or suggestions, we may
          use them without restriction or obligation, provided we do not disclose confidential Institution Data. Nothing
          in these Terms grants either party the right to use the other’s name or logo outside agreed references.
        </P>
      </>
    )
  },
  {
    id: 'liability',
    title: '13. Disclaimers and liability',
    body: (
      <>
        <P>
          The platform is provided on an “as available” basis, subject to any uptime commitment in the signed agreement.
          To the extent permitted by law, we disclaim implied warranties of merchantability, fitness for a particular
          purpose and non-infringement. We do not warrant that every AI output, report or user-entered record is
          accurate; the institution remains responsible for verifying academic records.
        </P>
        <P>
          To the extent permitted by law, neither party is liable for indirect, incidental, special or consequential
          loss, or for lost profits or goodwill. Our aggregate liability arising from the service is limited to the fees
          paid or payable for the twelve months preceding the event giving rise to the claim. Nothing excludes liability
          that cannot lawfully be excluded, including fraud or death or personal injury caused by negligence.
        </P>
      </>
    )
  },
  {
    id: 'governing-law',
    title: '14. Governing law and disputes',
    body: (
      <>
        <P>
          These Terms are governed by the laws of India. The parties will first attempt to resolve a dispute through
          good-faith discussion between authorised representatives. If that fails, the courts having jurisdiction over
          AmyLearn’s registered office will have exclusive jurisdiction, unless a signed agreement provides otherwise.
        </P>
        <P>
          Nothing in this section prevents either party from seeking urgent injunctive relief to protect its
          intellectual property, confidential information or the security of the platform.
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
          Questions about these Terms, procurement documents or a data-processing agreement should be sent to the AmyLearn
          team. We aim to respond within two working days.
        </P>
        <a
          href="mailto:support@amylearn.app?subject=AmyLearn%20terms"
          className="mt-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-deepNavy shadow-2xs transition-colors hover:border-brandBlue/30 hover:text-brandBlue"
        >
          <Mail size={13} /> support@amylearn.app
        </a>
      </>
    )
  }
];

export const TermsPage = () => (
  <PublicPageShell
    eyebrow="Legal"
    title="Terms of Service"
    description="The operating terms for institutions and users of the AmyLearn academic platform. Effective 26 October 2026."
    breadcrumb={[{ label: 'Legal' }, { label: 'Terms of service' }]}
  >
    <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">On this page</p>
          <nav aria-label="Terms contents" className="mt-2.5">
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
          </div>
        </div>
      </aside>

      <article className="min-w-0">
        <div className="rounded-2xl border border-brandBlue/10 bg-brand-50/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brandBlue/15 bg-white px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-brandBlue">
              Terms of Service
            </span>
            <span className="text-[9px] font-semibold text-slate-500">
              Effective <time dateTime="2026-10-26">26 October 2026</time>
            </span>
          </div>
          <p className="mt-2.5 text-[11px] font-medium leading-6 text-slate-600">
            These Terms apply to the AmyLearn platform, the campus portals, the public website and the AI study features.
            They should be read with the{' '}
            <Link to="/privacy" className="font-bold text-brandBlue underline underline-offset-2">
              Privacy Policy
            </Link>{' '}
            and any signed order form or data-processing agreement.
          </p>
          <p className="mt-1.5 text-[10px] font-medium leading-5 text-slate-500">
            This page is an operational summary for platform transparency. It is not legal advice and does not replace a
            signed agreement.
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
            <p className="text-xs font-bold text-deepNavy">Need a procurement copy?</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Ask for the current terms, DPA and security pack.</p>
          </div>
          <a
            href="mailto:support@amylearn.app?subject=AmyLearn%20procurement%20pack"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-3.5 py-2 text-[10px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Contact support <ArrowRight size={12} />
          </a>
        </div>
      </article>
    </div>
  </PublicPageShell>
);

export default TermsPage;
