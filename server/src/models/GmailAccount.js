import mongoose from 'mongoose';

const inMemoryGmailAccounts = new Map();

const gmailAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: String,
      default: 'google',
    },
    encryptedAccessToken: {
      type: String,
      required: true,
    },
    encryptedRefreshToken: {
      type: String,
      default: null,
    },
    scopes: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDemoMode: {
      type: Boolean,
      default: false,
    },
    profile: {
      name: String,
      picture: String,
      messagesTotal: Number,
      threadsTotal: Number,
      historyId: String,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseGmailAccount = mongoose.model('GmailAccount', gmailAccountSchema);

export const GmailAccount = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseGmailAccount.create(data);
    }
    const id = `gacc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const accDoc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      async save() {
        inMemoryGmailAccounts.set(this.userId.toString(), this);
        return this;
      },
    };
    inMemoryGmailAccounts.set(data.userId.toString(), accDoc);
    return accDoc;
  },

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseGmailAccount.findOne(query);
    }
    if (query.userId) {
      const acc = inMemoryGmailAccounts.get(query.userId.toString());
      if (!acc) return null;
      if (query.isConnected !== undefined && acc.isConnected !== query.isConnected) {
        return null;
      }
      return acc;
    }
    return null;
  },
};
