const ActivityLog = require('../models/ActivityLog');
const catchAsync = require('../util/catchAsync');

exports.getAllLogs = catchAsync(async (req, res, next) => {
  const logs = await ActivityLog.find({ user: req.user._id }).sort('-created_at');

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: logs,
  });
});