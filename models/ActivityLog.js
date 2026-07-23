const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    targetType: { type: String, default: 'Todo' },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    archived: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
