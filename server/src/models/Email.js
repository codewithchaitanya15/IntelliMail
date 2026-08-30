import mongoose from 'mongoose';

const inMemoryEmails = new Map();

const emailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
      index: true,
    },
    threadId: {
      type: String,
      default: '',
    },
    sender: {
      type: String,
      default: '',
    },
    from: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      default: '',
    },
    cc: {
      type: String,
      default: '',
    },
    bcc: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '(No Subject)',
    },
    snippet: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrash: {
      type: Boolean,
      default: false,
      index: true,
    },
    labels: {
      type: [String],
      default: ['INBOX'],
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    category: {
      type: String,
      default: 'Work',
    },
    actionItems: {
      type: [String],
      default: [],
    },
    dates: {
      type: [
        {
          title: String,
          date: String,
          time: String,
        },
      ],
      default: [],
    },
    attachments: {
      type: [
        {
          filename: String,
          mimeType: String,
          size: Number,
          attachmentId: String,
        },
      ],
      default: [],
    },
    aiSummary: {
      type: String,
      default: null,
    },
    aiReplies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

emailSchema.index({ userId: 1, id: 1 }, { unique: true });
emailSchema.index({ userId: 1, isTrash: 1 });
emailSchema.index({ userId: 1, isStarred: 1 });
emailSchema.index({ userId: 1, isArchived: 1 });

const MongooseEmail = mongoose.model('Email', emailSchema);

export const Email = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.create(data);
    }
    const key = `${data.userId}_${data.id}`;
    const doc = {
      _id: data.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryEmails.set(key, doc);
    return doc;
  },

  async insertMany(docs) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.insertMany(docs, { ordered: false });
    }
    docs.forEach((d) => {
      const key = `${d.userId}_${d.id}`;
      inMemoryEmails.set(key, { ...d, createdAt: new Date(), updatedAt: new Date() });
    });
    return docs;
  },

  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.find(query).sort({ date: -1 });
    }
    const userPrefix = query.userId?.toString();
    const results = [];
    for (const [key, doc] of inMemoryEmails.entries()) {
      if (userPrefix && !key.startsWith(userPrefix)) continue;
      let match = true;
      if (query.isTrash !== undefined && doc.isTrash !== query.isTrash) match = false;
      if (query.isStarred !== undefined && doc.isStarred !== query.isStarred) match = false;
      if (query.isArchived !== undefined && doc.isArchived !== query.isArchived) match = false;
      if (match) results.push(doc);
    }
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.findOne(query);
    }
    const userPrefix = query.userId?.toString();
    for (const [key, doc] of inMemoryEmails.entries()) {
      if (userPrefix && !key.startsWith(userPrefix)) continue;
      if (query.id && doc.id === query.id) return doc;
      if (query._id && (doc._id === query._id || doc.id === query._id)) return doc;
    }
    return null;
  },

  async updateOne(query, update) {
    if (mongoose.connection.readyState === 1) {
      const normalizedUpdate = {};
      const setFields = {};

      for (const [key, value] of Object.entries(update)) {
        if (key.startsWith('$')) {
          normalizedUpdate[key] = value;
        } else {
          setFields[key] = value;
        }
      }

      if (Object.keys(setFields).length > 0) {
        normalizedUpdate.$set = {
          ...(normalizedUpdate.$set || {}),
          ...setFields,
        };
      }

      return MongooseEmail.updateOne(query, normalizedUpdate);
    }

    const doc = await this.findOne(query);
    if (doc) {
      if (update.$set) Object.assign(doc, update.$set);
      for (const [k, v] of Object.entries(update)) {
        if (!k.startsWith('$')) {
          doc[k] = v;
        }
      }
      if (update.$pull && update.$pull.labels && Array.isArray(doc.labels)) {
        const pullTarget = update.$pull.labels;
        doc.labels = doc.labels.filter((l) => l !== pullTarget);
      }
      if (update.$addToSet && update.$addToSet.labels && Array.isArray(doc.labels)) {
        const addTarget = update.$addToSet.labels;
        if (!doc.labels.includes(addTarget)) {
          doc.labels.push(addTarget);
        }
      }
      doc.updatedAt = new Date();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  },

  async deleteOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.deleteOne(query);
    }
    const userPrefix = query.userId?.toString();
    for (const [key, doc] of inMemoryEmails.entries()) {
      if (userPrefix && key === `${userPrefix}_${query.id}`) {
        inMemoryEmails.delete(key);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  },

  async deleteMany(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.deleteMany(query);
    }
    const userPrefix = query.userId?.toString();
    let count = 0;
    for (const [key, doc] of inMemoryEmails.entries()) {
      if (userPrefix && key.startsWith(userPrefix)) {
        if (query.id && query.id.$in && query.id.$in.includes(doc.id)) {
          inMemoryEmails.delete(key);
          count++;
        }
      }
    }
    return { deletedCount: count };
  },

  async countDocuments(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmail.countDocuments(query);
    }
    const list = await this.find(query);
    return list.length;
  },
};
