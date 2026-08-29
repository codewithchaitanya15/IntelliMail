import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { GmailAccount } from '../models/GmailAccount.js';
import { config } from '../config/env.js';
import { encryptToken } from '../integrations/gmailIntegration.js';

export const AuthService = {
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      }
    );
  },

  async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // Automatically initialize demo Gmail account so the user can experience the app immediately
    try {
      await GmailAccount.create({
        userId: user._id,
        email: user.email,
        provider: 'google',
        encryptedAccessToken: encryptToken('demo_access_token'),
        encryptedRefreshToken: encryptToken('demo_refresh_token'),
        scopes: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.send'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isConnected: true,
        isDemoMode: true,
        profile: {
          name: user.name,
          messagesTotal: 5,
          threadsTotal: 5,
        },
      });
    } catch (e) {
      console.warn('[AuthService] Demo Gmail account creation note:', e.message);
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      token,
    };
  },

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const gmailAccount = await GmailAccount.findOne({ userId, isConnected: true });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        gmailConnected: !!gmailAccount,
        gmailEmail: gmailAccount ? gmailAccount.email : null,
        isDemoMode: gmailAccount ? gmailAccount.isDemoMode : false,
      },
    };
  },

  async updatePreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    user.preferences = { ...user.preferences.toObject(), ...preferences };
    await user.save();

    return user.preferences;
  },
};
