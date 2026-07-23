const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const signToken = require('../util/signToken');
const signRefreshToken = require('../util/signRefreshToken');
const hashToken = require('../util/hashToken');

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const newUser = await User.create({ name, email, password, role });

    const token = signToken(newUser._id);
    const refreshToken = signRefreshToken(newUser._id);

    newUser.created_by = newUser._id;
    newUser.updated_by = newUser._id;
    newUser.refreshToken = hashToken(refreshToken);
    await newUser.save();

    // sembunyikan data sensitif sebelum dikirim balik
    newUser.password = undefined;
    newUser.refreshToken = undefined;

    res.status(201).json({
        status: 'success',
        token,
        refreshToken,
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
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    user.password = undefined;
    user.refreshToken = undefined;

    res.status(200).json({
        status: 'success',
        token,
        refreshToken,
        data: { user },
    });
});

exports.refresh = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token wajib disertakan', 400));
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        return next(new AppError('Refresh token tidak valid atau sudah kedaluwarsa', 401));
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || !user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
        return next(new AppError('Refresh token tidak valid', 401));
    }

    const newToken = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: newToken,
    });
});

exports.logout = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });

    res.status(200).json({
        status: 'success',
        message: 'Berhasil logout',
    });
});