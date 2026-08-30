import api from './api.js';

export const generateLocalDraft = ({ subject, tone = 'Professional', customInstructions = '', to = '' }) => {
  const cleanSubject = (subject || 'our upcoming strategic initiative').trim().replace(/^subject:\s*/i, '');
  const recipientName = to ? to.split('@')[0].replace(/[\._]/g, ' ') : 'there';
  const capitalizedRecipient = recipientName.charAt(0).toUpperCase() + recipientName.slice(1);

  const greetings = {
    Professional: `Dear ${capitalizedRecipient},`,
    Friendly: `Hi ${capitalizedRecipient}!`,
    Formal: `Dear ${capitalizedRecipient},`,
    Concise: `Hi ${capitalizedRecipient},`,
  };

  const closings = {
    Professional: 'Best regards,\n\n[Your Name]\n[Your Title / Organization]\n[Your Contact Information]',
    Friendly: 'Warm regards,\n\n[Your Name]\n[Your Contact Details]',
    Formal: 'Sincerely,\n\n[Your Name]\n[Executive Leadership]\n[Organization Name]',
    Concise: 'Best regards,\n\n[Your Name]',
  };

  let bodyContent = '';

  if (tone === 'Friendly') {
    bodyContent = `Hope you're having a wonderful and productive week!

I wanted to quickly reach out to you regarding ${cleanSubject}. We are making great momentum on this front and wanted to share a quick update on our progress and the next collaborative steps.

Key Highlights & Snapshot:
• Strategic Alignment: Ensuring all milestones directly support your team's core priorities.
• Current Status: Foundational deliverables and review materials are ready for inspection.
• Target Goal: Seamless execution with zero downtime and top-tier efficiency.

What's Next?
Let's coordinate a brief 10–15 minute check-in later this week to walk through any questions. Alternatively, feel free to reply with any initial notes or feedback at your convenience.

Thanks so much, and looking forward to our discussion!`;
  } else if (tone === 'Formal') {
    bodyContent = `I am writing to formally communicate regarding ${cleanSubject}.

Please be advised that we have compiled the relevant assessments and strategic considerations pertinent to this initiative for your review.

Executive Summary & Key Scope:
• Compliance & Governance: Strict adherence to all established quality and operational benchmarks.
• Deliverables & Review: Comprehensive documentation prepared for stakeholder verification.
• Timeline & Next Phase: Projected execution timeline structured to meet all required deadlines.

Recommended Course of Action:
1. Formal review of the specifications and outlined criteria.
2. Submission of any required administrative feedback or amendments.
3. Scheduling an executive briefing for final authorization and sign-off.

Should you require any supplementary documentation or further clarification, please do not hesitate to contact our team.`;
  } else if (tone === 'Concise') {
    bodyContent = `Regarding ${cleanSubject}:

Executive Summary:
• Status: All deliverables are on schedule and prepared for review.
• Key Objectives: Focus on efficient execution and immediate milestone delivery.
• Action Required: Please review the attached points and confirm approval to proceed.

Please let me know if you have any questions or require additional details.`;
  } else {
    // Professional Default
    bodyContent = `I hope this email finds you well.

I am writing to you regarding ${cleanSubject}. As part of our ongoing commitment to delivering high-impact results, we have outlined the strategic overview, current deliverables, and next milestones below.

Key Highlights & Deliverables:
• Project Scope: Focused execution aligned with your primary business objectives.
• Quality & Performance: All deliverables are structured to ensure optimal reliability and scalability.
• Timeline & Status: Progress is on track for upcoming review milestones.

Proposed Next Steps:
1. Review the details outlined above and confirm alignment with your team's goals.
2. Share any specific feedback, questions, or modifications required.
3. Confirm availability for a brief 15-minute sync this week to finalize the roadmap.

Please let me know if you need any additional information in the meantime. We greatly appreciate your partnership and look forward to hearing from you.`;
  }

  if (customInstructions) {
    bodyContent += `\n\nAdditional Notes: ${customInstructions}`;
  }

  const greeting = greetings[tone] || greetings.Professional;
  const closing = closings[tone] || closings.Professional;
  return {
    body: `${greeting}\n\n${bodyContent}\n\n${closing}`,
    keyPoints: [cleanSubject, 'Deliverables & Next Steps', 'Review & Action Items'],
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
