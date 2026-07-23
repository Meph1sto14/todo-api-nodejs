const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama kategori wajib diisi'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kategori harus terhubung dengan user'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
