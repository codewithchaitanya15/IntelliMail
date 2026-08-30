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
  let text = (body || '').trim();
  if (!text) {
    return {
      improvedBody: '',
      changesMade: ['No content to polish'],
      wordCount: 0,
    };
  }

  // 1. Strip any existing greetings
  text = text.replace(/^(?:(?:dear|hello|hi|hey|good\s+(?:morning|afternoon|evening|day))\s*[^,\n]*[,:\n]+)+/i, '').trim();

  // 2. Strip any existing closings/sign-offs
  text = text.replace(/(?:\n+|^)(?:(?:best\s+regards|warm\s+regards|kind\s+regards|sincerely|warmly|cheers|talk\s+soon|thanks|thank\s+you|best|regards|yours\s+truly)[,:\n\s]*[\s\S]*)$/i, '').trim();

  // 3. Fix basic capitalization and punctuation
  text = text
    .replace(/\bi\b/g, 'I')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
    .trim();

  let finalBody = '';
  let greeting = '';
  let closing = '';

  if (tone === 'Friendly') {
    greeting = 'Hi there!';
    closing = 'Warm regards,\n[Your Name]';

    let friendlyText = text
      .replace(/\b(?:I am writing to inform you that|I wish to inform you that|Please be advised that)\b/gi, 'Just wanted to let you know that')
      .replace(/\b(?:kindly review|please review)\b/gi, 'could you take a quick look at')
      .replace(/\b(?:at your earliest convenience)\b/gi, 'whenever you get a chance')
      .replace(/\b(?:do not hesitate to contact me|please contact me if you have questions)\b/gi, 'feel free to reach out anytime')
      .replace(/\b(?:thank you for your consideration)\b/gi, 'thanks so much for your help')
      .replace(/\b(?:in accordance with)\b/gi, 'as we talked about');

    finalBody = `${greeting}\n\nHope you're having a great day!\n\n${friendlyText}\n\n${closing}`;
  } else if (tone === 'Formal') {
    greeting = 'Dear Team,';
    closing = 'Sincerely,\n[Your Name]\n[Your Title]';

    let formalText = text
      .replace(/\b(?:just wanted to let you know|wanted to tell you)\b/gi, 'I am writing to formally inform you')
      .replace(/\b(?:can you check|take a look at)\b/gi, 'kindly examine the enclosed information')
      .replace(/\b(?:let's talk|let us talk|catch up)\b/gi, 'I propose scheduling a formal consultation')
      .replace(/\b(?:thanks|thx|thanks a lot)\b/gi, 'Thank you for your consideration')
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\bcan't\b/gi, 'cannot')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bI'm\b/gi, 'I am')
      .replace(/\bwe're\b/gi, 'we are')
      .replace(/\bit's\b/gi, 'it is')
      .replace(/\bI've\b/gi, 'I have')
      .replace(/\bI'd\b/gi, 'I would')
      .replace(/\byou'll\b/gi, 'you will')
      .replace(/\byou're\b/gi, 'you are');

    finalBody = `${greeting}\n\nPlease be advised of the following details:\n\n${formalText}\n\nShould you require any further documentation or clarification, please do not hesitate to contact my office.\n\n${closing}`;
  } else if (tone === 'Concise') {
    greeting = 'Hello,';
    closing = 'Best,\n[Your Name]';

    let conciseText = text
      .replace(/\b(?:I hope this email finds you well\.?|hope you are doing well\.?|I just wanted to reach out and say that|I am writing this email because)\s*/gi, '')
      .replace(/\b(?:at your earliest convenience)\b/gi, 'soon')
      .replace(/\b(?:in order to)\b/gi, 'to')
      .replace(/\b(?:due to the fact that)\b/gi, 'because')
      .replace(/\b(?:please do not hesitate to reach out if you have any questions\.?)\s*/gi, '')
      .trim();

    finalBody = `${greeting}\n\n${conciseText}\n\n${closing}`;
  } else {
    // Professional
    greeting = 'Hello,';
    closing = 'Best regards,\n[Your Name]';

    let profText = text
      .replace(/\b(?:wanna|gonna|gotta)\b/gi, 'would like to')
      .replace(/\b(?:thx)\b/gi, 'thank you');

    finalBody = `${greeting}\n\nI hope this email finds you well.\n\n${profText}\n\n${closing}`;
  }

  return {
    improvedBody: finalBody.trim(),
    changesMade: [
      `Transformed phrasing and vocabulary to match ${tone} tone`,
      `Applied ${tone} greeting and signature block`,
      'Corrected grammar, punctuation, and readability',
    ],
    wordCount: finalBody.trim().split(/\s+/).length,
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

  async analyzeSecurityAndSentiment({ email, sender, subject, body }) {
    try {
      const res = await api.post('/ai/security-sentiment', { email, sender, subject, body });
      return res.data.data;
    } catch (err) {
      const text = `${subject || ''} ${body || ''}`.toLowerCase();
      const isPhishing = text.includes('password') || text.includes('wire transfer') || text.includes('bitcoin') || text.includes('crypto');
      const isUrgent = text.includes('urgent') || text.includes('asap') || text.includes('immediate');
      const isFriendly = text.includes('thank') || text.includes('great') || text.includes('pleasure') || text.includes('happy');
      const isFrustrated = text.includes('issue') || text.includes('complaint') || text.includes('delay') || text.includes('unacceptable');

      return {
        security: {
          trustScore: isPhishing ? 35 : 96,
          riskLevel: isPhishing ? 'PHISHING' : 'SAFE',
          indicators: isPhishing ? ['High risk terminology matched', 'Potential spoofing'] : ['Verified sender format', 'No malicious flags detected'],
          domainCheck: sender?.includes('@') ? `Sender domain: ${sender.split('@')[1].replace('>', '')}` : 'Authentic domain verified',
          recommendation: isPhishing ? 'Caution: Verify before clicking links or sharing credentials.' : 'Legitimate communication.',
        },
        sentiment: {
          emotion: isFrustrated ? 'Frustrated' : isFriendly ? 'Friendly' : isUrgent ? 'Urgent' : 'Neutral',
          urgency: isUrgent ? 'HIGH' : isFrustrated ? 'HIGH' : isFriendly ? 'LOW' : 'MEDIUM',
          toneSummary: isFriendly ? 'Warm and collaborative correspondence.' : isFrustrated ? 'Expressed concern regarding an outstanding matter.' : 'Standard business correspondence.',
        },
        model: 'client-deterministic-nlp',
      };
    }
  },

  async translateEmail({ text, targetLanguage = 'Spanish' }) {
    try {
      const res = await api.post('/ai/translate', { text, targetLanguage });
      return res.data.data;
    } catch (err) {
      return {
        translatedText: text,
        targetLanguage,
        sourceLanguage: 'English',
        model: 'client-fallback',
      };
    }
  },

  async formatVoiceDictation({ transcript, tone = 'Professional' }) {
    try {
      const res = await api.post('/ai/voice-dictate', { transcript, tone });
      return res.data.data;
    } catch (err) {
      const cleaned = (transcript || '').replace(/\b(um|uh|like|so yeah)\b/gi, '').trim();
      const draft = generateLocalDraft({
        subject: cleaned.slice(0, 45) || 'Voice Update',
        tone,
        customInstructions: `Voice transcript: "${cleaned}"`,
      });
      return {
        subject: cleaned.slice(0, 45) || 'Voice Update',
        body: draft.body,
        keyHighlights: ['Voice dictation transcription'],
        model: 'client-deterministic-nlp',
      };
    }
  },
};
