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
   * 1. OpenAI -> 2. Gemini -> 3. Local Deterministic NLP
   */
  async runAIStructured(promptBuilder, fallbackMethod, args) {
    const { system, user } = promptBuilder(args);

    if (OpenAIService.isAvailable()) {
      try {
        const result = await OpenAIService.generateJSON(system, user);
        return { ...result, model: 'openai/gpt-4o-mini' };
      } catch (err) {
        console.warn('[AIService] OpenAI failed, trying Gemini:', err.message);
      }
    }

    if (GeminiService.isAvailable()) {
      try {
        const result = await GeminiService.generateJSON(system, user);
        return { ...result, model: 'gemini/gemini-1.5-flash' };
      } catch (err) {
        console.warn('[AIService] Gemini failed, falling back to local NLP:', err.message);
      }
    }

    // Deterministic fallback
    return fallbackMethod(args);
  },

  async runAIText(promptBuilder, fallbackMethod, args) {
    const { system, user } = promptBuilder(...args);

    if (OpenAIService.isAvailable()) {
      try {
        const text = await OpenAIService.generateText(system, user);
        return { text, model: 'openai/gpt-4o-mini' };
      } catch (err) {
        console.warn('[AIService] OpenAI text failed, trying Gemini:', err.message);
      }
    }

    if (GeminiService.isAvailable()) {
      try {
        const text = await GeminiService.generateText(system, user);
        return { text, model: 'gemini/gemini-1.5-flash' };
      } catch (err) {
        console.warn('[AIService] Gemini text failed, falling back to local NLP:', err.message);
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
    return this.runAIStructured(
      PromptService.getGenerateSubjectPrompt,
      AIFallbackService.generateSubject,
      body
    );
  },

  // 9. Email Improvement & Grammar
  async improveEmail({ body, tone = 'Professional' }) {
    const { system, user } = PromptService.getImproveEmailPrompt(body, tone);

    if (OpenAIService.isAvailable()) {
      try {
        const result = await OpenAIService.generateJSON(system, user);
        return { ...result, model: 'openai/gpt-4o-mini' };
      } catch (err) {
        console.warn('[AIService] OpenAI improve error, falling back:', err.message);
      }
    }

    if (GeminiService.isAvailable()) {
      try {
        const result = await GeminiService.generateJSON(system, user);
        return { ...result, model: 'gemini/gemini-1.5-flash' };
      } catch (err) {
        console.warn('[AIService] Gemini improve error, falling back:', err.message);
      }
    }

    return AIFallbackService.improveEmail(body, tone);
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
};
