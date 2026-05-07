import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Pipeline stage enumeration
 */
export type PipelineStage = 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';

/**
 * Activity entry subdocument interface
 */
export interface IActivityEntry {
  action: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  details?: string;
  timestamp: Date;
}

/**
 * Note subdocument interface
 */
export interface INote {
  _id: mongoose.Types.ObjectId;
  content: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
}

/**
 * Lead document interface
 */
export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: PipelineStage;
  assignedTo?: mongoose.Types.ObjectId;
  followUpDate?: Date;
  notes: INote[];
  timeline: IActivityEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Activity entry subdocument schema
 */
const ActivityEntrySchema = new Schema<IActivityEntry>(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Note subdocument schema
 */
const NoteSchema = new Schema<INote>({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID is required'],
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Lead schema definition
 */
const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC 5322 compliant email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    stage: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],
        message: 'Stage must be one of: New, Contacted, Qualified, Won, Lost',
      },
      default: 'New',
      required: [true, 'Stage is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    followUpDate: {
      type: Date,
    },
    notes: {
      type: [NoteSchema],
      default: [],
    },
    timeline: {
      type: [ActivityEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for common query patterns
LeadSchema.index({ assignedTo: 1, stage: 1 }); // Filter by assigned user and stage
LeadSchema.index({ createdAt: -1 }); // Sort by creation date
LeadSchema.index({ name: 'text', email: 'text', company: 'text' }); // Full-text search

/**
 * Lead model
 * Prevents model recompilation during hot-reload in development
 */
const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
