import { google } from 'googleapis';
import { GmailAccount } from '../models/GmailAccount.js';
import {
  generateAuthUrl,
  getOAuth2Client,
  encryptToken,
  GmailIntegration,
} from '../integrations/gmailIntegration.js';
import { ActivityService } from './activityService.js';
import { NotificationService } from './notificationService.js';

export const GmailService = {
  getAuthUrl(userId) {
    // Pass userId as state parameter to verify in callback
    return generateAuthUrl(userId);
  },

  async handleOAuthCallback(code, stateUserId) {
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email;

    const encryptedAccess = encryptToken(tokens.access_token);
    const encryptedRefresh = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;

    let account = await GmailAccount.findOne({ userId: stateUserId });

    if (account) {
      account.email = googleEmail;
      account.encryptedAccessToken = encryptedAccess;
      if (encryptedRefresh) {
        account.encryptedRefreshToken = encryptedRefresh;
      }
      account.expiresAt = new Date(tokens.expiry_date || Date.now() + 3600 * 1000);
      account.isConnected = true;
      account.isDemoMode = false;
      account.profile = {
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      };
      await account.save();
    } else {
      account = await GmailAccount.create({
        userId: stateUserId,
        email: googleEmail,
        provider: 'google',
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
        isConnected: true,
        isDemoMode: false,
        profile: {
          name: userInfo.data.name,
          picture: userInfo.data.picture,
        },
      });
    }

    // Log activity
    await ActivityService.logActivity({
      userId: stateUserId,
      action: 'GMAIL_CONNECTED',
      metadata: { email: googleEmail },
    });

    // Notify
    await NotificationService.createNotification({
      userId: stateUserId,
      type: 'success',
      title: 'Gmail Connected',
      message: `Successfully connected Google account: ${googleEmail}`,
    });

    return account;
  },

  async getStatus(userId) {
    const account = await GmailAccount.findOne({ userId });
    if (!account) {
      return {
        isConnected: false,
        email: null,
        expiresAt: null,
        isDemoMode: false,
      };
    }

    return {
      isConnected: account.isConnected,
      email: account.email,
      expiresAt: account.expiresAt,
      isDemoMode: account.isDemoMode,
      scopes: account.scopes,
      profile: account.profile,
      updatedAt: account.updatedAt,
    };
  },

  async disconnect(userId) {
    const account = await GmailAccount.findOne({ userId });
    if (!account) {
      return { success: true, message: 'No account connected' };
    }

    account.isConnected = false;
    await account.save();

    await ActivityService.logActivity({
      userId,
      action: 'GMAIL_DISCONNECTED',
      metadata: { email: account.email },
    });

    await NotificationService.createNotification({
      userId,
      type: 'warning',
      title: 'Gmail Disconnected',
      message: `Disconnected Gmail account ${account.email}`,
    });

    return { success: true, message: 'Gmail account disconnected successfully' };
  },

  async connectDemoMode(userId, userEmail) {
    let account = await GmailAccount.findOne({ userId });

    if (account) {
      account.isConnected = true;
      account.isDemoMode = true;
      account.email = userEmail;
      await account.save();
    } else {
      account = await GmailAccount.create({
        userId,
        email: userEmail,
        provider: 'google',
        encryptedAccessToken: encryptToken('demo_token'),
        encryptedRefreshToken: encryptToken('demo_refresh'),
        scopes: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.send'],
        expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        isConnected: true,
        isDemoMode: true,
      });
    }

    return account;
  },

  async getIntegrationForUser(userId) {
    const account = await GmailAccount.findOne({ userId, isConnected: true });
    if (!account) {
      const err = new Error('INTEGRATION_NOT_CONNECTED');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      err.statusCode = 400;
      throw err;
    }
    return new GmailIntegration(account);
  },
};
