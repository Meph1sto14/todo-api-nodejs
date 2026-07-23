const User = require('../models/User');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const signToken = require('../util/signToken');

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const newUser = await User.create({ name, email, password, role });

    newUser.created_by = newUser._id;
    newUser.updated_by = newUser._id;
    await newUser.save();
    
    const token = signToken(newUser._id);

    // sembunyikan password sebelum dikirim balik
    newUser.password = undefined;

    res.status(201).json({
        status: 'success',
        token,
        data: { user: newUser },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) pastikan email & password dikirim
    if (!email || !password) {
        return next(new AppError('Email dan password wajib diisi', 400));
    }

    // 2) cari user, sertakan password (karena default select: false)
    const user = await User.findOne({ email }).select('+password');

    // 3) cek user ada & password cocok
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Email atau password salah', 401));
    }

    const token = signToken(user._id);

    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token,
        data: { user },
    });
});