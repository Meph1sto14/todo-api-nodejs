const express = require('express');
const protect = require('../middleware/protect');
const validate = require('../middleware/validate');
const {
  createTodoRules,
  updateTodoRules,
  todoIdRules,
  getAllTodosRules,
} = require('../validator/todoValidator');
const {
  createTodo,
  getAllTodos,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controller/todoController');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Mendapatkan daftar todo milik user (dengan filter, search, sort, pagination)
 *     tags: [Todos]
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
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status selesai
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan judul todo
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Urutkan hasil, contoh: -createdAt atau title"
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar todo
 *       400:
 *         description: Query parameter tidak valid
 *       401:
 *         description: Token tidak disertakan atau tidak valid
 *   post:
 *     summary: Membuat todo baru
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Belajar Swagger
 *               description:
 *                 type: string
 *                 example: Membuat dokumentasi API
 *               category:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       201:
 *         description: Todo berhasil dibuat
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak disertakan atau tidak valid
 */
router.route('/')
  .get(getAllTodosRules, validate, getAllTodos)
  .post(createTodoRules, validate, createTodo);

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Mendapatkan detail todo berdasarkan ID
 *     tags: [Todos]
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
 *         description: Berhasil mendapatkan todo
 *       403:
 *         description: Tidak punya akses ke todo ini
 *       404:
 *         description: Todo tidak ditemukan
 *   patch:
 *     summary: Mengupdate todo berdasarkan ID
 *     tags: [Todos]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todo berhasil diupdate
 *       400:
 *         description: Validasi gagal
 *       403:
 *         description: Tidak punya akses ke todo ini
 *       404:
 *         description: Todo tidak ditemukan
 *   delete:
 *     summary: Menghapus todo berdasarkan ID
 *     tags: [Todos]
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
 *         description: Todo berhasil dihapus
 *       403:
 *         description: Tidak punya akses ke todo ini
 *       404:
 *         description: Todo tidak ditemukan
 */
router.route('/:id')
  .get(todoIdRules, validate, getTodo)
  .patch(todoIdRules, updateTodoRules, validate, updateTodo)
  .delete(todoIdRules, validate, deleteTodo);

module.exports = router;