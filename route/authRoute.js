const express = require('express');
const protect = require('../middleware/protect');
const authLimiter = require('../middleware/rateLimiter');
const { register, login, refresh, logout } = require('../controller/authController');

const router = express.Router();

router.use(authLimiter);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Mendaftarkan user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Marvel
 *               email:
 *                 type: string
 *                 example: marvel@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan, token dikembalikan
 *       400:
 *         description: Validasi gagal atau email sudah terdaftar
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user dan mendapatkan token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: marvel@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil, token dikembalikan
 *       400:
 *         description: Email atau password tidak diisi
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Mendapatkan access token baru menggunakan refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token baru berhasil dibuat
 *       400:
 *         description: Refresh token tidak disertakan
 *       401:
 *         description: Refresh token tidak valid atau sudah kedaluwarsa
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout dan mencabut (revoke) refresh token milik user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil logout
 *       401:
 *         description: Token tidak disertakan atau tidak valid
 */
router.post('/logout', protect, logout);

module.exports = router;