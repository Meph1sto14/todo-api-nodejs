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
        created_by: req.user._id,
        updated_by: req.user._id,
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

// READ ALL — mengecualikan todo yang archived
exports.getAllTodos = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, completed, category, search, sort } = req.query;

  const filter = { user: req.user._id, archived: false };

  if (completed !== undefined) {
    filter.completed = completed === 'true';
  }
  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  // UBAH: createdAt -> created_at, karena field waktu di schema sudah diganti namanya
  const sortBy = sort ? sort.split(',').join(' ') : '-created_at';

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

// READ ONE
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

// UPDATE
exports.updateTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updated_by: req.user._id },
        { new: true, runValidators: true }
    );

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

// DELETE — soft delete (archived: true)
exports.deleteTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    const archivedTodo = await Todo.findByIdAndUpdate(
        req.params.id,
        { archived: true, updated_by: req.user._id },
        { new: true }
    );

    await recordActivity({
      userId: req.user._id,
      action: 'delete',
      targetId: archivedTodo._id,
      description: `Meng-archive (soft delete) todo "${archivedTodo.title}"`,
    });

    res.status(200).json({
        status: 'success',
        message: 'Todo berhasil di-archive',
        data: archivedTodo,
    });
});

// RESTORE
exports.restoreTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    if (!todo.archived) {
        return next(new AppError('Todo ini tidak sedang dalam status archived', 400));
    }

    const restoredTodo = await Todo.findByIdAndUpdate(
        req.params.id,
        { archived: false, updated_by: req.user._id },
        { new: true }
    );

    await recordActivity({
      userId: req.user._id,
      action: 'update',
      targetId: restoredTodo._id,
      description: `Merestore todo "${restoredTodo.title}"`,
    });

    res.status(200).json({
        status: 'success',
        message: 'Todo berhasil direstore',
        data: restoredTodo,
    });
});

// PERMANENT DELETE — hanya boleh jika sudah archived
exports.permanentDeleteTodo = catchAsync(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo tidak ditemukan', 404));
    }

    if (todo.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke todo ini', 403));
    }

    if (!todo.archived) {
        return next(new AppError('Todo harus di-archive (soft delete) terlebih dahulu sebelum dihapus permanen', 400));
    }

    await recordActivity({
      userId: req.user._id,
      action: 'delete',
      targetId: todo._id,
      description: `Menghapus permanen todo "${todo.title}"`,
    });

    await Todo.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});