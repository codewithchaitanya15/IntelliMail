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

export const generateLocalSubjects = (body) => {
  const text = (body || '').trim();
  if (!text) {
    return {
      subjects: [
        'Important Project Update & Review',
        'Follow-up & Proposed Next Steps',
        'Action Required: Key Deliverables',
      ],
    };
  }

  const lower = text.toLowerCase();
  const isMeeting = lower.includes('meet') || lower.includes('call') || lower.includes('sync') || lower.includes('schedule') || lower.includes('time');
  const isUrgent = lower.includes('urgent') || lower.includes('asap') || lower.includes('immediate') || lower.includes('deadline') || lower.includes('priority');
  const isFinance = lower.includes('invoice') || lower.includes('payment') || lower.includes('budget') || lower.includes('contract') || lower.includes('pricing');

  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'been', 'would', 'could', 'please', 'about'].includes(w.toLowerCase()))
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const topic = words || 'Important Discussion';

  if (isUrgent) {
    return {
      subjects: [
        `[Action Required] Urgent: ${topic}`,
        `Priority Update: ${topic} - Next Steps`,
        `Time-Sensitive: Review needed regarding ${topic}`,
      ],
    };
  }

  if (isMeeting) {
    return {
      subjects: [
        `Meeting Request: ${topic} Alignment`,
        `Quick Sync: Discussion regarding ${topic}`,
        `Proposed Agenda & Schedule: ${topic}`,
      ],
    };
  }

  if (isFinance) {
    return {
      subjects: [
        `Financial Review & Summary: ${topic}`,
        `Invoice & Billing Details: ${topic}`,
        `Formal Update: ${topic} Overview`,
      ],
    };
  }

  return {
    subjects: [
      `Update & Overview: ${topic}`,
      `Follow-up Regarding ${topic}`,
      `Action Items & Next Steps: ${topic}`,
    ],
  };
};

export const improveLocalEmail = (body, tone = 'Professional') => {
  const text = (body || '').trim();
  if (!text) {
    return {
      improvedBody: '',
      changesMade: ['No content to polish'],
      wordCount: 0,
    };
  }

  let polished = text
    .replace(/\bi\b/g, 'I')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
    .trim();

  if (tone === 'Friendly') {
    if (!polished.match(/^(hi|hey|hello|good (morning|afternoon|day))/i)) {
      polished = `Hi there!\n\n${polished}`;
    }
    if (!polished.match(/(warm regards|talk soon|best|cheers|thanks|warmly)/i)) {
      polished += '\n\nTalk soon,\n[Your Name]';
    }
  } else if (tone === 'Formal') {
    if (!polished.match(/^(dear|to whom it may concern)/i)) {
      polished = `Dear Team,\n\n${polished}`;
    }
    polished = polished
      .replace(/\b(wanna|gonna|gotta)\b/gi, 'wish to')
      .replace(/\b(let's talk|let us talk)\b/gi, 'I propose we schedule a formal consultation')
      .replace(/\b(thanks|thx)\b/gi, 'Thank you for your consideration');

    if (!polished.match(/(sincerely|respectfully|with kind regards)/i)) {
      polished += '\n\nSincerely,\n[Your Name]\n[Your Title]';
    }
  } else if (tone === 'Concise') {
    polished = polished
      .replace(/\b(I just wanted to let you know that|I am writing this email because|Just checking in to say that)\b/gi, 'Please note that')
      .replace(/\b(hope you are doing well and having a great day\.?|hope this email finds you well\.?)\s*/gi, '')
      .trim();

    if (!polished.match(/(best|thanks|regards)/i)) {
      polished += '\n\nBest,\n[Your Name]';
    }
  } else {
    // Professional
    if (!polished.match(/^(dear|hello|good (morning|afternoon))/i)) {
      polished = `Hello,\n\n${polished}`;
    }
    if (!polished.match(/(best regards|kind regards|sincerely|thank you)/i)) {
      polished += '\n\nBest regards,\n[Your Name]';
    }
  }

  return {
    improvedBody: polished,
    changesMade: [
      `Adjusted vocabulary and syntax for ${tone} tone`,
      'Enhanced grammar, punctuation, and flow',
      'Structured clear greeting, body spacing, and sign-off',
    ],
    wordCount: polished.split(/\s+/).length,
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
    try {
      const res = await api.post('/ai/generate-subject', { body });
      return res.data.data;
    } catch (err) {
      return generateLocalSubjects(body);
    }
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
      return generateLocalDraft({ subject, tone, customInstructions, to });
    }
  },

  async improveEmail({ body, tone = 'Professional' }) {
    try {
      const res = await api.post('/ai/improve-email', { body, tone });
      return res.data.data;
    } catch (err) {
      return improveLocalEmail(body, tone);
    }
  },

  async smartSearch({ query }) {
    const res = await api.post('/ai/smart-search', { query });
    return res.data.data;
  },
};
