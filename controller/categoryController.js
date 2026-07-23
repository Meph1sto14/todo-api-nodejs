const Category = require('../models/Category');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

exports.createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    const newCategory = await Category.create({
        name,
        user: req.user._id,
    });

    res.status(201).json({
        status: 'success',
        data: newCategory,
    });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find({ user: req.user._id });

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: categories,
    });
});

exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new AppError('Kategori tidak ditemukan', 404));
    }

    if (category.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke kategori ini', 403));
    }

    res.status(200).json({
        status: 'success',
        data: category,
    });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new AppError('Kategori tidak ditemukan', 404));
    }

    if (category.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke kategori ini', 403));
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: updatedCategory,
    });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new AppError('Kategori tidak ditemukan', 404));
    }

    if (category.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Kamu tidak punya akses ke kategori ini', 403));
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});