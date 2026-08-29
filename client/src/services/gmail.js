import api from './api.js';

export const gmailService = {
  async getOAuthUrl() {
    const res = await api.get('/gmail/oauth/start');
    return res.data.data.url;
  },

  async getStatus() {
    const res = await api.get('/gmail/status');
    return res.data.data;
  },

  async disconnect() {
    const res = await api.post('/gmail/disconnect');
    return res.data;
  },

  async connectDemo() {
    const res = await api.post('/gmail/connect-demo');
    return res.data;
  },
};
