const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Judul todo wajib diisi'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Todo harus terhubung dengan user'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Todo harus terhubung dengan kategori'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Todo', todoSchema);
