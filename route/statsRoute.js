const express = require('express');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const { getStats } = require('../controller/statsController');

const router = express.Router();

router.use(apiKeyAuth);

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Mendapatkan statistik/ringkasan todo (akses machine-to-machine via API Key)
 *     tags: [Stats]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan statistik
 *       401:
 *         description: API Key tidak disertakan
 *       403:
 *         description: API Key tidak valid
 */
router.route('/').get(getStats);

module.exports = router;