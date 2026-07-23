const Todo = require('../models/Todo');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const { recordActivity } = require('../service/activityLogService');

// CREATE
exports.createTodo = catchAsync(async (req, res, next) => {
    const { title, description, category } = req.body;

    const newTodo = await Todo.create({
        title,
        description,
        category,
        user: req.user._id,
    });

    await recordActivity({
      userId: req.user._id,
      action: 'create',
      targetId: newTodo._id,
      description: `Membuat todo "${newTodo.title}"`,
    });

    res.status(201).json({
        status: 'success',
        data: newTodo,
    });
});

// READ ALL (tetap sama, tidak ada perubahan)
exports.getAllTodos = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, completed, category, search, sort } = req.query;

  const filter = { user: req.user._id };

  if (completed !== undefined) {
    filter.completed = completed === 'true';
  }
  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [todos, totalCount] = await Promise.all([
    Todo.find(filter)
      .populate('category', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Todo.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: todos.length,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
    data: todos,
  });
});

// READ ONE (tetap sama)
exports.getTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id).populate('category', 'name');

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    res.status(200).json({
        status: 'success',
        data: todo,
    });
});

// UPDATE — TAMBAHAN recordActivity di sini
exports.updateTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    await recordActivity({
      userId: req.user._id,
      action: 'update',
      targetId: updatedTodo._id,
      description: `Mengupdate todo "${updatedTodo.title}"`,
    });

    res.status(200).json({
        status: 'success',
        data: updatedTodo,
    });
});

// DELETE — TAMBAHAN recordActivity di sini (sebelum data dihapus)
exports.deleteTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    await recordActivity({
      userId: req.user._id,
      action: 'delete',
      targetId: todo._id,
      description: `Menghapus todo "${todo.title}"`,
    });

    await Todo.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});