import OpenAI from 'openai';
import { config } from '../config/env.js';

let openaiClient = null;

const getOpenAIClient = () => {
  if (!config.openaiApiKey) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
};

export const OpenAIService = {
  isAvailable() {
    return !!config.openaiApiKey;
  },

  async generateJSON(systemPrompt, userPrompt, model = 'gpt-4o-mini') {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OPENAI_KEY_MISSING');
    }

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  },

  async generateText(systemPrompt, userPrompt, model = 'gpt-4o-mini') {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OPENAI_KEY_MISSING');
    }

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  },
};
