import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';

const EMPTY_FORM = { name: '', email: '', institution: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputBase =
  'w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-deepNavy placeholder:text-slate-400 outline-none transition-colors focus:border-brandBlue/50 focus:bg-white';

export const ContactSection = () => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (form.name.trim().length < 2) nextErrors.name = 'Enter your full name.';
    if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (form.institution.trim().length < 2) nextErrors.institution = 'Enter your institution name.';
    if (form.message.trim().length < 10) nextErrors.message = 'Add at least one sentence (10 characters).';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error('Please check the highlighted fields.');
      return;
    }

    setSubmitted(true);
    toast.success('Thanks — your note is captured in this local demo.');
  };

  const startAnother = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-slate-200/70 bg-bgLight py-16 sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-learningTeal/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-brandBlue/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-container-max gap-9 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-12 lg:px-8">
        <div>
          <Badge tone="teal" dot>Talk to the team</Badge>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-deepNavy sm:text-4xl">
            Bring us the messy version.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The useful conversation is not a feature tour. It is your exam-week handoff, your roster exceptions and the
            report nobody wants to rebuild. Tell us what breaks, and we will tell you what AmyLearn can and cannot fix.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Direct email</p>
            <a
              href="mailto:support@amylearn.app?subject=AmyLearn%20campus%20conversation"
              className="mt-1.5 inline-flex items-center gap-2 text-sm font-bold text-brandBlue transition-colors hover:text-brand-700"
            >
              <Mail size={15} /> support@amylearn.app
            </a>
            <p className="mt-2 text-[10px] font-medium leading-relaxed text-slate-500">
              We usually reply within two working days. Include your campus code if you already have one.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Helpful to include</p>
            <ul className="mt-2 space-y-1.5">
              {[
                'Institution name and college code',
                'Approximate active student count',
                'Modules or workflows causing the most friction',
                'Any exam, fee or accreditation deadline'
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[10px] font-medium leading-5 text-slate-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-learningTeal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[9px] font-medium leading-relaxed text-slate-500">
            By sending a note you agree to the{' '}
            <Link to="/privacy" className="font-bold text-slate-500 underline underline-offset-2 hover:text-deepNavy">
              privacy policy
            </Link>
            . This preview form does not transmit or store data.
          </p>
        </div>

        <Card className="rounded-3xl p-5 shadow-bento sm:p-7">
          {submitted ? (
            <div role="status" className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-deepNavy">Note captured locally.</h3>
              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                Thanks, {form.name.trim().split(' ')[0] || 'there'}. This demo does not send anything over the network or
                store your details. To reach the team now, email{' '}
                <a href="mailto:support@amylearn.app" className="font-bold text-brandBlue">
                  support@amylearn.app
                </a>
                .
              </p>
              <div className="mt-5 w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Preview summary</p>
                <p className="mt-1 truncate text-[11px] font-bold text-deepNavy">{form.institution}</p>
                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">{form.email}</p>
                <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-500">{form.message}</p>
              </div>
              <Button variant="secondary" size="md" onClick={startAnother} className="mt-5">
                Write another note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-deepNavy">Send a campus note</h3>
                  <p className="mt-1 text-[10px] font-medium text-slate-500">Four fields. No account, no calendar link.</p>
                </div>
                <Badge tone="slate">Local demo</Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-[10px] font-bold text-deepNavy">
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Priya Menon"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={`${inputBase} ${errors.name ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  {errors.name ? (
                    <p id="contact-name-error" className="mt-1 text-[9px] font-semibold text-red-600">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-[10px] font-bold text-deepNavy">
                    Work email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="support@amylearn.app"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className={`${inputBase} ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
                  />
                  {errors.email ? (
                    <p id="contact-email-error" className="mt-1 text-[9px] font-semibold text-red-600">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="contact-institution" className="mb-1.5 block text-[10px] font-bold text-deepNavy">
                  Institution
                </label>
                <input
                  id="contact-institution"
                  name="institution"
                  type="text"
                  autoComplete="organization"
                  value={form.institution}
                  onChange={update('institution')}
                  placeholder="Northbridge University"
                  aria-invalid={Boolean(errors.institution)}
                  aria-describedby={errors.institution ? 'contact-institution-error' : undefined}
                  className={`${inputBase} ${errors.institution ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors.institution ? (
                  <p id="contact-institution-error" className="mt-1 text-[9px] font-semibold text-red-600">
                    {errors.institution}
                  </p>
                ) : null}
              </div>

              <div className="mt-4">
                <label htmlFor="contact-message" className="mb-1.5 block text-[10px] font-bold text-deepNavy">
                  What would you like to fix?
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="We run three departments on separate spreadsheets and exam eligibility takes the office a full week..."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={`${inputBase} resize-none ${errors.message ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors.message ? (
                  <p id="contact-message-error" className="mt-1 text-[9px] font-semibold text-red-600">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" size="lg" icon={Send} className="mt-5 w-full">
                Capture this note
              </Button>
              <p className="mt-2.5 text-center text-[9px] font-medium text-slate-500">
                Demo only — nothing leaves this browser.
              </p>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;
