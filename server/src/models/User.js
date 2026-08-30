import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const inMemoryUsers = new Map();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      defaultReplyTone: {
        type: String,
        enum: ['Professional', 'Friendly', 'Formal', 'Concise'],
        default: 'Professional',
      },
      aiModel: {
        type: String,
        default: 'auto',
      },
      autoClassify: {
        type: Boolean,
        default: true,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'dark',
      },
      smtp: {
        host: { type: String, default: 'smtp.gmail.com' },
        port: { type: Number, default: 587 },
        user: { type: String, default: '' },
        pass: { type: String, default: '' },
        from: { type: String, default: '' },
        isEnabled: { type: Boolean, default: false },
      },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);

export const User = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.create(data);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userDoc = {
      _id: id,
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'user',
      preferences: {
        defaultReplyTone: 'Professional',
        aiModel: 'auto',
        autoClassify: true,
        notifications: true,
        theme: 'dark',
        ...data.preferences,
      },
      createdAt: new Date(),
      lastLogin: new Date(),
      async comparePassword(candidate) {
        return bcrypt.compare(candidate, this.password);
      },
      async save() {
        inMemoryUsers.set(this.email, this);
        return this;
      },
      toObject() {
        return { ...this };
      },
    };
    inMemoryUsers.set(userDoc.email, userDoc);
    return userDoc;
  },

  findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(query);
    }
    let found = null;
    if (query.email) {
      found = inMemoryUsers.get(query.email.toLowerCase()) || null;
    } else {
      for (const u of inMemoryUsers.values()) {
        if (query._id && (u._id === query._id || u.id === query._id)) {
          found = u;
          break;
        }
      }
    }

    return {
      select() {
        return Promise.resolve(found);
      },
      then(resolve, reject) {
        return Promise.resolve(found).then(resolve, reject);
      },
    };
  },

  findById(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findById(id);
    }
    let found = null;
    for (const u of inMemoryUsers.values()) {
      if (u._id === id || u.id === id) {
        found = u;
        break;
      }
    }

    return {
      select() {
        return Promise.resolve(found);
      },
      then(resolve, reject) {
        return Promise.resolve(found).then(resolve, reject);
      },
    };
  },
};
