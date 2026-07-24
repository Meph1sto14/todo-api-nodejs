# Todo List Management API

REST API backend untuk mengelola data _todo_ pribadi pengguna, lengkap dengan autentikasi JWT (access & refresh token), otorisasi berbasis _role_, pengelompokan kategori, pencatatan _activity log_, serta endpoint statistik untuk akses eksternal via API Key.

Dibangun dengan struktur **Controller–Service–Model** menggunakan Node.js, Express.js, dan MongoDB (Mongoose).

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Instalasi](#instalasi)
- [Environment Variable](#environment-variable)
- [Menjalankan Project](#menjalankan-project)
- [Dokumentasi API](#dokumentasi-api)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [Autentikasi & Otorisasi](#autentikasi--otorisasi)
- [Struktur Dokumen MongoDB](#struktur-dokumen-mongodb)
- [Testing](#testing)

## Fitur

- **Autentikasi JWT** — register, login, refresh token, dan logout (revoke refresh token).
- **Otorisasi berbasis role** — membedakan akses `user` biasa dan `admin` (mis. hapus permanen todo, hapus kategori).
- **CRUD Todo** — hanya bisa diakses oleh pemilik data, dengan _pagination_, _sorting_, _filtering_ (status selesai & kategori), dan _search_ judul.
- **CRUD Kategori** — pengelompokan todo per user, dengan validasi input.
- **Soft delete & restore** — todo yang dihapus diarsipkan (`archived: true`), bisa direstore, dan baru bisa dihapus permanen (khusus admin) setelah diarsipkan.
- **Activity Log** — mencatat otomatis setiap todo dibuat, diubah, atau dihapus.
- **Endpoint statistik (machine-to-machine)** — `/api/stats` diproteksi API Key untuk akses eksternal tanpa login.
- **Rate limiting** — dibatasi pada endpoint autentikasi untuk mencegah _brute force_.
- **Validasi input** — menggunakan `express-validator` pada endpoint todo dan kategori.
- **Error handling terpusat** — format response error konsisten dengan HTTP status code yang sesuai.
- **Dokumentasi Swagger** — tersedia di `/api-docs`.

## Teknologi

| Kategori       | Tools                                          |
| -------------- | ---------------------------------------------- |
| Runtime        | Node.js                                        |
| Framework      | Express.js 5                                   |
| Database       | MongoDB + Mongoose                             |
| Autentikasi    | JSON Web Token (`jsonwebtoken`), `bcryptjs`    |
| Validasi       | `express-validator`                            |
| Rate limiting  | `express-rate-limit`                           |
| Dokumentasi    | `swagger-jsdoc`, `swagger-ui-express`          |
| Testing        | `jest`, `supertest`                            |

## Struktur Folder

\`\`\`
todo-api/
├── config/          # Koneksi DB & konfigurasi Swagger
├── controller/      # Handler request per resource
├── middleware/      # Auth, validasi, rate limit, error handler, dll
├── models/          # Schema Mongoose (User, Todo, Category, ActivityLog)
├── route/           # Definisi endpoint per resource
├── service/         # Logic reusable (mis. pencatatan activity log)
├── validator/       # Rule validasi input (express-validator)
├── util/            # Helper (AppError, catchAsync, sign token, dll)
├── tests/           # Automated testing (Jest + Supertest)
├── app.js           # Setup Express app & routing
└── server.js        # Entry point, koneksi DB, dan start server
\`\`\`

## Instalasi

**Prasyarat:** Node.js (v18+ disarankan) dan MongoDB (lokal atau Atlas).

1. Clone repository:
   git clone <url-repository-ini>
   cd todo-api
2. Install dependencies:
   npm install
3. Salin file environment variable (lihat bagian di bawah) menjadi `.env` di root project.

## Environment Variable

Buat file `.env` di root project dengan isi berikut:

# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/todo-api

# JWT Access Token
JWT_SECRET=ganti_dengan_secret_yang_acak_dan_rahasia
JWT_EXPIRES_IN=7d

# JWT Refresh Token
JWT_REFRESH_SECRET=ganti_dengan_secret_lain_yang_acak_dan_rahasia
JWT_REFRESH_EXPIRES_IN=30d

# API Key untuk endpoint eksternal (mis. /api/stats)
API_KEY=ganti_dengan_api_key_bebas

> `.env` sudah masuk `.gitignore` sehingga tidak akan ter-_commit_ ke repository. Jangan pernah membagikan nilai secret ini secara publik.

| Variabel                  | Keterangan                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `PORT`                    | Port server dijalankan (default `5000`)                                                 |
| `NODE_ENV`                | `development` untuk menampilkan stack trace error, `production` untuk menyembunyikannya |
| `MONGO_URI`               | Connection string MongoDB                                                               |
| `JWT_SECRET`              | Secret untuk menandatangani access token                                                |
| `JWT_EXPIRES_IN`          | Masa berlaku access token (default `7d`)                                                |
| `JWT_REFRESH_SECRET`      | Secret untuk menandatangani refresh token                                               |
| `JWT_REFRESH_EXPIRES_IN`  | Masa berlaku refresh token (default `30d`)                                              |
| `API_KEY`                 | Key yang harus disertakan di header `x-api-key` untuk mengakses endpoint eksternal      |

## Menjalankan Project

Jalankan dalam mode development (auto-restart dengan nodemon):

npm run dev

Atau jalankan seperti production:

npm start

Server berjalan di `http://localhost:5000` (atau sesuai `PORT` di `.env`).

## Dokumentasi API

Dokumentasi interaktif Swagger tersedia setelah server berjalan, di:

http://localhost:5000/api-docs

Setiap endpoint pada Swagger sudah mencantumkan contoh request body, parameter query, serta kemungkinan response dan status code.

## Ringkasan Endpoint

### Auth (`/api/auth`)

| Method | Endpoint                 | Deskripsi                                       | Akses       |
| ------ | ------------------------ | ----------------------------------------------  | ----------- |
| POST   | `/api/auth/register`     | Registrasi user baru                            | Publik      |
| POST   | `/api/auth/login`        | Login, menghasilkan access & refresh token      | Publik      |
| POST   | `/api/auth/refresh`      | Memperbarui access token dari refresh token     | Publik      |
| POST   | `/api/auth/logout`       | Logout & revoke refresh token                   | User login  |

### Todos (`/api/todos`)

| Method | Endpoint                       | Deskripsi                                                  | Akses         |
| ------ | ------------------------------ | --------------------------------------------------------   | ------------- |
| GET    | `/api/todos`                   | List todo milik user (pagination, filter, search, sort)    | User login    |
| POST   | `/api/todos`                   | Buat todo baru                                             | User login    |
| GET    | `/api/todos/:id`               | Detail todo                                                | Pemilik todo  |
| PATCH  | `/api/todos/:id`               | Update todo                                                | Pemilik todo  |
| DELETE | `/api/todos/:id`               | Soft delete (arsipkan) todo                                | Pemilik todo  |
| PATCH  | `/api/todos/:id/restore`       | Restore todo yang diarsipkan                               | Pemilik todo  |
| DELETE | `/api/todos/:id/permanent`     | Hapus todo permanen (harus sudah diarsipkan)               | Admin         |

> Query yang didukung di `GET /api/todos`: `page`, `limit`, `completed`, `category`, `search`, `sort` (mis. `-created_at`).

### Categories (`/api/categories`)

| Method | Endpoint                    | Deskripsi                        | Akses               |
| ------ | --------------------------- | -------------------------------  | ------------------- |
| GET    | `/api/categories`           | List kategori milik user         | User login          |
| POST   | `/api/categories`           | Buat kategori baru               | User login          |
| GET    | `/api/categories/:id`       | Detail kategori                  | Pemilik kategori    |
| PATCH  | `/api/categories/:id`       | Update kategori                  | Pemilik kategori    |
| DELETE | `/api/categories/:id`       | Hapus kategori                   | Admin               |

### Activity Logs (`/api/activity-logs`)

| Method | Endpoint                | Deskripsi                                                  | Akses       |
| ------ | ----------------------- | ---------------------------------------------------------- | ----------- |
| GET    | `/api/activity-logs`    | Riwayat aktivitas (create/update/delete todo) milik user   | User login  |

### Stats (`/api/stats`) — Akses Eksternal via API Key

| Method | Endpoint        | Deskripsi                                                        | Akses                          |
| ------ | --------------- | ---------------------------------------------------------------- | ------------------------------ |
| GET    | `/api/stats`    | Ringkasan statistik todo (total, selesai, pending, per kategori) | API Key (header `x-api-key`)   |

## Autentikasi & Otorisasi

- Sebagian besar endpoint memerlukan **access token JWT** yang dikirim melalui header:

  Authorization: Bearer <access_token>

- Access token berumur pendek (default 7 hari, bisa diperpendek lewat `JWT_EXPIRES_IN`); gunakan endpoint `/api/auth/refresh` untuk mendapatkan access token baru tanpa perlu login ulang.
- Endpoint tertentu (hapus kategori, hapus permanen todo) hanya bisa diakses oleh user dengan `role: admin`.
- Endpoint `/api/stats` tidak memerlukan login, melainkan API Key yang dikirim lewat header `x-api-key`, ditujukan untuk konsumsi machine-to-machine (mis. dashboard eksternal).

## Struktur Dokumen MongoDB

Setiap dokumen di seluruh collection (`users`, `todos`, `categories`, `activityLogs`) konsisten memiliki field berikut:

- `created_by` — referensi ID user yang membuat dokumen
- `updated_by` — referensi ID user yang terakhir mengubah dokumen
- `created_at` — timestamp dibuat (otomatis via Mongoose)
- `updated_at` — timestamp terakhir diubah (otomatis via Mongoose)
- `archived` — status soft delete (`true`/`false`, default `false`)

## Testing

Menjalankan automated testing (Jest + Supertest):

npm test

> Pastikan `MONGO_URI` di `.env` mengarah ke database yang aman digunakan untuk testing (bukan database production).
