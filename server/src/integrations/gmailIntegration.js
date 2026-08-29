import crypto from 'crypto';
import { google } from 'googleapis';
import { config } from '../config/env.js';
import { BaseEmailIntegration } from './baseIntegration.js';

// --- AES-256-GCM Encryption / Decryption Utilities ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96 bits for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from the configured encryption key
 */
const getEncryptionKey = () => {
  const key = config.tokenEncryptionKey;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not defined in environment');
  }
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypts a text string using AES-256-GCM
 * Returns string in format: iv:authTag:encryptedData (hex)
 */
export const encryptToken = (plainText) => {
  if (!plainText) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts an AES-256-GCM encrypted token string
 */
export const decryptToken = (cipherText) => {
  if (!cipherText) return null;
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }
  
  const [ivHex, authTagHex, encryptedDataHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// --- Google OAuth2 Client Helpers ---

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
};

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
];

export const generateAuthUrl = (state = '') => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Ensure refresh_token is returned
    scope: GMAIL_SCOPES,
    state,
  });
};

// --- In-Memory Mock Store for Demo / Testing when Google OAuth credentials are not provided ---
const mockEmailsStore = new Map();

const getMockInboxSeed = (userEmail = 'user@gmail.com') => [
  {
    id: 'msg_demo_101',
    threadId: 'th_demo_101',
    sender: 'Sarah Jenkins <sarah.jenkins@techcorp.io>',
    from: 'Sarah Jenkins <sarah.jenkins@techcorp.io>',
    to: userEmail,
    subject: 'Action Required: Final Architecture Review for Q3 Cloud Migration',
    snippet: 'Hi team, please find attached the revised microservices topology. We have our final stakeholder review on Monday at 10:30 AM EST...',
    body: `Hi team,

I hope you're having a productive week.

Please find attached the revised microservices topology for our upcoming Q3 Cloud Migration. We have scheduled the final stakeholder review for **Monday, September 7, 2026, at 10:30 AM EST**.

Important requirements before the meeting:
1. Review the attached Kubernetes cluster sizing document.
2. Submit your feedback on the disaster recovery SLA by Friday at 5:00 PM.
3. Coordinate with the DevOps security team regarding IAM role policies.

Please let me know if anyone cannot make the Monday review so we can arrange an alternate briefing.

Best regards,
Sarah Jenkins
Principal Cloud Architect | TechCorp Systems`,
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    isStarred: true,
    isArchived: false,
    isTrash: false,
    labels: ['INBOX', 'IMPORTANT', 'STARRED', 'UNREAD'],
    priority: 'HIGH',
    category: 'Work',
    actionItems: [
      'Review attached Kubernetes cluster sizing document',
      'Submit feedback on disaster recovery SLA by Friday 5:00 PM',
      'Coordinate with DevOps security team on IAM role policies',
      'Attend Architecture Review meeting on Monday at 10:30 AM EST'
    ],
    dates: [
      { title: 'Disaster Recovery Feedback Due', date: 'September 4, 2026', time: '5:00 PM' },
      { title: 'Stakeholder Architecture Review', date: 'September 7, 2026', time: '10:30 AM EST' }
    ]
  },
  {
    id: 'msg_demo_102',
    threadId: 'th_demo_102',
    sender: 'Acme Cloud Platform <billing@acmecloud.com>',
    from: 'Acme Cloud Platform <billing@acmecloud.com>',
    to: userEmail,
    subject: 'Your Monthly Invoice for August 2026 (Invoice #INV-98234)',
    snippet: 'Your invoice for $142.50 has been processed successfully. View invoice breakdown and download receipts...',
    body: `Hello,

Thank you for choosing Acme Cloud. Your monthly invoice for the billing period of August 1 - August 31, 2026, is now available.

**Invoice Summary:**
- Invoice Number: INV-98234
- Amount Charged: $142.50 USD
- Payment Method: Visa ending in 4242
- Status: Paid

No further action is required on your part. If you have any questions regarding your usage metrics, please visit your account billing portal.

Sincerely,
The Acme Cloud Team`,
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isTrash: false,
    labels: ['INBOX', 'FINANCE'],
    priority: 'LOW',
    category: 'Finance',
    actionItems: [],
    dates: []
  },
  {
    id: 'msg_demo_103',
    threadId: 'th_demo_103',
    sender: 'David Mitchell <david.m@innovatehub.org>',
    from: 'David Mitchell <david.m@innovatehub.org>',
    to: userEmail,
    subject: 'Interview Invitation: Lead AI Solutions Engineer',
    snippet: 'We were very impressed with your background and would love to invite you for a virtual technical interview...',
    body: `Dear Candidate,

Thank you for your application for the Lead AI Solutions Engineer position at InnovateHub.

We were thoroughly impressed by your portfolio and demonstrated experience in full-stack AI engineering. We would love to invite you for a 60-minute technical and architectural discussion with our Engineering Director and Lead Architect.

Proposed times:
- Wednesday, September 2 at 2:00 PM EST
- Thursday, September 3 at 11:00 AM EST

Please confirm which of these times works best for you, or propose an alternate slot. Please also ensure you have a quiet space and a camera enabled for the Google Meet session.

Looking forward to speaking with you!

Warm regards,
David Mitchell
Head of Talent Acquisition | InnovateHub`,
    date: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    isRead: false,
    isStarred: true,
    isArchived: false,
    isTrash: false,
    labels: ['INBOX', 'IMPORTANT', 'STARRED', 'UNREAD'],
    priority: 'HIGH',
    category: 'Work',
    actionItems: [
      'Reply to confirm preferred interview time slot (Wed 2 PM or Thu 11 AM)',
      'Prepare portfolio and technical architecture talking points',
      'Test Google Meet setup and camera'
    ],
    dates: [
      { title: 'Interview Option 1', date: 'September 2, 2026', time: '2:00 PM EST' },
      { title: 'Interview Option 2', date: 'September 3, 2026', time: '11:00 AM EST' }
    ]
  },
  {
    id: 'msg_demo_104',
    threadId: 'th_demo_104',
    sender: 'GitHub Security <no-reply@github.com>',
    from: 'GitHub Security <no-reply@github.com>',
    to: userEmail,
    subject: '[Security Alert] Dependabot alert for high vulnerability in redis package',
    snippet: 'We found a vulnerable dependency in your repository. Please update ioredis to >= 5.5.0 immediately...',
    body: `GitHub Dependabot has detected 1 high severity vulnerability in your project dependencies.

Repository: Intelligent-Email-Assistant
Package: ioredis (< 5.5.0)
Severity: HIGH
Recommendation: Upgrade to ioredis@^5.5.0

You can view the full security advisory and automatically open a pull request in your GitHub repository security tab.`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isTrash: false,
    labels: ['INBOX'],
    priority: 'MEDIUM',
    category: 'Important',
    actionItems: ['Update ioredis dependency to 5.5.0+ and review PR'],
    dates: []
  },
  {
    id: 'msg_demo_105',
    threadId: 'th_demo_105',
    sender: 'Spotify <news@spotify.com>',
    from: 'Spotify <news@spotify.com>',
    to: userEmail,
    subject: 'Your Weekly Discovery Mix is Ready! 🎶',
    snippet: 'Discover 30 brand new songs picked just for you based on your recent listening habits...',
    body: `Hey there music lover!

Your brand new Discover Weekly playlist has dropped. We've handpicked 30 new tracks based on your recent favorite artists in ambient electronic, synthwave, and lo-fi beats.

Hit play now on your desktop or mobile app!`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isTrash: false,
    labels: ['INBOX', 'PROMOTIONS'],
    priority: 'LOW',
    category: 'Promotions',
    actionItems: [],
    dates: []
  }
];

