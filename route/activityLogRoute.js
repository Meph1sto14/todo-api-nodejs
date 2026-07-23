const express = require('express');
const protect = require('../middleware/protect');
const { getAllLogs } = require('../controller/activityLogController');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Mendapatkan daftar activity log milik user (create/update/delete todo)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman ke berapa
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar activity log
 *       401:
 *         description: Token tidak disertakan atau tidak valid
 */
router.route('/').get(getAllLogs);

module.exports = router;