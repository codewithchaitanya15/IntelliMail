import { EmailService } from '../services/emailService.js';
import { addBulkClassifyJob } from '../queues/emailQueue.js';

export const EmailController = {
  async listEmails(req, res, next) {
    try {
      const { folder, query, pageToken, limit } = req.query;
      const result = await EmailService.listEmails(req.user._id, {
        folder: folder || 'inbox',
        query: query || '',
        pageToken,
        maxResults: limit ? parseInt(limit, 10) : 25,
      });

      // Optionally trigger background classification for unclassified emails
      if (result.messages && result.messages.length > 0) {
        addBulkClassifyJob(req.user._id.toString(), result.messages.slice(0, 5));
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEmail(req, res, next) {
    try {
      const email = await EmailService.getEmail(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: email,
      });
    } catch (error) {
      next(error);
    }
  },

  async getThread(req, res, next) {
    try {
      const thread = await EmailService.getThread(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: thread,
      });
    } catch (error) {
      next(error);
    }
  },

  async searchEmails(req, res, next) {
    try {
      const { q } = req.query;
      const result = await EmailService.searchEmails(req.user._id, q || '');
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const result = await EmailService.markAsRead(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsUnread(req, res, next) {
    try {
      const result = await EmailService.markAsUnread(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async starEmail(req, res, next) {
    try {
      const result = await EmailService.starEmail(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async unstarEmail(req, res, next) {
    try {
      const result = await EmailService.unstarEmail(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async archiveEmail(req, res, next) {
    try {
      const result = await EmailService.archiveEmail(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteEmail(req, res, next) {
    try {
      const forcePermanent = req.query.permanent === 'true' || req.body?.permanent === true;
      const result = await EmailService.deleteEmail(req.user._id, req.params.id, forcePermanent);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async restoreEmail(req, res, next) {
    try {
      const result = await EmailService.restoreEmail(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async sendEmail(req, res, next) {
    try {
      const { to, cc, bcc, subject, body, inReplyTo, references, threadId } = req.body;
      const result = await EmailService.sendEmail(req.user._id, {
        to,
        cc,
        bcc,
        subject,
        body,
        inReplyTo,
        references,
        threadId,
      });

      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async replyEmail(req, res, next) {
    try {
      const { to, cc, bcc, subject, body, inReplyTo, references, threadId } = req.body;
      const result = await EmailService.sendEmail(req.user._id, {
        to,
        cc,
        bcc,
        subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
        body,
        inReplyTo,
        references,
        threadId,
      });

      res.status(200).json({
        success: true,
        message: 'Reply sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async saveDraft(req, res, next) {
    try {
      const result = await EmailService.saveDraft(req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Draft saved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
