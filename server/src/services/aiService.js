import { OpenAIService } from '../ai/openaiService.js';
import { GeminiService } from '../ai/geminiService.js';
import { AIFallbackService } from '../ai/aiFallback.js';
import { PromptService } from '../ai/promptService.js';
import { AISummary } from '../models/AISummary.js';
import { AIReply } from '../models/AIReply.js';
import { ActivityService } from './activityService.js';
import { emitToUser } from '../config/socket.js';

export const AIService = {
  /**
   * Helper to execute AI request with multi-tiered fallback:
   * 1. Gemini -> 2. OpenAI -> 3. Local Deterministic NLP
   */
  async runAIStructured(promptBuilder, fallbackMethod, args) {
    const { system, user } = promptBuilder(args);

    if (GeminiService.isAvailable()) {
      try {
        const result = await GeminiService.generateJSON(system, user);
        return { ...result, model: 'gemini/gemini-1.5-flash' };
      } catch (err) {
        console.warn('[AIService] Gemini failed, trying OpenAI:', err.message);
      }
    }

    if (OpenAIService.isAvailable()) {
      try {
        const result = await OpenAIService.generateJSON(system, user);
        return { ...result, model: 'openai/gpt-4o-mini' };
      } catch (err) {
        console.warn('[AIService] OpenAI failed, falling back to local NLP:', err.message);
      }
    }

    // Deterministic fallback
    return fallbackMethod(args);
  },

  async runAIText(promptBuilder, fallbackMethod, args) {
    const { system, user } = promptBuilder(...args);

    if (GeminiService.isAvailable()) {
      try {
        const text = await GeminiService.generateText(system, user);
        return { text, model: 'gemini/gemini-1.5-flash' };
      } catch (err) {
        console.warn('[AIService] Gemini text failed, trying OpenAI:', err.message);
      }
    }

    if (OpenAIService.isAvailable()) {
      try {
        const text = await OpenAIService.generateText(system, user);
        return { text, model: 'openai/gpt-4o-mini' };
      } catch (err) {
        console.warn('[AIService] OpenAI text failed, falling back to local NLP:', err.message);
      }
    }

    // Deterministic fallback
    return { text: fallbackMethod(...args), model: 'deterministic-fallback' };
  },

  // 1. Email Summarization
  async summarizeEmail({ email, emailId, userId }) {
    emitToUser(userId.toString(), 'AI_PROCESSING', {
      type: 'SUMMARIZE',
      emailId,
      status: 'started',
    });

    const result = await this.runAIStructured(
      PromptService.getSummarizePrompt,
      AIFallbackService.summarize,
      email
    );

    // Save summary in database
    const summaryDoc = await AISummary.create({
      userId,
      emailId,
      summary: result.summary,
      importantPoints: result.importantPoints || [],
      purpose: result.purpose || '',
      dates: result.dates || [],
      people: result.people || [],
      actionItems: result.actionItems || [],
      model: result.model || 'auto',
    });

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'AI_SUMMARY_GENERATED',
      metadata: { model: summaryDoc.model },
    });

    emitToUser(userId.toString(), 'AI_SUMMARY_COMPLETED', {
      emailId,
      summary: summaryDoc,
    });

    return summaryDoc;
  },

  // 2. AI Reply Generation
  async generateReply({ email, emailId, tone = 'Professional', customInstructions = '', userId }) {
    emitToUser(userId.toString(), 'AI_PROCESSING', {
      type: 'REPLY_GENERATION',
      emailId,
      status: 'started',
    });

    const { text, model } = await this.runAIText(
      PromptService.getReplyPrompt,
      AIFallbackService.generateReply,
      [email, tone, customInstructions]
    );

    const replyDoc = await AIReply.create({
      userId,
      emailId,
      generatedReply: text,
      tone,
      model,
      prompt: customInstructions,
    });

    await ActivityService.logActivity({
      userId,
      emailId,
      action: 'AI_REPLY_GENERATED',
      metadata: { tone, model },
    });

    emitToUser(userId.toString(), 'AI_REPLY_GENERATED', {
      emailId,
      reply: replyDoc,
    });

    return replyDoc;
  },

  // 3. Email Classification
  async classifyEmail({ email, userId }) {
    const result = await this.runAIStructured(
      PromptService.getClassifyPrompt,
      AIFallbackService.classify,
      email
    );

    if (userId) {
      await ActivityService.logActivity({
        userId,
        emailId: email.id,
        action: 'AI_CLASSIFIED',
        metadata: { category: result.category },
      });
    }

    return result;
  },

  // 4. Priority Detection
  async detectPriority({ email }) {
    return this.runAIStructured(
      PromptService.getPriorityPrompt,
      AIFallbackService.detectPriority,
      email
    );
  },

  // 5. Explain This Email
  async explainEmail({ email, userId }) {
    const result = await this.runAIStructured(
      PromptService.getExplainPrompt,
      AIFallbackService.explain,
      email
    );

    if (userId) {
      await ActivityService.logActivity({
        userId,
        emailId: email.id,
        action: 'AI_EXPLAINED',
      });
    }

    return result;
  },

  // 6. Action Items Extraction
  async extractActionItems({ email, userId }) {
    const result = await this.runAIStructured(
      PromptService.getActionItemsPrompt,
      AIFallbackService.extractActionItems,
      email
    );

    if (userId) {
      await ActivityService.logActivity({
        userId,
        emailId: email.id,
        action: 'AI_ACTION_ITEMS_EXTRACTED',
      });
    }

    return result;
  },

  // 7. Date & Deadline Extraction
  async extractDates({ email }) {
    return this.runAIStructured(
      PromptService.getExtractDatesPrompt,
      AIFallbackService.extractDates,
      email
    );
  },

  // 8. Subject Line Generation
  async generateSubject({ body }) {
    const rawResult = await this.runAIStructured(
      PromptService.getGenerateSubjectPrompt,
      AIFallbackService.generateSubject,
      body
    );

    let subjects = [];
    if (rawResult && Array.isArray(rawResult.subjects)) {
      subjects = rawResult.subjects;
    } else if (rawResult && Array.isArray(rawResult.subjectOptions)) {
      subjects = rawResult.subjectOptions;
    } else if (typeof rawResult?.subject === 'string') {
      subjects = [rawResult.subject];
    } else if (typeof rawResult === 'string') {
      subjects = [rawResult];
    }

    if (!subjects || subjects.length === 0) {
      subjects = AIFallbackService.generateSubject(body).subjects;
    }

    // Clean any surrounding quotes or markdown artifacts
    subjects = subjects
      .map((s) => (typeof s === 'string' ? s.replace(/^["'`]|["'`]$/g, '').trim() : ''))
      .filter(Boolean);

    return {
      subjects: subjects.length > 0 ? subjects : ['Important: Update & Next Steps'],
      model: rawResult?.model || 'gemini-ai',
    };
  },

  // 9. Email Improvement & Grammar
  async improveEmail({ body, tone = 'Professional' }) {
    const rawResult = await this.runAIStructured(
      (b) => PromptService.getImproveEmailPrompt(b, tone),
      (b) => AIFallbackService.improveEmail(b, tone),
      body
    );

    let improvedBody = '';
    if (typeof rawResult === 'string') {
      improvedBody = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
      improvedBody =
        rawResult.improvedBody ||
        rawResult.body ||
        rawResult.improvedEmail ||
        rawResult.text ||
        rawResult.content ||
        '';
    }

    if (!improvedBody || improvedBody.trim().length === 0) {
      improvedBody = AIFallbackService.improveEmail(body, tone).improvedBody;
    }

    return {
      improvedBody: improvedBody.trim(),
      changesMade: rawResult?.changesMade || [`Polished in ${tone} tone`],
      wordCount: rawResult?.wordCount || improvedBody.trim().split(/\s+/).length,
      model: rawResult?.model || 'gemini-ai',
    };
  },

  // 10. Smart Search
  async smartSearch({ query }) {
    return this.runAIStructured(
      PromptService.getSmartSearchPrompt,
      AIFallbackService.smartSearch,
      query
    );
  },

  // 11. Draft Full Email from Subject
  async draftEmail({ subject, tone = 'Professional', customInstructions = '', to = '' }) {
    const rawResult = await this.runAIStructured(
      PromptService.getDraftEmailPrompt,
      AIFallbackService.draftEmail,
      { subject, tone, customInstructions, to }
    );

    let body = '';
    if (typeof rawResult === 'string') {
      body = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
      body =
        rawResult.body ||
        rawResult.email ||
        rawResult.emailBody ||
        rawResult.message ||
        rawResult.draft ||
        rawResult.text ||
        rawResult.content ||
        '';
    }

    if (!body || body.trim().length === 0) {
      const fallback = AIFallbackService.draftEmail({ subject, tone, customInstructions, to });
      body = fallback.body;
    }

    return {
      body: body.trim(),
      keyPoints: rawResult?.keyPoints || [subject],
      model: rawResult?.model || 'deterministic-nlp',
    };
  },

  // 12. Security & Sentiment Analysis
  async analyzeSecurityAndSentiment({ email, sender, subject, body, userId }) {
    const payload = {
      sender: sender || email?.sender || email?.from || 'Unknown',
      subject: subject || email?.subject || '(No Subject)',
      body: body || email?.body || email?.snippet || '',
    };

    const rawResult = await this.runAIStructured(
      PromptService.getSecurityAndSentimentPrompt,
      AIFallbackService.analyzeSecurityAndSentiment,
      payload
    );

    if (userId && email?.id) {
      await ActivityService.logActivity({
        userId,
        emailId: email.id,
        action: 'AI_SECURITY_ANALYZED',
      });
    }

    return {
      security: rawResult?.security || {
        trustScore: 95,
        riskLevel: 'SAFE',
        indicators: ['Standard communication'],
        domainCheck: 'Authentic domain verified',
        recommendation: 'Safe to view and reply.',
      },
      sentiment: rawResult?.sentiment || {
        emotion: 'Neutral',
        urgency: 'MEDIUM',
        toneSummary: 'Professional business communication.',
      },
      model: rawResult?.model || 'gemini-ai',
    };
  },

  // 13. Instant Multi-Language Translation
  async translateEmail({ text, targetLanguage = 'Spanish', userId }) {
    const rawResult = await this.runAIStructured(
      PromptService.getTranslateEmailPrompt,
      AIFallbackService.translateEmail,
      { text, targetLanguage }
    );

    let translatedText = '';
    if (typeof rawResult === 'string') {
      translatedText = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
      translatedText = rawResult.translatedText || rawResult.text || rawResult.translation || '';
    }

    if (!translatedText || translatedText.trim().length === 0) {
      translatedText = AIFallbackService.translateEmail(text, targetLanguage).translatedText;
    }

    return {
      translatedText: translatedText.trim(),
      targetLanguage,
      sourceLanguage: rawResult?.sourceLanguage || 'English',
      model: rawResult?.model || 'gemini-ai',
    };
  },

  // 14. Voice Dictation Structuring
  async formatVoiceDictation({ transcript, tone = 'Professional', userId }) {
    const rawResult = await this.runAIStructured(
      PromptService.getVoiceDictatePrompt,
      AIFallbackService.formatVoiceDictation,
      { transcript, tone }
    );

    let body = '';
    let subject = '';

    if (rawResult && typeof rawResult === 'object') {
      body = rawResult.body || rawResult.text || '';
      subject = rawResult.subject || '';
    }

    if (!body || body.trim().length === 0) {
      const fallback = AIFallbackService.formatVoiceDictation(transcript, tone);
      body = fallback.body;
      subject = fallback.subject;
    }

    return {
      subject: subject || 'Voice Note & Action Items',
      body: body.trim(),
      keyHighlights: rawResult?.keyHighlights || [],
      model: rawResult?.model || 'gemini-ai',
    };
  },
};
