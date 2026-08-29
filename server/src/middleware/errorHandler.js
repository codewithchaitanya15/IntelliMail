import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred on the server';

  // Handle specific known error scenarios
  if (err.message === 'INTEGRATION_NOT_CONNECTED') {
    statusCode = 400;
    errorCode = 'INTEGRATION_NOT_CONNECTED';
    message = 'Gmail account is not connected. Please connect your Gmail account from Integrations.';
  } else if (err.message === 'AUTH_EXPIRED') {
    statusCode = 401;
    errorCode = 'AUTH_EXPIRED';
    message = 'Gmail authorization has expired or was revoked. Please reconnect your Gmail account.';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
