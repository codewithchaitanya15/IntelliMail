import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;

export const MailTransportService = {
  getTransporter() {
    const host = config.smtp?.host || process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(config.smtp?.port || process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
    const user = config.smtp?.user || process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || '';
    const pass = config.smtp?.pass || process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';
    const secure = port === 465 || process.env.SMTP_SECURE === 'true';

    if (!user || !pass) {
      return null;
    }

    if (!transporter) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    return transporter;
  },

  async sendMail({ from, to, cc, bcc, subject, html, text, inReplyTo, references }) {
    const transport = this.getTransporter();
    if (!transport) {
      console.log(`[MailTransportService] No SMTP credentials configured. In-app & Demo delivery active for: ${to}`);
      return { deliveredRealWorld: false, messageId: `msg_${Date.now()}` };
    }

    try {
      const fromAddress = config.smtp?.from || process.env.SMTP_FROM || process.env.EMAIL_FROM || from;
      const mailOptions = {
        from: fromAddress,
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        text: text || html?.replace(/<[^>]+>/g, '') || '',
        html: html || text || '',
        inReplyTo: inReplyTo || undefined,
        references: references || undefined,
      };

      const info = await transport.sendMail(mailOptions);
      console.log(`[MailTransportService] Email successfully dispatched to ${to}! MessageId: ${info.messageId}`);
      return { deliveredRealWorld: true, messageId: info.messageId, response: info.response };
    } catch (err) {
      console.error(`[MailTransportService] SMTP transmission failed for ${to}:`, err.message);
      return { deliveredRealWorld: false, error: err.message };
    }
  },
};