/**
 * Gmail Integration Implementation
 */
export class GmailIntegration extends BaseEmailIntegration {
  constructor(account) {
    super(account);
    this.isDemo = account.isDemoMode || !config.googleClientId;
    this.oauth2Client = null;
    this.gmail = null;

    if (!this.isDemo) {
      this.initClient();
    }
  }

  initClient() {
    this.oauth2Client = getOAuth2Client();
    const accessToken = decryptToken(this.account.encryptedAccessToken);
    const refreshToken = decryptToken(this.account.encryptedRefreshToken);

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: this.account.expiresAt ? new Date(this.account.expiresAt).getTime() : undefined,
    });

    // Auto-refresh token listener
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        this.account.encryptedAccessToken = encryptToken(tokens.access_token);
      }
      if (tokens.refresh_token) {
        this.account.encryptedRefreshToken = encryptToken(tokens.refresh_token);
      }
      if (tokens.expiry_date) {
        this.account.expiresAt = new Date(tokens.expiry_date);
      }
      await this.account.save();
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  getDemoEmails() {
    const key = this.account.userId?.toString() || 'default';
    if (!mockEmailsStore.has(key)) {
      mockEmailsStore.set(key, getMockInboxSeed(this.account.email));
    }
    return mockEmailsStore.get(key);
  }

  saveDemoEmails(emails) {
    const key = this.account.userId?.toString() || 'default';
    mockEmailsStore.set(key, emails);
  }

  async listEmails({ folder = 'inbox', query = '', pageToken = null, maxResults = 25 }) {
    if (this.isDemo) {
      let emails = [...this.getDemoEmails()];

      // Filter by folder
      if (folder === 'inbox') {
        emails = emails.filter((e) => !e.isArchived && !e.isTrash);
      } else if (folder === 'starred') {
        emails = emails.filter((e) => e.isStarred && !e.isTrash);
      } else if (folder === 'sent') {
        emails = emails.filter((e) => e.from?.includes(this.account.email) && !e.isTrash);
      } else if (folder === 'archive') {
        emails = emails.filter((e) => e.isArchived && !e.isTrash);
      } else if (folder === 'trash') {
        emails = emails.filter((e) => e.isTrash);
      }

      // Filter by search query
      if (query && query.trim()) {
        const q = query.toLowerCase();
        emails = emails.filter(
          (e) =>
            e.subject.toLowerCase().includes(q) ||
            e.body.toLowerCase().includes(q) ||
            e.sender.toLowerCase().includes(q) ||
            (e.category && e.category.toLowerCase().includes(q))
        );
      }

      return {
        messages: emails,
        nextPageToken: null,
        resultSizeEstimate: emails.length,
        isDemo: true,
      };
    }

    // Real Gmail API
    try {
      let q = query || '';
      if (folder === 'inbox') q = `in:inbox ${q}`.trim();
      else if (folder === 'starred') q = `is:starred ${q}`.trim();
      else if (folder === 'sent') q = `in:sent ${q}`.trim();
      else if (folder === 'trash') q = `in:trash ${q}`.trim();
      else if (folder === 'archive') q = `-in:inbox -in:trash -in:spam ${q}`.trim();

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q,
        maxResults,
        pageToken,
      });

      const messageIds = response.data.messages || [];
      const messages = await Promise.all(
        messageIds.map(async (msg) => this.getEmail(msg.id))
      );

      return {
        messages: messages.filter(Boolean),
        nextPageToken: response.data.nextPageToken || null,
        resultSizeEstimate: response.data.resultSizeEstimate || messages.length,
        isDemo: false,
      };
    } catch (error) {
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        throw new Error('AUTH_EXPIRED');
      }
      throw error;
    }
  }

  async getEmail(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const email = emails.find((e) => e.id === id);
      if (!email) {
        throw new Error(`Email with ID ${id} not found`);
      }
      return email;
    }

    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'full',
      });
      return this.parseGmailMessage(res.data);
    } catch (error) {
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        throw new Error('AUTH_EXPIRED');
      }
      throw error;
    }
  }

  async getThread(threadId) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const threadEmails = emails.filter((e) => e.threadId === threadId || e.id === threadId);
      return {
        id: threadId,
        messages: threadEmails.length > 0 ? threadEmails : [emails[0]],
      };
    }

    try {
      const res = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      const messages = (res.data.messages || []).map((m) => this.parseGmailMessage(m));
      return {
        id: threadId,
        messages,
      };
    } catch (error) {
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        throw new Error('AUTH_EXPIRED');
      }
      throw error;
    }
  }

  async markAsRead(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        target.isRead = true;
        target.labels = (target.labels || []).filter((l) => l !== 'UNREAD');
        this.saveDemoEmails(emails);
      }
      return target;
    }

    return this.gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }

  async markAsUnread(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        target.isRead = false;
        if (!target.labels?.includes('UNREAD')) {
          target.labels = [...(target.labels || []), 'UNREAD'];
        }
        this.saveDemoEmails(emails);
      }
      return target;
    }

    return this.gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        addLabelIds: ['UNREAD'],
      },
    });
  }

  async starEmail(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        target.isStarred = true;
        if (!target.labels?.includes('STARRED')) {
          target.labels = [...(target.labels || []), 'STARRED'];
        }
        this.saveDemoEmails(emails);
      }
      return target;
    }

    return this.gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        addLabelIds: ['STARRED'],
      },
    });
  }

  async unstarEmail(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        target.isStarred = false;
        target.labels = (target.labels || []).filter((l) => l !== 'STARRED');
        this.saveDemoEmails(emails);
      }
      return target;
    }

    return this.gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        removeLabelIds: ['STARRED'],
      },
    });
  }

  async archiveEmail(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        target.isArchived = true;
        target.labels = (target.labels || []).filter((l) => l !== 'INBOX');
        this.saveDemoEmails(emails);
      }
      return target;
    }

    return this.gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });
  }

  async deleteEmail(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        if (target.isTrash) {
          // Permanently remove from demo store if already in Trash
          const remaining = emails.filter((e) => e.id !== id);
          this.saveDemoEmails(remaining);
          return { success: true, id, permanent: true };
        }
        target.isTrash = true;
        target.labels = [...(target.labels || []).filter((l) => l !== 'INBOX'), 'TRASH'];
        this.saveDemoEmails(emails);
      }
      return { success: true, id, permanent: false };
    }

    try {
      // First try moving to trash
      return await this.gmail.users.messages.trash({
        userId: 'me',
        id,
      });
    } catch (err) {
      // If already in trash or error, permanently delete from Gmail
      return await this.gmail.users.messages.delete({
        userId: 'me',
        id,
      });
    }
  }

  async untrashEmail(id) {
    if (this.isDemo) {
      const emails = this.getDemoEmails();
      const target = emails.find((e) => e.id === id);
      if (target) {
        target.isTrash = false;
        target.labels = [...(target.labels || []).filter((l) => l !== 'TRASH'), 'INBOX'];
        this.saveDemoEmails(emails);
      }
      return { success: true, id };
    }

    return this.gmail.users.messages.untrash({
      userId: 'me',
      id,
    });
  }

  async sendEmail({ to, cc, bcc, subject, body, inReplyTo, references, threadId }) {
    if (this.isDemo) {
      const newMsg = {
        id: `msg_sent_${Date.now()}`,
        threadId: threadId || `th_${Date.now()}`,
        sender: `Me <${this.account.email}>`,
        from: this.account.email,
        to,
        cc: cc || '',
        bcc: bcc || '',
        subject,
        snippet: body.slice(0, 100) + '...',
        body,
        date: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        isArchived: false,
        isTrash: false,
        labels: ['SENT'],
        priority: 'MEDIUM',
        category: 'Work',
      };

      const emails = this.getDemoEmails();
      emails.unshift(newMsg);
      this.saveDemoEmails(emails);

      return {
        id: newMsg.id,
        threadId: newMsg.threadId,
        labelIds: ['SENT'],
        isDemo: true,
      };
    }

    // Build standard RFC 2822 MIME message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${this.account.email}`,
      `To: ${to}`,
      ...(cc ? [`Cc: ${cc}`] : []),
      ...(bcc ? [`Bcc: ${bcc}`] : []),
      `Subject: ${utf8Subject}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`] : []),
      ...(references ? [`References: ${references}`] : []),
      '',
      body,
    ];

    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || undefined,
      },
    });

    return res.data;
  }

  async saveDraft({ to, cc, bcc, subject, body, inReplyTo, references, threadId }) {
    if (this.isDemo) {
      const draftMsg = {
        id: `draft_${Date.now()}`,
        threadId: threadId || `th_${Date.now()}`,
        sender: `Me <${this.account.email}>`,
        from: this.account.email,
        to,
        cc: cc || '',
        bcc: bcc || '',
        subject: subject || '(No Subject)',
        snippet: body.slice(0, 100),
        body,
        date: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        isArchived: false,
        isTrash: false,
        labels: ['DRAFT'],
      };
      const emails = this.getDemoEmails();
      emails.unshift(draftMsg);
      this.saveDemoEmails(emails);
      return { id: draftMsg.id, message: draftMsg, isDemo: true };
    }

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject || '').toString('base64')}?=`;
    const messageParts = [
      `From: ${this.account.email}`,
      `To: ${to || ''}`,
      ...(cc ? [`Cc: ${cc}`] : []),
      ...(bcc ? [`Bcc: ${bcc}`] : []),
      `Subject: ${utf8Subject}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`] : []),
      ...(references ? [`References: ${references}`] : []),
      '',
      body || '',
    ];

    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await this.gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: threadId || undefined,
        },
      },
    });

    return res.data;
  }

  parseGmailMessage(msgData) {
    if (!msgData) return null;

    const headers = msgData.payload?.headers || [];
    const getHeader = (name) => {
      const h = headers.find((header) => header.name.toLowerCase() === name.toLowerCase());
      return h ? h.value : '';
    };

    const subject = getHeader('Subject') || '(No Subject)';
    const from = getHeader('From') || 'Unknown Sender';
    const to = getHeader('To') || '';
    const cc = getHeader('Cc') || '';
    const date = getHeader('Date') ? new Date(getHeader('Date')).toISOString() : new Date().toISOString();

    let body = '';
    let attachments = [];

    const extractBody = (part) => {
      if (!part) return;
      if (part.body && part.body.data) {
        const decoded = Buffer.from(part.body.data, 'base64').toString('utf8');
        if (part.mimeType === 'text/html') {
          body = decoded;
        } else if (part.mimeType === 'text/plain' && !body) {
          body = decoded;
        }
      }
      if (part.filename && part.body && part.body.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };

    if (msgData.payload) {
      extractBody(msgData.payload);
    }

    const labels = msgData.labelIds || [];
    const isRead = !labels.includes('UNREAD');
    const isStarred = labels.includes('STARRED');
    const isArchived = !labels.includes('INBOX') && !labels.includes('TRASH');
    const isTrash = labels.includes('TRASH');

    return {
      id: msgData.id,
      threadId: msgData.threadId,
      sender: from,
      from,
      to,
      cc,
      subject,
      snippet: msgData.snippet || '',
      body: body || msgData.snippet || '',
      date,
      isRead,
      isStarred,
      isArchived,
      isTrash,
      labels,
      attachments,
    };
  }
}
