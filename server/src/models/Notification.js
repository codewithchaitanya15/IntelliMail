import mongoose from 'mongoose';

const inMemoryNotifications = [];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: 'info',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: '',
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

const MongooseNotification = mongoose.model('Notification', notificationSchema);

export const Notification = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.create(data);
    }
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const doc = {
      _id: id,
      id,
      ...data,
      isRead: false,
      createdAt: new Date(),
    };
    inMemoryNotifications.unshift(doc);
    return doc;
  },

  find(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.find(query);
    }
    const matches = inMemoryNotifications.filter(
      (n) => n.userId?.toString() === query.userId?.toString()
    );
    return {
      sort() {
        return this;
      },
      limit(count) {
        return matches.slice(0, count);
      },
      then(resolve) {
        resolve(matches);
      },
    };
  },

  async findOneAndUpdate(query, update, options) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.findOneAndUpdate(query, update, options);
    }
    const n = inMemoryNotifications.find(
      (item) => item._id === query._id && item.userId?.toString() === query.userId?.toString()
    );
    if (n && update.isRead !== undefined) {
      n.isRead = update.isRead;
    }
    return n;
  },

  async updateMany(query, update) {
    if (mongoose.connection.readyState === 1) {
      return MongooseNotification.updateMany(query, update);
    }
    inMemoryNotifications.forEach((item) => {
      if (item.userId?.toString() === query.userId?.toString()) {
        if (update.isRead !== undefined) item.isRead = update.isRead;
      }
    });
    return { modifiedCount: inMemoryNotifications.length };
  },
};
