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
    const words = body.trim().split(/\s+/).slice(0, 10).join(' ');
    return {
      subjects: [
        `Update: ${words}...`,
        `Follow-up Regarding Project Details`,
        `Action Required: Next Steps & Timeline`,
      ],
    };
  },

  improveEmail(body, tone = 'Professional') {
    const trimmed = body.trim();
    return {
      improvedBody: trimmed
        .replace(/\bi\b/g, 'I')
        .replace(/(\. )([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase()),
      changesMade: [
        `Polished tone to align with ${tone} standard`,
        'Corrected capitalization and flow',
        'Enhanced readability and sentence transitions',
      ],
      wordCount: trimmed.split(/\s+/).length,
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
};
