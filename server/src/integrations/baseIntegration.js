/**
 * Base Integration Class for Email Providers
 */
export class BaseEmailIntegration {
  constructor(account) {
    this.account = account;
  }

  async listEmails(options = {}) {
    throw new Error('Method listEmails() must be implemented');
  }

  async getEmail(id) {
    throw new Error('Method getEmail() must be implemented');
  }

  async getThread(threadId) {
    throw new Error('Method getThread() must be implemented');
  }

  async searchEmails(query, options = {}) {
    throw new Error('Method searchEmails() must be implemented');
  }

  async markAsRead(id) {
    throw new Error('Method markAsRead() must be implemented');
  }

  async markAsUnread(id) {
    throw new Error('Method markAsUnread() must be implemented');
  }

  async starEmail(id) {
    throw new Error('Method starEmail() must be implemented');
  }

  async unstarEmail(id) {
    throw new Error('Method unstarEmail() must be implemented');
  }

  async archiveEmail(id) {
    throw new Error('Method archiveEmail() must be implemented');
  }

  async deleteEmail(id) {
    throw new Error('Method deleteEmail() must be implemented');
  }

  async sendEmail(emailData) {
    throw new Error('Method sendEmail() must be implemented');
  }

  async saveDraft(emailData) {
    throw new Error('Method saveDraft() must be implemented');
  }
}
