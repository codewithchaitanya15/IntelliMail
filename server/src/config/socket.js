import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      // Allow unauthenticated connection or mark anonymous
      socket.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      socket.userId = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      console.log(`[Socket.io] Authenticated user connected: ${socket.userId} (socket ${socket.id})`);
    } else {
      console.log(`[Socket.io] Anonymous client connected (socket ${socket.id})`);
    }

    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        socket.userId = userId;
        console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emit an event to a specific user's private room
 * @param {string} userId 
 * @param {string} eventName 
 * @param {object} payload 
 */
export const emitToUser = (userId, eventName, payload) => {
  if (!io) return;
  const targetRoom = `user_${userId}`;
  io.to(targetRoom).emit(eventName, {
    ...payload,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast event to all connected clients
 */
export const broadcastEvent = (eventName, payload) => {
  if (!io) return;
  io.emit(eventName, {
    ...payload,
    timestamp: new Date().toISOString(),
  });
};
