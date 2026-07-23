const ActivityLog = require('../models/ActivityLog');
const catchAsync = require('../util/catchAsync');

// READ ALL (cuma log milik user yang login) + pagination sederhana
exports.getAllLogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const filter = { user: req.user._id };

  const [logs, totalCount] = await Promise.all([
    ActivityLog.find(filter)
      .sort('-created_at')
      .skip(skip)
      .limit(limitNum),
    ActivityLog.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
    data: logs,
  });
});