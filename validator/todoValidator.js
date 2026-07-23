const { body, param, query } = require('express-validator');

exports.createTodoRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Judul todo wajib diisi')
    .isLength({ max: 100 })
    .withMessage('Judul maksimal 100 karakter'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),
  body('category')
    .notEmpty()
    .withMessage('Kategori wajib diisi')
    .isMongoId()
    .withMessage('Category ID tidak valid'),
];

exports.updateTodoRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Judul tidak boleh kosong')
    .isLength({ max: 100 })
    .withMessage('Judul maksimal 100 karakter'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed harus bertipe boolean'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category ID tidak valid'),
];

exports.todoIdRules = [
  param('id').isMongoId().withMessage('ID todo tidak valid'),
];

exports.getAllTodosRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page harus angka positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1-100'),
  query('completed').optional().isBoolean().withMessage('Completed harus true/false'),
  query('category').optional().isMongoId().withMessage('Category ID tidak valid'),
  query('sort').optional().isString(),
  query('search').optional().isString(),
];