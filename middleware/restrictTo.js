const AppError = require('../util/AppError');

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Anda tidak punya izin untuk melakukan aksi ini', 403)
            );
        }
        next();
    };
};

module.exports = restrictTo;