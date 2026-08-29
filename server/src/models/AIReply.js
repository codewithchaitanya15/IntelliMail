import mongoose from 'mongoose';

const inMemoryReplies = [];

const aiReplySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailId: {
      type: String,
      required: true,
      index: true,
    },
    generatedReply: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      enum: ['Professional', 'Friendly', 'Formal', 'Concise', 'Custom'],
      default: 'Professional',
    },
    model: {
      type: String,
      default: 'auto',
    },
    prompt: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAIReply = mongoose.model('AIReply', aiReplySchema);

export const AIReply = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAIReply.create(data);
    }
    const id = `rep_${Date.now()}`;
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
    };
    inMemoryReplies.unshift(doc);
    return doc;
  },

  find(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAIReply.find(query);
    }
    const matches = inMemoryReplies.filter(
      (r) => r.userId?.toString() === query.userId?.toString() && r.emailId === query.emailId
    );
    return {
      sort() {
        return matches;
      },
      then(resolve) {
        resolve(matches);
      },
    };
  },
};
