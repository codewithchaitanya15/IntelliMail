import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io('/', {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket.io Client] Connected to server, ID:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.io Client] Disconnected from server');
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
