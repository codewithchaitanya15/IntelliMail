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

    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
    for (const modelName of candidateModels) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        const text = result.response.text();
        return JSON.parse(text);
      } catch (err) {
        if (modelName === candidateModels[candidateModels.length - 1]) throw err;
      }
    }
  },

  async generateText(systemPrompt, userPrompt) {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('GEMINI_KEY_MISSING');
    }

    const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
    for (const modelName of candidateModels) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.6,
          },
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        return result.response.text().trim();
      } catch (err) {
        if (modelName === candidateModels[candidateModels.length - 1]) throw err;
      }
    }
  },
};
