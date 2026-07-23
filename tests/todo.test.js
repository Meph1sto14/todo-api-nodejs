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

let regularToken;
let regularUserId;
let regularCategoryId;

const testEmail = `testuser_${Date.now()}@example.com`;
const regularEmail = `regularuser_${Date.now()}@example.com`;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  // user utama dipakai di seluruh test lain -> dibuat admin supaya tetap
  // bisa akses semua endpoint (termasuk permanent delete) atas data miliknya sendiri
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: testEmail,
    password: 'password123',
    role: 'admin',
  });

  token = res.body.token;
  userId = res.body.data.user._id;

  const category = await Category.create({ name: 'Test Category', user: userId });
  categoryId = category._id;

  // user biasa, khusus buat test otorisasi role (403 permanent delete)
  const regularRes = await request(app).post('/api/auth/register').send({
    name: 'Regular User',
    email: regularEmail,
    password: 'password123',
  });

  regularToken = regularRes.body.token;
  regularUserId = regularRes.body.data.user._id;

  const regularCategory = await Category.create({ name: 'Regular Category', user: regularUserId });
  regularCategoryId = regularCategory._id;
});

afterAll(async () => {
  await Todo.deleteMany({ user: userId });
  await Category.deleteMany({ user: userId });
  await User.deleteOne({ _id: userId });

  await Todo.deleteMany({ user: regularUserId });
  await Category.deleteMany({ user: regularUserId });
  await User.deleteOne({ _id: regularUserId });

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

// UBAH: seluruh describe block DELETE diganti supaya sesuai alur soft delete -> restore -> hard delete
describe('Todo - SOFT DELETE, RESTORE, PERMANENT DELETE', () => {
  it('harus berhasil soft delete (archive) todo', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.archived).toBe(true);
  });

  it('todo yang sudah di-archive tidak muncul lagi di list', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`);

    const found = res.body.data.find((t) => t._id === todoId);
    expect(found).toBeUndefined();
  });

  it('harus gagal (400) permanent delete sebelum di-restore ulang jika belum archived', async () => {
    // todo lain yang belum pernah di-archive
    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Todo belum archived', category: categoryId });

    const freshTodoId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/todos/${freshTodoId}/permanent`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it('harus berhasil restore todo yang sudah di-archive', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.archived).toBe(false);
  });

  it('harus berhasil permanent delete setelah di-archive lagi', async () => {
    await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/todos/${todoId}/permanent`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});

describe('Todo - AUTHORIZATION (role-based)', () => {
  it('harus gagal (403) permanent delete todo jika role bukan admin', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${regularToken}`)
      .send({ title: 'Todo milik user biasa', category: regularCategoryId });

    const regularTodoId = createRes.body.data._id;

    await request(app)
      .delete(`/api/todos/${regularTodoId}`)
      .set('Authorization', `Bearer ${regularToken}`);

    const res = await request(app)
      .delete(`/api/todos/${regularTodoId}/permanent`)
      .set('Authorization', `Bearer ${regularToken}`);

    expect(res.statusCode).toBe(403);
  });
});