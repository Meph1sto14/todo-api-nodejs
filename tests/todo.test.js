const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const Todo = require('../models/Todo');

let token;
let userId;
let categoryId;
let todoId;

const testEmail = `testuser_${Date.now()}@example.com`;

beforeAll(async () => {
  // Pastikan koneksi ke database (pakai DB yang sama dengan development)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  // Membuat user testing baru
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: testEmail,
    password: 'password123',
  });

  token = res.body.token;
  userId = res.body.data.user._id;

  // Membuat kategori testing
  const category = await Category.create({ name: 'Test Category', user: userId });
  categoryId = category._id;
});

afterAll(async () => {
  // Membersihkan semua data testing biar tidak numpuk di database
  await Todo.deleteMany({ user: userId });
  await Category.deleteMany({ user: userId });
  await User.deleteOne({ _id: userId });
  await mongoose.connection.close();
});

describe('Auth', () => {
  it('harus bisa login dengan kredensial yang benar', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  it('harus gagal login dengan password salah', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'passwordsalah',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('fail');
  });
});

describe('Todo - CREATE', () => {
  it('harus berhasil membuat todo baru dengan data valid', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Belajar Jest dan Supertest',
        description: 'Testing otomatis',
        category: categoryId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.title).toBe('Belajar Jest dan Supertest');

    todoId = res.body.data._id;
  });

  it('harus gagal (400) jika title tidak diisi', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Tanpa title',
        category: categoryId,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('harus gagal (400) jika category bukan ObjectId valid', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test category invalid',
        category: 'bukan-object-id',
      });

    expect(res.statusCode).toBe(400);
  });

  it('harus gagal (401) jika tidak menyertakan token', async () => {
    const res = await request(app).post('/api/todos').send({
      title: 'Tanpa token',
      category: categoryId,
    });

    expect(res.statusCode).toBe(401);
  });
});

describe('Todo - READ', () => {
  it('harus berhasil mengambil daftar todo dengan pagination', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('harus berhasil mengambil satu todo berdasarkan ID', async () => {
    const res = await request(app)
      .get(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(todoId);
  });

  it('harus gagal (404) jika todo tidak ditemukan', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/todos/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('Todo - UPDATE', () => {
  it('harus berhasil update status completed', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });
});

describe('Todo - DELETE', () => {
  it('harus berhasil menghapus todo', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});