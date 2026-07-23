const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan pada server';

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `ID tidak valid: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = `Data duplikat: ${Object.keys(err.keyValue)} sudah digunakan`;
    }

    res.status(statusCode).json({
        status:statusCode >= 500 ? 'error' : 'fail',
        message,

        ...(process.env.NODE_ENV === 'development' && {stack : err.stack}),
    });
};

module.exports = errorHandler;