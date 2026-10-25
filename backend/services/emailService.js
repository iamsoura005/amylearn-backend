'use strict';

const nodemailer = require('nodemailer');
const { getVerificationEmailHtml, getOverdueBookAlertHtml } = require('../templates/emailTemplates');

let transporter = null;

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

/**
 * Send the sign-up verification code. When SMTP credentials are absent the code
 * is logged (development convenience) and a simulated result is returned so the
 * caller can still expose a devCode outside production.
 */
async function sendEmail(email, code, options = {}) {
  const transport = getTransporter();
  if (!transport) {
    // eslint-disable-next-line no-console
    console.log(`[email] SMTP not configured. Verification code for ${email}: ${code}`);
    return { success: true, simulated: true };
  }
  try {
    const info = await transport.sendMail({
      from: `"AmyLearn" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'AmyLearn - Sign Up Email Verification Code',
      html: getVerificationEmailHtml(code, options.name || 'there')
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[email] Verification email failed for ${email}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Overdue library reminder. Accepts either positional arguments
 * (email, name, bookTitle, dueDate, daysOverdue, fine) or an object.
 */
async function sendOverdueBookEmail(email, name, bookTitle, dueDate, daysOverdue, fine) {
  const payload =
    typeof email === 'object' && email !== null
      ? email
      : { email, name, bookTitle, dueDate, daysOverdue, fine };

  const transport = getTransporter();
  const html = getOverdueBookAlertHtml({
    name: payload.name || 'Library Member',
    bookTitle: payload.bookTitle || 'Library book',
    dueDate: payload.dueDate || new Date(),
    daysOverdue: payload.daysOverdue || 0,
    fine: payload.fine || 0
  });

  if (!transport) {
    // eslint-disable-next-line no-console
    console.log(
      `[email] SMTP not configured. Overdue reminder for ${payload.email}: ` +
        `${payload.bookTitle} (${payload.daysOverdue} day(s), fine ₹${payload.fine})`
    );
    return { success: true, simulated: true };
  }

  try {
    const info = await transport.sendMail({
      from: `"AmyLearn" <${process.env.EMAIL_USER}>`,
      to: payload.email,
      subject: 'AmyLearn Library - Overdue Book Reminder',
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[email] Overdue reminder failed for ${payload.email}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendGenericEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) {
    // eslint-disable-next-line no-console
    console.log(`[email] SMTP not configured. Skipped "${subject}" to ${to}.`);
    return { success: true, simulated: true };
  }
  try {
    const info = await transport.sendMail({
      from: `"AmyLearn" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyEmailTransport() {
  const transport = getTransporter();
  if (!transport) return { success: false, configured: false };
  try {
    await transport.verify();
    return { success: true, configured: true };
  } catch (error) {
    return { success: false, configured: true, error: error.message };
  }
}

module.exports = {
  isEmailConfigured,
  getTransporter,
  sendEmail,
  sendOverdueBookEmail,
  sendGenericEmail,
  verifyEmailTransport
};
