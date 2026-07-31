const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    senderRole: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Network', 'Hardware', 'Software', 'Billing', 'Service', 'Other'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    messages: [messageSchema],
    internalNotes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    slaDueDate: {
      type: Date,
      default: function () {
        const hours = this.priority === 'HIGH' ? 24 : this.priority === 'MEDIUM' ? 48 : 72;
        return new Date(Date.now() + hours * 60 * 60 * 1000);
      },
    },
    tags: [{ type: String, trim: true }],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for fast search
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdBy: 1 });
complaintSchema.index({ assignedAgent: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
