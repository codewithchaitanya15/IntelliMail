import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? 'https://intellimail-h9mx.onrender.com/api' : '');
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    (apiBase ? apiBase.replace(/\/api\/?$/, '') : '/');

  socket = io(socketUrl, {
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
