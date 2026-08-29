import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/intelligent-email-assistant',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_jwt_key_super_secure_antigravity_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Token Encryption (32-byte hex or utf8 key for AES-256-GCM)
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || '9f8e7d6c5b4a3928170e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e',
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/gmail/oauth/callback',
  
  // AI Keys
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Redis (BullMQ)
  redis: {
    url: process.env.REDIS_URL || '',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  }
};
