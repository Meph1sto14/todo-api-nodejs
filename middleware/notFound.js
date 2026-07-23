const notFound = (req, res, next) => {
    const error = new Error(`Route tidak ditemukan - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = notFound;