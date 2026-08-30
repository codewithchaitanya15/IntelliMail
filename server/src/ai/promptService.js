/**
 * Centralized Prompt Engineering Service for Email AI Operations
 */

export const PromptService = {
  getSummarizePrompt(email) {
    return {
      system: `You are an expert executive email assistant. Analyze the provided email and extract a structured JSON summary.
Return ONLY valid JSON matching this exact structure:
{
  "summary": "1-2 sentence executive summary of the email",
  "importantPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "purpose": "Main objective or purpose of this email",
  "dates": [
    { "title": "Description of deadline or event", "date": "Date string", "time": "Time string if mentioned" }
  ],
  "people": ["Names of people mentioned or involved"],
  "actionItems": ["Task or action 1", "Task or action 2"]
}`,
      user: `From: ${email.sender || email.from || 'Unknown'}
Subject: ${email.subject || '(No Subject)'}
Date: ${email.date || ''}
Content:
${email.body || email.snippet || ''}`,
    };
  },

  getReplyPrompt(email, tone = 'Professional', customInstructions = '') {
    return {
      system: `You are an AI email assistant drafting a reply on behalf of the user.
The tone requested is: ${tone}.
${customInstructions ? `Additional user instructions: ${customInstructions}` : ''}
Instructions:
- Address the sender appropriately.
- Respond directly to all questions or points raised in the original message.
- Keep the format clean, well-spaced, and ready to send.
- Return ONLY the draft reply text without quotation marks or explanations.`,
      user: `Original Email:
From: ${email.sender || email.from}
Subject: ${email.subject}
Content:
${email.body || email.snippet}`,
    };
  },

  getClassifyPrompt(email) {
    return {
      system: `You are an intelligent email classifier. Classify the email into exactly ONE of these categories:
["Work", "Personal", "Education", "Finance", "Shopping", "Social", "Promotions", "Important"]
Return ONLY valid JSON matching:
{
  "category": "CategoryName",
  "confidence": 0.95,
  "explanation": "Brief reason for classification"
}`,
      user: `From: ${email.sender || email.from}
Subject: ${email.subject}
Content:
${email.body || email.snippet}`,
    };
  },

  getPriorityPrompt(email) {
    return {
      system: `You are an AI priority detector for an email inbox. Analyze urgency, sender importance, deadlines, and action requirement.
Assign priority level as one of: ["HIGH", "MEDIUM", "LOW"].
Return ONLY valid JSON matching:
{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "score": 1-100,
  "reason": "Clear 1-sentence reason why this priority was assigned"
}`,
      user: `From: ${email.sender || email.from}
Subject: ${email.subject}
Content:
${email.body || email.snippet}`,
    };
  },

  getExplainPrompt(email) {
    return {
      system: `You are an assistant that simplifies complex, technical, or legal emails into crystal clear, simple English for a general reader.
Return ONLY valid JSON matching:
{
  "simpleExplanation": "Clear, friendly, non-jargon explanation of what this email actually means in simple terms",
  "importantInformation": ["Key point 1", "Key point 2"],
  "requiredActions": ["What the recipient specifically needs to do next"],
  "deadlines": ["Any deadlines or time-sensitive items"],
  "importantInstructions": ["Crucial cautions, attachments needed, or instructions"]
}`,
      user: `Subject: ${email.subject}
Content:
${email.body || email.snippet}`,
    };
  },

  getActionItemsPrompt(email) {
    return {
      system: `Extract all explicit and implicit action items, todo tasks, and requests from the email.
Return ONLY valid JSON matching:
{
  "actionItems": [
    {
      "task": "Specific actionable task",
      "assignee": "Who is responsible (e.g., 'Recipient' or name)",
      "due": "Due date if mentioned or 'None specified'",
      "urgency": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`,
      user: `Subject: ${email.subject}
Content:
${email.body || email.snippet}`,
    };
  },

  getExtractDatesPrompt(email) {
    return {
      system: `Extract all dates, deadlines, scheduled meetings, and time-sensitive milestones from the email.
Return ONLY valid JSON matching:
{
  "dates": [
    {
      "title": "What is happening or due",
      "date": "Extracted or inferred date",
      "time": "Time if specified",
      "type": "deadline" | "meeting" | "event" | "milestone"
    }
  ]
}`,
      user: `Subject: ${email.subject}
Content:
${email.body || email.snippet}`,
    };
  },

  getGenerateSubjectPrompt(emailBody) {
    return {
      system: `Generate 3 concise, compelling, and professional email subject lines based on the email body content.
Return ONLY valid JSON matching:
{
  "subjects": ["Subject Option 1", "Subject Option 2", "Subject Option 3"]
}`,
      user: `Email Body:
${emailBody}`,
    };
  },

  getImproveEmailPrompt(body, tone = 'Professional', goal = 'grammar_and_clarity') {
    return {
      system: `You are an expert email editor. Improve the draft email according to requested tone: ${tone}.
Fix grammar, enhance vocabulary, improve flow, and make it crisp and impactful.
Return ONLY valid JSON matching:
{
  "improvedBody": "The polished email text",
  "changesMade": ["Summary of enhancement 1", "Summary of enhancement 2"],
  "wordCount": 120
}`,
      user: `Draft email content:
${body}`,
    };
  },

  getSmartSearchPrompt(userQuery) {
    return {
      system: `You are a search query interpreter that translates natural language email search requests into Gmail search operators.
Return ONLY valid JSON matching:
{
  "gmailQuery": "e.g. from:sarah has:attachment after:2026/08/01",
  "keywords": ["keyword1", "keyword2"],
  "category": "Work" | "Finance" | null,
  "explanation": "Brief explanation of how the query was interpreted"
}`,
      user: `User search request: "${userQuery}"`,
    };
  },

  getDraftEmailPrompt({ subject, tone = 'Professional', customInstructions = '', to = '' }) {
    return {
      system: `You are an elite executive AI email copywriter and client communications strategist.
Your task is to compose a comprehensive, thoroughly detailed, beautifully formatted, ready-to-send business email for a client or stakeholder based on the provided subject.

The requested tone is: ${tone} (Options: Professional, Friendly, Formal, Concise).
${customInstructions ? `Special Instructions / Context: ${customInstructions}` : ''}
${to ? `Recipient Email / Name: ${to}` : ''}

Mandatory Email Structure & Formatting Requirements:
1. Salutation: Professional & tailored (e.g., "Dear [Client Name/Team],")
2. Engaging Opening Hook: Friendly, polite opening that immediately sets context.
3. Core Context & Value: In-depth, well-articulated paragraphs explaining the background and purpose of the email topic.
4. Structured Breakdown (Use Clean Bullet Points or Numbered List):
   - Provide a section with bullet points highlighting key deliverables, objectives, status updates, or action items (e.g., "Key Highlights & Scope:", "Action Items:", "Milestones & Timeline:").
5. Clear Call to Action (CTA) & Next Steps: Clear, polite instructions on what is needed next (e.g. feedback, review, scheduling a brief sync).
6. Closing & Professional Signature Block: Warm, courteous closing with name, title, and organization placeholders.

Return ONLY valid JSON matching this exact structure:
{
  "body": "The complete, formatted email body text including salutation, body paragraphs, bullet points, next steps, and sign-off",
  "keyPoints": ["Highlight 1", "Highlight 2", "Highlight 3"]
}`,
      user: `Email Subject: ${subject}
${customInstructions ? `Additional details: ${customInstructions}` : ''}`,
    };
  },
};
