import { addAIJob, registerMemoryJobHandler } from './aiQueue.js';

export const addEmailSyncJob = async (userId, data = {}) => {
  return addAIJob('sync_emails', { userId, ...data });
};

export const addBulkClassifyJob = async (userId, emails = []) => {
  return addAIJob('bulk_classify', { userId, emails });
};

export { registerMemoryJobHandler };
