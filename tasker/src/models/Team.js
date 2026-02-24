const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a team name'],
      trim: true,
      maxlength: [100, 'Team name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    taskCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create unique index for team names per owner
teamSchema.index({ owner: 1, name: 1 }, { unique: true });

// Populate owner on find
teamSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'members.userId',
    select: 'name email',
  });
  next();
});

module.exports = mongoose.model('Team', teamSchema);
