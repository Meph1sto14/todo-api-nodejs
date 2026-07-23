const AppError = require('../util/AppError');

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(new AppError('API Key wajib disertakan di header x-api-key', 401));
  }

  if (apiKey !== process.env.API_KEY) {
    return next(new AppError('API Key tidak valid', 403));
  }

  next();
};

module.exports = apiKeyAuth;