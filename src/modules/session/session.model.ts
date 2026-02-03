import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' }, // TTL index auto-deletes expired sessions
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);
