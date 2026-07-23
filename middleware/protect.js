const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

const protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('Kamu belum login, silakan login untuk akses ini', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('User pemilik token ini sudah tidak ada', 401));
    }

    req.user = currentUser;
    next();
});

module.exports = protect;