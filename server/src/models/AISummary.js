import mongoose from 'mongoose';

const inMemorySummaries = [];

const aiSummarySchema = new mongoose.Schema(
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
    summary: {
      type: String,
      required: true,
    },
    importantPoints: {
      type: [String],
      default: [],
    },
    purpose: {
      type: String,
      default: '',
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
    people: {
      type: [String],
      default: [],
    },
    actionItems: {
      type: [String],
      default: [],
    },
    model: {
      type: String,
      default: 'auto',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAISummary = mongoose.model('AISummary', aiSummarySchema);

export const AISummary = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAISummary.create(data);
    }
    const id = `sum_${Date.now()}`;
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
    };
    inMemorySummaries.unshift(doc);
    return doc;
  },

  findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAISummary.findOne(query);
    }
    const found = inMemorySummaries.find(
      (s) => s.userId?.toString() === query.userId?.toString() && s.emailId === query.emailId
    );
    return {
      sort() {
        return found || null;
      },
      then(resolve) {
        resolve(found || null);
      },
    };
  },

  async deleteMany(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAISummary.deleteMany(query);
    }
    const initialLen = inMemorySummaries.length;
    for (let i = inMemorySummaries.length - 1; i >= 0; i--) {
      const s = inMemorySummaries[i];
      if (
        (!query.userId || s.userId?.toString() === query.userId?.toString()) &&
        (!query.emailId || s.emailId === query.emailId)
      ) {
        inMemorySummaries.splice(i, 1);
      }
    }
    return { deletedCount: initialLen - inMemorySummaries.length };
  },

  async deleteOne(query) {
    return this.deleteMany(query);
  },
};
