import { AIService } from '../services/aiService.js';

export const AIController = {
  async summarize(req, res, next) {
    try {
      const { email, emailId } = req.body;
      const summary = await AIService.summarizeEmail({
        email,
        emailId: emailId || email?.id,
        userId: req.user._id,
      });

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  async generateReply(req, res, next) {
    try {
      const { email, emailId, tone, customInstructions } = req.body;
      const reply = await AIService.generateReply({
        email,
        emailId: emailId || email?.id,
        tone: tone || req.user.preferences?.defaultReplyTone || 'Professional',
        customInstructions: customInstructions || '',
        userId: req.user._id,
      });

      res.status(200).json({
        success: true,
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  },

  async classify(req, res, next) {
    try {
      const { email } = req.body;
      const classification = await AIService.classifyEmail({
        email,
        userId: req.user._id,
      });

      res.status(200).json({
        success: true,
        data: classification,
      });
    } catch (error) {
      next(error);
    }
  },

  async detectPriority(req, res, next) {
    try {
      const { email } = req.body;
      const priority = await AIService.detectPriority({ email });

      res.status(200).json({
        success: true,
        data: priority,
      });
    } catch (error) {
      next(error);
    }
  },

  async explain(req, res, next) {
    try {
      const { email } = req.body;
      const explanation = await AIService.explainEmail({
        email,
        userId: req.user._id,
      });

      res.status(200).json({
        success: true,
        data: explanation,
      });
    } catch (error) {
      next(error);
    }
  },

  async extractActionItems(req, res, next) {
    try {
      const { email } = req.body;
      const actionItems = await AIService.extractActionItems({
        email,
        userId: req.user._id,
      });

      res.status(200).json({
        success: true,
        data: actionItems,
      });
    } catch (error) {
      next(error);
    }
  },

  async extractDates(req, res, next) {
    try {
      const { email } = req.body;
      const dates = await AIService.extractDates({ email });

      res.status(200).json({
        success: true,
        data: dates,
      });
    } catch (error) {
      next(error);
    }
  },

  async generateSubject(req, res, next) {
    try {
      const { body } = req.body;
      const subjects = await AIService.generateSubject({ body: body || '' });

      res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  },

  async improveEmail(req, res, next) {
    try {
      const { body, tone } = req.body;
      const improvement = await AIService.improveEmail({
        body: body || '',
        tone: tone || 'Professional',
      });

      res.status(200).json({
        success: true,
        data: improvement,
      });
    } catch (error) {
      next(error);
    }
  },

  async smartSearch(req, res, next) {
    try {
      const { query } = req.body;
      const parsed = await AIService.smartSearch({ query: query || '' });

      res.status(200).json({
        success: true,
        data: parsed,
      });
    } catch (error) {
      next(error);
    }
  },

  async draftEmail(req, res, next) {
    try {
      const { subject, tone, customInstructions, to } = req.body;
      if (!subject || !subject.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Subject is required to draft an email with AI',
        });
      }

      const result = await AIService.draftEmail({
        subject,
        tone: tone || 'Professional',
        customInstructions: customInstructions || '',
        to: to || '',
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
