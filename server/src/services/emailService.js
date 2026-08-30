import { GmailService } from './gmailService.js';
import { ActivityService } from './activityService.js';
import { NotificationService } from './notificationService.js';
import { Email } from '../models/Email.js';
import { AISummary } from '../models/AISummary.js';
import { AIReply } from '../models/AIReply.js';
import { emitToUser } from '../config/socket.js';

export const EmailService = {
  async listEmails(userId, { folder = 'inbox', query = '', pageToken = null, maxResults = 25 }) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const result = await integration.listEmails({ folder, query, pageToken, maxResults });

    return result;
  },

  async getStats(userId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    return integration.getStats();
  },

  async getEmail(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    let email = await integration.getEmail(emailId);

    // If currently unread, automatically mark as read when opened
    if (email && !email.isRead) {
      try {
        await integration.markAsRead(emailId);
        email.isRead = true;
        if (email.labels) {
          email.labels = email.labels.filter((l) => l !== 'UNREAD');
        }
      } catch (err) {
        console.warn('[EmailService] Auto mark-as-read on open error:', err.message);
      }
    }

    // Retrieve any persisted AI summary or generated replies for this email
    const [summaryDoc, replies] = await Promise.all([
      AISummary.findOne({ userId, emailId }).sort({ createdAt: -1 }),
      AIReply.find({ userId, emailId }).sort({ createdAt: -1 }),
    ]);

    // Record activity
    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_OPENED',
      metadata: { subject: email?.subject, from: email?.from },
    });

    return {
      ...email,
      aiSummary: summaryDoc,
      aiReplies: replies,
    };
  },

  async getThread(userId, threadId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    return integration.getThread(threadId);
  },

  async searchEmails(userId, query) {
    const integration = await GmailService.getIntegrationForUser(userId);
    return integration.listEmails({ query, folder: '' });
  },

  async markAsRead(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.markAsRead(emailId);

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_READ',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isRead: true });
    return res;
  },

  async markAsUnread(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.markAsUnread(emailId);

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_UNREAD',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isRead: false });
    return res;
  },

  async starEmail(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.starEmail(emailId);

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_STARRED',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isStarred: true });
    return res;
  },

  async unstarEmail(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.unstarEmail(emailId);

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_UNSTARRED',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isStarred: false });
    return res;
  },

  async archiveEmail(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.archiveEmail(emailId);

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_ARCHIVED',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isArchived: true });
    return res;
  },

  async deleteEmail(userId, emailId, forcePermanent = false) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.deleteEmail(emailId, forcePermanent);

    if (res.permanent) {
      try {
        await Promise.all([
          Email.deleteOne({ userId, id: emailId }),
          AISummary.deleteMany({ userId, emailId }),
          AIReply.deleteMany({ userId, emailId }),
        ]);
      } catch (err) {
        console.warn('[EmailService] Permanent delete DB cleanup error:', err.message);
      }
    }

    await ActivityService.logActivity({
      userId,
      emailId,
      action: res.permanent ? 'EMAIL_PERMANENTLY_DELETED' : 'EMAIL_DELETED',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isTrash: !res.permanent, isDeleted: res.permanent });
    return res;
  },

  async restoreEmail(userId, emailId) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.untrashEmail(emailId);

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'EMAIL_RESTORED',
    });

    emitToUser(userId.toString(), 'EMAIL_UPDATED', { emailId, isTrash: false });
    return res;
  },

  async sendEmail(userId, { to, cc, bcc, subject, body, inReplyTo, references, threadId }) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.sendEmail({
      to,
      cc,
      bcc,
      subject,
      body,
      inReplyTo,
      references,
      threadId,
    });

    await ActivityService.logActivity({
      userId,
      emailId: res.id,
      action: 'EMAIL_SENT',
      metadata: { to, subject },
    });

    await NotificationService.createNotification({
      userId,
      type: 'email_sent',
      title: 'Email Sent',
      message: `Message "${subject}" successfully sent to ${to}`,
    });

    emitToUser(userId.toString(), 'EMAIL_SENT', {
      messageId: res.id,
      to,
      subject,
    });

    return res;
  },

  async saveDraft(userId, emailData) {
    const integration = await GmailService.getIntegrationForUser(userId);
    const res = await integration.saveDraft(emailData);

    await ActivityService.logActivity({
      userId,
      emailId: res.id,
      action: 'EMAIL_DRAFTED',
      metadata: { subject: emailData.subject },
    });

    return res;
  },
};
