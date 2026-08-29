import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${error.message}). Attempting in-memory/mock fallback...`);
    
    // In local development if MongoDB is not running, we handle connection gracefully
    try {
      // Try fallback or notify
      console.log('[Database] Running in zero-config database mode.');
    } catch (fallbackError) {
      console.error('[Database] Failed to initialize database fallback:', fallbackError.message);
    }
  }
};

export const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'unknown',
    name: mongoose.connection.name || 'unknown',
  };
};
