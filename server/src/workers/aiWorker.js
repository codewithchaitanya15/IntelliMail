import { registerMemoryJobHandler } from '../queues/aiQueue.js';
import { AIService } from '../services/aiService.js';
import { NotificationService } from '../services/notificationService.js';
import { emitToUser } from '../config/socket.js';

export const processAIJob = async (job) => {
  const { name, data } = job;
  console.log(`[AI Worker] Processing job: ${name}`, data);

  try {
    if (name === 'bulk_classify') {
      const { userId, emails } = data;
      const results = [];
      for (const email of emails) {
        const classification = await AIService.classifyEmail({ email, userId });
        const priority = await AIService.detectPriority({ email });
        results.push({ emailId: email.id, classification, priority });
      }

      emitToUser(userId, 'BULK_PROCESSING_COMPLETED', {
        type: 'CLASSIFICATION',
        total: emails.length,
        results,
      });

      await NotificationService.createNotification({
        userId,
        type: 'ai_completed',
        title: 'AI Processing Complete',
        message: `Processed and prioritized ${emails.length} inbox emails.`,
      });
    }
  } catch (error) {
    console.error(`[AI Worker] Failed to process job ${name}:`, error.message);
  }
};

// Register handler for in-memory runner fallback
registerMemoryJobHandler('bulk_classify', processAIJob);
registerMemoryJobHandler('sync_emails', processAIJob);
