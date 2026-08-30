import api from './api.js';

export const generateLocalDraft = ({ subject, tone = 'Professional', customInstructions = '', to = '' }) => {
  const cleanSubject = (subject || 'our upcoming discussion').trim().replace(/^subject:\s*/i, '');
  const recipientName = to ? to.split('@')[0].replace(/[\._]/g, ' ') : 'there';
  const capitalizedRecipient = recipientName.charAt(0).toUpperCase() + recipientName.slice(1);

  const greetings = {
    Professional: `Dear ${capitalizedRecipient},`,
    Friendly: `Hi ${capitalizedRecipient}!`,
    Formal: `Dear ${capitalizedRecipient},`,
    Concise: `Hi ${capitalizedRecipient},`,
  };

  const closings = {
    Professional: 'Best regards,\n[Your Name]',
    Friendly: 'Warm regards,\n[Your Name]',
    Formal: 'Sincerely,\n[Your Name]',
    Concise: 'Thanks,\n[Your Name]',
  };

  let bodyParagraphs = '';
  if (tone === 'Concise') {
    bodyParagraphs = `I am writing to you regarding ${cleanSubject}.\n\nPlease review the details at your earliest convenience and let me know if you have any questions or require any next steps.`;
  } else if (tone === 'Friendly') {
    bodyParagraphs = `Hope you're having a wonderful week!\n\nI wanted to quickly reach out regarding ${cleanSubject}. I'm excited about this and would love to collaborate on the next steps.\n\nLet me know what you think and when you might be free for a quick chat!`;
  } else if (tone === 'Formal') {
    bodyParagraphs = `I am writing to formally address the matter of ${cleanSubject}.\n\nKindly review the relevant materials and confirm your availability for any required follow-up proceedings. Please do not hesitate to contact me should you require further documentation.`;
  } else {
    bodyParagraphs = `I hope this email finds you well.\n\nI am writing to you regarding ${cleanSubject}. Please find the relevant details outlined below, and let me know if there are any specific aspects you would like to discuss further.\n\nLooking forward to hearing from you.`;
  }

  if (customInstructions) {
    bodyParagraphs += `\n\nNote: ${customInstructions}`;
  }

  const greeting = greetings[tone] || greetings.Professional;
  const closing = closings[tone] || closings.Professional;
  return {
    body: `${greeting}\n\n${bodyParagraphs}\n\n${closing}`,
    keyPoints: [cleanSubject],
    model: 'client-deterministic-nlp',
  };
};

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
    try {
      const res = await api.post('/ai/draft-email', {
        subject,
        tone,
        customInstructions,
        to,
      });
      return res.data.data;
    } catch (err) {
      // If 404 or backend server is still restarting/deploying, fallback gracefully
      if (err.response && (err.response.status === 404 || err.response.status === 502)) {
        try {
          const res = await api.post('/ai/improve-email', {
            body: `Subject: ${subject}\n\nDraft a complete professional email about ${subject}.`,
            tone,
          });
          if (res.data?.data?.improvedBody) {
            return { body: res.data.data.improvedBody };
          }
        } catch (e) {}

        return generateLocalDraft({ subject, tone, customInstructions, to });
      }

      // Return instant client fallback so user is never blocked by network/endpoint glitches
      return generateLocalDraft({ subject, tone, customInstructions, to });
    }
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
