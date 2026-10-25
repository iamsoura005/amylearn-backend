'use strict';

const BRAND = {
  name: 'AmyLearn',
  blue: '#004bb0',
  blueBright: '#1E63D6',
  teal: '#21C7C4',
  navy: '#0A1F44',
  surface: '#F6F8FC',
  muted: '#64748B'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout({ preheader = '', title = '', body = '', footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${title || BRAND.name}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.surface};font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:${BRAND.navy};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E1E8FF;box-shadow:0 12px 32px rgba(4,26,63,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,${BRAND.blue} 0%,${BRAND.blueBright} 55%,${BRAND.teal} 100%);padding:26px 28px;">
                <div style="font-family:'Jost','Plus Jakarta Sans',Arial,sans-serif;font-size:24px;font-weight:700;letter-spacing:0.4px;color:#ffffff;">${BRAND.name}</div>
                <div style="font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.82);margin-top:4px;">Unified Academic Platform</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;">
                <h1 style="margin:0 0 12px;font-family:'Jost','Plus Jakarta Sans',Arial,sans-serif;font-size:22px;line-height:1.3;color:${BRAND.navy};">${title}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 28px;">
                <div style="border-top:1px solid #E9EDFF;padding-top:16px;font-size:11px;line-height:1.6;color:${BRAND.muted};">
                  ${footerNote || `You are receiving this email because an account activity was requested on ${BRAND.name}.`}
                  <br />Need help? Write to <a href="mailto:support@amylearn.app" style="color:${BRAND.blueBright};text-decoration:none;">support@amylearn.app</a>.
                </div>
              </td>
            </tr>
          </table>
          <div style="max-width:560px;margin:14px auto 0;font-size:10px;color:#94A3B8;text-align:center;">
            &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getVerificationEmailHtml(code, name = 'there') {
  const body = `
    <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#334155;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#334155;">
      Use the verification code below to finish creating your ${BRAND.name} account. The code expires in
      <strong>10 minutes</strong>.
    </p>
    <div style="margin:0 0 20px;padding:20px;border-radius:16px;background:linear-gradient(135deg,#EBF4FF 0%,#E6FFFA 100%);border:1px solid #CFE3FF;text-align:center;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.muted};">Verification code</div>
      <div style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:${BRAND.blue};margin-top:8px;">${escapeHtml(code)}</div>
    </div>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#334155;">
      Enter this code on the verification screen. If you did not request it, you can safely ignore this email.
    </p>`;
  return layout({
    preheader: `Your ${BRAND.name} verification code is ${escapeHtml(code)}`,
    title: 'Verify your email address',
    body,
    footerNote: `For your security, never share this code with anyone. ${BRAND.name} will never ask for it.`
  });
}

function getOverdueBookAlertHtml({
  name = 'Library Member',
  bookTitle = 'Library book',
  dueDate = new Date(),
  daysOverdue = 0,
  fine = 0
} = {}) {
  const formattedDue = new Date(dueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const body = `
    <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#334155;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155;">
      Our circulation desk shows that a book issued to you is now overdue. Please return it at the earliest to
      stop the fine from increasing.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #E1E8FF;border-radius:14px;overflow:hidden;">
      <tr style="background:#F6F8FC;">
        <td style="padding:12px 16px;font-size:12px;color:${BRAND.muted};width:42%;">Book</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:${BRAND.navy};">${escapeHtml(bookTitle)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:12px;color:${BRAND.muted};border-top:1px solid #EDF1FA;">Due date</td>
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.navy};border-top:1px solid #EDF1FA;">${escapeHtml(formattedDue)}</td>
      </tr>
      <tr style="background:#F6F8FC;">
        <td style="padding:12px 16px;font-size:12px;color:${BRAND.muted};border-top:1px solid #EDF1FA;">Days overdue</td>
        <td style="padding:12px 16px;font-size:13px;color:${BRAND.navy};border-top:1px solid #EDF1FA;">${escapeHtml(daysOverdue)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:12px;color:${BRAND.muted};border-top:1px solid #EDF1FA;">Fine accrued</td>
        <td style="padding:12px 16px;font-size:15px;font-weight:700;color:${BRAND.blue};border-top:1px solid #EDF1FA;">&#8377;${escapeHtml(fine)}</td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.7;color:#334155;">
      Fines are calculated at &#8377;10 per day after the due date. If you have already returned the book, please
      ignore this reminder and contact the library desk.
    </p>`;
  return layout({
    preheader: `Overdue reminder: ${escapeHtml(bookTitle)} (fine ₹${escapeHtml(fine)})`,
    title: 'Library overdue reminder',
    body,
    footerNote: `This alert was generated automatically by the ${BRAND.name} library circulation service.`
  });
}

function getWelcomeEmailHtml({ name = 'there', roleLabel = 'Student', institution = 'your institution' } = {}) {
  const body = `
    <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#334155;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">
      Your ${BRAND.name} account is ready. You are registered as a <strong>${escapeHtml(roleLabel)}</strong> at ${escapeHtml(institution)}.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.7;color:#334155;">
      Sign in to your portal to access courses, attendance, examination services and the digital library.
    </p>`;
  return layout({
    preheader: `Welcome to ${BRAND.name}`,
    title: `Welcome to ${BRAND.name}`,
    body
  });
}

module.exports = {
  BRAND,
  layout,
  getVerificationEmailHtml,
  getOverdueBookAlertHtml,
  getWelcomeEmailHtml
};
