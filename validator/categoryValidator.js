const { body, param } = require('express-validator');

exports.createCategoryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama kategori wajib diisi')
    .isLength({ max: 50 })
    .withMessage('Nama kategori maksimal 50 karakter'),
];

exports.updateCategoryRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nama kategori tidak boleh kosong')
    .isLength({ max: 50 })
    .withMessage('Nama kategori maksimal 50 karakter'),
];

exports.categoryIdRules = [
  param('id').isMongoId().withMessage('ID kategori tidak valid'),
];