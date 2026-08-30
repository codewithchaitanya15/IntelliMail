import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

let genAI = null;

const getGeminiClient = () => {
  if (!config.geminiApiKey) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
};

export const GeminiService = {
  isAvailable() {
    return !!config.geminiApiKey;
  },

  async generateJSON(systemPrompt, userPrompt) {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('GEMINI_KEY_MISSING');
    }

    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-pro'];
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.3,
          },
        });

        const fullPrompt = `${systemPrompt ? `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\n` : ''}USER INPUT:\n${userPrompt}\n\nIMPORTANT: Return valid JSON ONLY.`;
        const result = await model.generateContent(fullPrompt);
        let text = result.response.text().trim();

        // Strip markdown code fences like ```json ... ``` or ``` ... ```
        if (text.startsWith('```')) {
          text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }

        try {
          return JSON.parse(text);
        } catch (jsonErr) {
          // If JSON parse fails, return the generated text as the body
          return {
            body: text,
            keyPoints: [],
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini models failed');
  },

  async generateText(systemPrompt, userPrompt) {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('GEMINI_KEY_MISSING');
    }

    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-pro'];
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.6,
          },
        });

        const fullPrompt = `${systemPrompt ? `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\n` : ''}USER INPUT:\n${userPrompt}`;
        const result = await model.generateContent(fullPrompt);
        return result.response.text().trim();
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini models failed');
  },
};
