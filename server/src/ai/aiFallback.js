/**
 * Deterministic NLP & Rule-Based Fallback Engine
 * Used when neither OpenAI nor Gemini API keys are configured.
 */

export const AIFallbackService = {
  summarize(email) {
    const text = (email.body || email.snippet || '').trim();
    const subject = email.subject || '';
    const sender = email.sender || email.from || 'Sender';
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // Extract bullet points or sentences
    const sentences = text
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    const importantPoints = sentences.slice(0, 3).length > 0
      ? sentences.slice(0, 3)
      : [
          `Communication regarding "${subject}"`,
          `Sent from ${sender}`,
          'Please review the full details in the email body.',
        ];

    // Extract dates
    const dateRegex = /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}\/\d{1,2}\/\d{2,4})\b[^\n,.]*/gi;
    const dateMatches = text.match(dateRegex) || [];
    const dates = dateMatches.slice(0, 3).map((d) => ({
      title: 'Referenced Milestone / Date',
      date: d.trim(),
      time: d.includes('AM') || d.includes('PM') ? 'As stated' : 'All day',
    }));

    // Extract action items
    const actionKeywords = ['please', 'need to', 'submit', 'review', 'confirm', 'attend', 'send', 'schedule'];
    const actionItems = [];
    lines.forEach((line) => {
      if (actionKeywords.some((kw) => line.toLowerCase().includes(kw))) {
        actionItems.push(line.replace(/^[0-9\-\*\.]+\s*/, ''));
      }
    });

    if (actionItems.length === 0) {
      actionItems.push(`Review content of "${subject}" and follow up if needed.`);
    }

    return {
      summary: sentences[0] || `Email regarding ${subject} from ${sender}.`,
      importantPoints,
      purpose: subject.includes('?') ? 'Inquiry and request for information' : `Discussion regarding ${subject}`,
      dates,
      people: [sender.split('<')[0].trim()],
      actionItems: actionItems.slice(0, 4),
      model: 'fallback-deterministic-nlp',
    };
  },

  generateReply(email, tone = 'Professional', customInstructions = '') {
    const senderName = (email.sender || email.from || 'there').split('<')[0].replace(/["']/g, '').trim();
    const subject = email.subject || '';

    const greetings = {
      Professional: `Dear ${senderName},`,
      Friendly: `Hi ${senderName}!`,
      Formal: `Dear ${senderName},`,
      Concise: `Hi ${senderName},`,
      Custom: `Hello ${senderName},`,
    };

    const closings = {
      Professional: 'Best regards,\n[Your Name]',
      Friendly: 'Warm regards,\n[Your Name]',
      Formal: 'Sincerely,\n[Your Name]',
      Concise: 'Thanks,\n[Your Name]',
      Custom: 'Best,\n[Your Name]',
    };

    let bodyCore = '';
    if (tone === 'Concise') {
      bodyCore = `Thank you for reaching out regarding "${subject}".\n\nI have reviewed your message and can confirm that I am aligned with these details. I will proceed with the necessary next steps shortly.`;
    } else if (tone === 'Friendly') {
      bodyCore = `Thanks so much for getting in touch about "${subject}"!\n\nI'm happy to help with this and will make sure to get on it right away. Let me know if there's anything else you need from my end in the meantime.`;
    } else if (tone === 'Formal') {
      bodyCore = `Thank you for your correspondence concerning "${subject}".\n\nI have carefully noted the contents of your message. Please be assured that this matter is receiving our full attention, and we will follow up with formal confirmation promptly.`;
    } else {
      // Professional default
      bodyCore = `Thank you for your email regarding "${subject}".\n\nI have reviewed the information provided. Everything looks clear on my end, and I will follow up with any deliverables as discussed. Please let me know if you have any questions in the meantime.`;
    }

    if (customInstructions) {
      bodyCore += `\n\nNote: ${customInstructions}`;
    }

    const greeting = greetings[tone] || greetings.Professional;
    const closing = closings[tone] || closings.Professional;

    return `${greeting}\n\n${bodyCore}\n\n${closing}`;
  },

  classify(email) {
    const text = `${email.subject || ''} ${email.body || email.snippet || ''} ${email.sender || ''}`.toLowerCase();

    let category = 'Work';
    let confidence = 0.88;
    let explanation = 'Identified work-related terminology and project collaboration context.';

    if (text.includes('invoice') || text.includes('payment') || text.includes('billing') || text.includes('receipt') || text.includes('usd') || text.includes('$')) {
      category = 'Finance';
      explanation = 'Contains billing, invoice, or monetary payment information.';
    } else if (text.includes('sale') || text.includes('discount') || text.includes('% off') || text.includes('order shipped') || text.includes('cart')) {
      category = 'Shopping';
      explanation = 'Contains shopping order, product offer, or retail promotion signals.';
    } else if (text.includes('security alert') || text.includes('urgent') || text.includes('action required') || text.includes('interview')) {
      category = 'Important';
      explanation = 'Contains critical alerts, immediate action items, or hiring communications.';
    } else if (text.includes('newsletter') || text.includes('weekly') || text.includes('spotify') || text.includes('playlist')) {
      category = 'Promotions';
      explanation = 'Automated promotional or marketing broadcast.';
    } else if (text.includes('course') || text.includes('assignment') || text.includes('grade') || text.includes('lecture')) {
      category = 'Education';
      explanation = 'Academic or educational coursework reference.';
    }

    return { category, confidence, explanation };
  },

  detectPriority(email) {
    const text = `${email.subject || ''} ${email.body || email.snippet || ''}`.toLowerCase();

    if (
      text.includes('urgent') ||
      text.includes('action required') ||
      text.includes('interview') ||
      text.includes('security alert') ||
      text.includes('deadline today') ||
      text.includes('asap')
    ) {
      return {
        priority: 'HIGH',
        score: 95,
        reason: 'High urgency detected: mentions urgent action items, security alerts, or interview milestones.',
      };
    }

    if (
      text.includes('review') ||
      text.includes('meeting') ||
      text.includes('feedback') ||
      text.includes('scheduled') ||
      text.includes('update')
    ) {
      return {
        priority: 'MEDIUM',
        score: 65,
        reason: 'Medium urgency: standard business collaboration or scheduled review requiring attention.',
      };
    }

    return {
      priority: 'LOW',
      score: 30,
      reason: 'Low urgency: informational newsletter, receipt, or automated notification.',
    };
  },

  explain(email) {
    const text = email.body || email.snippet || '';
    const subject = email.subject || '';

    return {
      simpleExplanation: `In simple terms, this email is about "${subject}". The sender is providing updates and requesting that you take a few clear steps before the stated deadline.`,
      importantInformation: [
        `Main topic: ${subject}`,
        'Contains key instructions and dates to keep track of.',
      ],
      requiredActions: [
        'Review the main points outlined in the message.',
        'Respond or acknowledge receipt if action is required.',
      ],
      deadlines: ['Check the dates mentioned in the body of the email.'],
      importantInstructions: [
        'Ensure you keep a copy for your records.',
        'Follow up if anything remains unclear.',
      ],
    };
  },

  extractActionItems(email) {
    const text = (email.body || email.snippet || '').trim();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const actionKeywords = ['please', 'need to', 'submit', 'review', 'confirm', 'attend', 'send', 'schedule', 'must', 'ensure'];
    
    const items = [];
    lines.forEach((line) => {
      if (actionKeywords.some((kw) => line.toLowerCase().includes(kw))) {
        items.push({
          task: line.replace(/^[0-9\-\*\.]+\s*/, ''),
          assignee: 'Recipient',
          due: line.toLowerCase().includes('by') ? 'See email text' : 'None specified',
          urgency: line.toLowerCase().includes('urgent') || line.toLowerCase().includes('friday') ? 'HIGH' : 'MEDIUM',
        });
      }
    });

    if (items.length === 0) {
      items.push({
        task: `Review "${email.subject || 'email'}" and provide requested response`,
        assignee: 'Recipient',
        due: 'None specified',
        urgency: 'MEDIUM',
      });
    }

    return { actionItems: items.slice(0, 5) };
  },

  extractDates(email) {
    const text = email.body || email.snippet || '';
    const dateRegex = /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}\/\d{1,2}\/\d{2,4})\b[^\n,.]*/gi;
    const matches = text.match(dateRegex) || [];

    const dates = matches.slice(0, 4).map((d) => ({
      title: 'Key Timeline Event',
      date: d.trim(),
      time: d.includes('AM') || d.includes('PM') ? 'As specified' : 'All day',
      type: d.toLowerCase().includes('review') || d.toLowerCase().includes('meeting') ? 'meeting' : 'deadline',
    }));

    return { dates };
  },

  generateSubject(body) {
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
  },

  improveEmail(body, tone = 'Professional') {
    const text = (body || '').trim();
    if (!text) {
      return {
        improvedBody: '',
        changesMade: ['No content to polish'],
        wordCount: 0,
      };
    }

    // Capitalize first letters and format basic sentence structure
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
  },

  smartSearch(query) {
    const q = query.toLowerCase();
    let gmailQuery = query;
    let category = null;

    if (q.includes('from ') || q.includes('sent by ')) {
      const match = query.match(/(?:from|sent by)\s+([a-zA-Z0-9_\.@]+)/i);
      if (match) gmailQuery = `from:${match[1]}`;
    }
    if (q.includes('attachment') || q.includes('file') || q.includes('pdf')) {
      gmailQuery += ' has:attachment';
    }
    if (q.includes('finance') || q.includes('invoice') || q.includes('receipt')) {
      category = 'Finance';
    }

    return {
      gmailQuery,
      keywords: query.split(/\s+/).filter((w) => w.length > 3),
      category,
      explanation: `Interpreted "${query}" as search query filter: ${gmailQuery}`,
    };
  },

  draftEmail({ subject, tone = 'Professional', customInstructions = '', to = '' }) {
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
    const fullBody = `${greeting}\n\n${bodyContent}\n\n${closing}`;

    return {
      body: fullBody,
      keyPoints: [cleanSubject, 'Deliverables & Next Steps', 'Review & Action Items'],
      model: 'fallback-deterministic-nlp',
    };
  },
};
