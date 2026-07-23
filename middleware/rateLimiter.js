const rateLimit = require('express-rate-limit');

// JEST_WORKER_ID otomatis di-set sama Jest saat menjalankan test,
// jadi rate limiter otomatis nonaktif pas npm test (nggak butuh env tambahan)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // maksimal 10 request per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !!process.env.JEST_WORKER_ID,
    message: {
        status: 'fail',
        message: 'Terlalu banyak percobaan, coba lagi setelah beberapa saat',
    },
});

module.exports = authLimiter;