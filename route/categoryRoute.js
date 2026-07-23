const express = require('express');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const validate = require('../middleware/validate');
const {
    createCategoryRules,
    updateCategoryRules,
    categoryIdRules,
} = require('../validator/categoryValidator');
const {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} = require('../controller/categoryController');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Mendapatkan daftar kategori milik user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar kategori
 *       401:
 *         description: Token tidak disertakan atau tidak valid
 *   post:
 *     summary: Membuat kategori baru
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kerja
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak disertakan atau tidak valid
 */
router.route('/')
    .get(getAllCategories)
    .post(createCategoryRules, validate, createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Mendapatkan detail kategori berdasarkan ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan kategori
 *       404:
 *         description: Kategori tidak ditemukan
 *   patch:
 *     summary: Mengupdate kategori berdasarkan ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diupdate
 *       404:
 *         description: Kategori tidak ditemukan
 *   delete:
 *     summary: Menghapus kategori berdasarkan ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Kategori berhasil dihapus
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.route('/:id')
    .get(getCategory)
    .patch(updateCategory)
    .delete(restrictTo('admin'), deleteCategory);

module.exports = router;