import api from './api.js';

export const aiService = {
  async summarizeEmail({ email, emailId }) {
    const res = await api.post('/ai/summarize', { email, emailId });
    return res.data.data;
  },

  async generateReply({ email, emailId, tone, customInstructions }) {
    const res = await api.post('/ai/generate-reply', {
      email,
      emailId,
      tone,
      customInstructions,
    });
    return res.data.data;
  },

  async classifyEmail({ email }) {
    const res = await api.post('/ai/classify', { email });
    return res.data.data;
  },

  async detectPriority({ email }) {
    const res = await api.post('/ai/priority', { email });
    return res.data.data;
  },

  async explainEmail({ email }) {
    const res = await api.post('/ai/explain', { email });
    return res.data.data;
  },

  async extractActionItems({ email }) {
    const res = await api.post('/ai/action-items', { email });
    return res.data.data;
  },

  async extractDates({ email }) {
    const res = await api.post('/ai/extract-dates', { email });
    return res.data.data;
  },

  async generateSubject({ body }) {
    const res = await api.post('/ai/generate-subject', { body });
    return res.data.data;
  },

  async draftEmail({ subject, tone = 'Professional', customInstructions = '', to = '' }) {
    const res = await api.post('/ai/draft-email', {
      subject,
      tone,
      customInstructions,
      to,
    });
    return res.data.data;
  },

  async improveEmail({ body, tone }) {
    const res = await api.post('/ai/improve-email', { body, tone });
    return res.data.data;
  },

  async smartSearch({ query }) {
    const res = await api.post('/ai/smart-search', { query });
    return res.data.data;
  },
};
