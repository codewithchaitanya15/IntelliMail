import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      error: 'VALIDATION_FAILED',
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  };
};

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const sendEmailRules = [
  body('to').trim().notEmpty().withMessage('Recipient email (To) is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Email content body is required'),
];

export const aiRequestRules = [
  body('emailContent').optional().isString(),
  body('subject').optional().isString(),
];
