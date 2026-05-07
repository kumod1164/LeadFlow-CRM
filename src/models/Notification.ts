import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Notification type enumeration
 */
export type NotificationType = 'follow_up' | 'assignment';

/**
 * Notification document interface
 */
export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  leadId: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

/**
 * Notification schema definition
 */
const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  type: {
    type: String,
    enum: {
      values: ['follow_up', 'assignment'],
      message: 'Type must be either follow_up or assignment',
    },
    required: [true, 'Notification type is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: [true, 'Lead ID is required'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient querying of unread notifications by user
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

/**
 * Notification model
 * Prevents model recompilation during hot-reload in development
 */
const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
