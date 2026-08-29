import { GmailService } from '../services/gmailService.js';
import { config } from '../config/env.js';

export const GmailController = {
  getOAuthStart(req, res, next) {
    try {
      const authUrl = GmailService.getAuthUrl(req.user._id.toString());
      res.status(200).json({
        success: true,
        data: {
          url: authUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async handleOAuthCallback(req, res, next) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${config.clientUrl}/integrations?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${config.clientUrl}/integrations?error=missing_code`);
      }

      await GmailService.handleOAuthCallback(code, state);
      res.redirect(`${config.clientUrl}/integrations?status=connected`);
    } catch (error) {
      res.redirect(`${config.clientUrl}/integrations?error=${encodeURIComponent(error.message)}`);
    }
  },

  async getStatus(req, res, next) {
    try {
      const status = await GmailService.getStatus(req.user._id);
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  },

  async disconnect(req, res, next) {
    try {
      const result = await GmailService.disconnect(req.user._id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async connectDemoMode(req, res, next) {
    try {
      const account = await GmailService.connectDemoMode(req.user._id, req.user.email);
      res.status(200).json({
        success: true,
        message: 'Demo inbox connected successfully',
        data: {
          isConnected: true,
          isDemoMode: true,
          email: account.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
