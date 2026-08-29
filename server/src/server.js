import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env.js';
import { connectDB, getDBStatus } from './config/db.js';
import { initSocket } from './config/socket.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import workers to ensure background jobs are registered
import './workers/aiWorker.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import gmailRoutes from './routes/gmailRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = initSocket(httpServer);

// Security & Optimization Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    app: 'IntelliMail API',
    version: '1.0.0',
    database: getDBStatus(),
    aiProviders: {
      openai: !!config.openaiApiKey,
      gemini: !!config.geminiApiKey,
      fallback: true,
    },
    googleOAuth: {
      configured: !!config.googleClientId,
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/emails', apiLimiter, emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error handling
app.use(errorHandler);

// Bootstrap
const startServer = async () => {
  // Connect DB in background without blocking server startup
  connectDB().catch((err) => console.warn('[Database] Startup note:', err.message));

  httpServer.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 IntelliMail Backend Running!`);
    console.log(`🌐 URL: http://localhost:${config.port}`);
    console.log(`📡 Socket.IO Real-Time Layer: Active`);
    console.log(`🔒 Token Encryption Key: Loaded (AES-256-GCM)`);
    console.log(`🤖 AI Engine: OpenAI [${config.openaiApiKey ? 'Active' : 'Off'}], Gemini [${config.geminiApiKey ? 'Active' : 'Off'}], Fallback [Active]`);
    console.log(`====================================================`);
  });
};

startServer();

export { app, httpServer, io };
