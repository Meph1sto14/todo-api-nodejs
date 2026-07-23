const ActivityLog = require('../models/ActivityLog');

exports.recordActivity = async ({ userId, action, targetId, description }) => {
  await ActivityLog.create({
    user: userId,
    action,
    targetType: 'Todo',
    targetId,
    description,
  });
};