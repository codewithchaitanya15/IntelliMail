import { AuthService } from '../services/authService.js';

export const AuthController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  },

  async getMe(req, res, next) {
    try {
      const result = await AuthService.getMe(req.user._id);
      res.status(200).json({
        success: true,
        data: result.user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const preferences = await AuthService.updatePreferences(req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  },
};
