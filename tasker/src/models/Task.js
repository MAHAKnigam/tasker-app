const mongoose = require('mongoose');

const recurrenceSchema = new mongoose.Schema(
  {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    interval: { type: Number, min: 1, max: 365, default: 1 },
    endDate: { type: Date, default: null },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please provide a task title'], trim: true, maxlength: [100, 'Title cannot be more than 100 characters'] },
    description: { type: String, trim: true, maxlength: [500, 'Description cannot be more than 500 characters'] },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    reminderMinutesBefore: { type: Number, enum: [5, 15, 30, 60, 1440, null], default: 30 },
    reminderAt: { type: Date, default: null },
    reminderClaimedAt: { type: Date, default: null },
    reminderSentAt: { type: Date, default: null },
    emailReminderSentAt: { type: Date, default: null },
    pushReminderSentAt: { type: Date, default: null },
    recurrence: { type: recurrenceSchema, default: null },
    recurrenceSeriesId: { type: mongoose.Schema.Types.ObjectId, default: null },
    recurrenceIndex: { type: Number, default: 0, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Task must belong to a user'] },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: { type: [String], default: [] },
    isCompleted: { type: Boolean, default: false },
    comments: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

taskSchema.index({ recurrenceSeriesId: 1, recurrenceIndex: 1 }, {
  unique: true,
  partialFilterExpression: { recurrenceSeriesId: { $type: 'objectId' } },
});
taskSchema.index({ reminderAt: 1, reminderSentAt: 1, reminderClaimedAt: 1 });

module.exports = mongoose.model('Task', taskSchema);
