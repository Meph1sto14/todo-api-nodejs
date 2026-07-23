const Todo = require('../models/Todo');
const catchAsync = require('../util/catchAsync');

exports.getStats = catchAsync(async (req, res, next) => {
  const [totalTodos, completedTodos, pendingTodos, todosByCategory] = await Promise.all([
    Todo.countDocuments(),
    Todo.countDocuments({ completed: true }),
    Todo.countDocuments({ completed: false }),
    Todo.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalTodos,
      completedTodos,
      pendingTodos,
      completionRate: totalTodos > 0
        ? `${((completedTodos / totalTodos) * 100).toFixed(1)}%`
        : '0%',
      todosByCategory,
    },
  });
});