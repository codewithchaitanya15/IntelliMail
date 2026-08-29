import mongoose from 'mongoose';

const inMemoryActivities = [];

const emailActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailId: {
      type: String,
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const MongooseEmailActivity = mongoose.model('EmailActivity', emailActivitySchema);

export const EmailActivity = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmailActivity.create(data);
    }
    const id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
    };
    inMemoryActivities.unshift(doc);
    return doc;
  },

  find(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseEmailActivity.find(query);
    }
    const matches = inMemoryActivities.filter(
      (a) => a.userId?.toString() === query.userId?.toString()
    );
    return {
      sort() {
        return this;
      },
      limit(n) {
        return matches.slice(0, n);
      },
      then(resolve) {
        resolve(matches);
      },
    };
  },
};
