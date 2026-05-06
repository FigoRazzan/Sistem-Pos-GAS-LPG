# 🔥 WEB-GAS — Sistem Informasi Manajemen Pemesanan Gas LPG

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker)
![Midtrans](https://img.shields.io/badge/Midtrans-Payment-003366?style=for-the-badge)
![Roboflow](https://img.shields.io/badge/Roboflow-AI-purple?style=for-the-badge)

**Aplikasi web fullstack untuk manajemen transaksi Gas LPG antara Supplier dan Agen,
dilengkapi AI deteksi uang palsu dan payment gateway Midtrans.**

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Lengkap](#-fitur-lengkap)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Setup dari Awal](#-setup-dari-awal)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Script Utilitas](#-script-utilitas)
- [Troubleshooting](#-troubleshooting)

---

## 🧾 Tentang Proyek

**WEB-GAS** adalah sistem informasi manajemen pemesanan gas LPG berbasis web yang menghubungkan dua aktor utama:

| Aktor | Role | Akses |
|-------|------|-------|
| **Supplier Gas** | Role 1 | Kelola produk, validasi pembayaran, laporan pajak, deteksi uang palsu |
| **Agen Pengecer** | Role 2 | Browse katalog, checkout, upload bukti bayar, rating produk |

> Proyek ini dibuat sebagai Tugas Akhir Semester 8 mata kuliah **Teknologi Enterprise (TE)** — ITENAS Bandung.

---

## ✨ Fitur Lengkap

- 🛒 **Transaksi** — Checkout dengan 3 metode: Transfer Manual, Cash, Midtrans Online
- 📦 **Produk** — CRUD produk gas oleh Supplier, stok otomatis terpotong
- 💳 **Midtrans** — QRIS, Virtual Account, e-wallet, dll.
- 🤖 **AI Deteksi Uang Palsu** — Upload/kamera → Roboflow AI analisis otomatis → confidence ≥60% = ASLI
- 🧾 **Laporan Pajak** — Rekap PPN 11%, download PDF Slip Pajak & Faktur Pajak
- 🔔 **Toast Notification** — Semua notifikasi custom (bukan browser alert)
- 🔐 **Auth** — Login & Register, NextAuth.js, role-based access control

---

## 🛠 Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Database | PostgreSQL 15 (via Docker) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| PDF | jsPDF + html2canvas |
| Payment | Midtrans Snap |
| AI | Roboflow (`deteksi-rupiah-ryiwz`) |
| Container | Docker + Docker Compose |

---

## 💻 Prasyarat

Install semua software berikut sebelum mulai:

| Software | Keterangan | Download |
|----------|------------|----------|
| **Node.js 20+** | Runtime JavaScript | https://nodejs.org |
| **Docker Desktop** | Untuk menjalankan database PostgreSQL | https://www.docker.com/products/docker-desktop/ |
| **Git** | Untuk clone repository | https://git-scm.com |

> ⚠️ **PostgreSQL tidak perlu diinstall manual.** Database dijalankan lewat Docker Compose yang sudah disediakan di proyek ini.

Cek instalasi:
```bash
node --version    # harus v20.x atau lebih
docker --version  # harus muncul versi Docker
git --version     # harus muncul versi Git
```

---

## 🚀 Setup dari Awal

### Step 1 — Buka Docker Desktop

Buka aplikasi **Docker Desktop** di komputer kamu.

Tunggu sampai status di pojok kiri bawah berubah jadi **"Engine running"** dengan ikon paus hijau ✅.

> ❌ Jangan skip! Kalau Docker belum jalan, semua perintah database akan error.

---

### Step 2 — Clone Repository

Buka terminal (PowerShell / CMD / Git Bash), lalu jalankan:

```bash
git clone https://github.com/FigoRazzan/Sistem-Pos-GAS-LPG.git
cd Sistem-Pos-GAS-LPG/web-gas
```

---

### Step 3 — Install Dependencies

```bash
npm install
```

> Tunggu sampai selesai (biasanya 1–3 menit). Jangan tutup terminal.

---

### Step 4 — Taruh File `.env`

File `.env` sudah dibagikan lewat **grup WhatsApp**. Langkah-langkahnya:

1. Download file `.env` dari pesan grup WA
2. Taruh di dalam folder `web-gas/` — **sejajar dengan `package.json`**
3. Jangan rename, biarkan tetap bernama `.env`

Struktur yang benar:
```
web-gas/
├── .env              ✅ ← di sini
├── docker-compose.yml
├── package.json
├── next.config.ts
└── ...
```

> ⚠️ Kalau `.env` tidak ada atau salah tempat, aplikasi tidak bisa nyambung ke database.

---

### Step 5 — Jalankan Database (Docker)

Di dalam folder `web-gas/`, jalankan perintah berikut untuk menghidupkan database PostgreSQL:

```bash
docker compose up -d
```

Penjelasan flag:
- `up` → nyalakan container
- `-d` → jalankan di background (detached), terminal tetap bisa dipakai

Cek apakah container sudah jalan:
```bash
docker compose ps
```

Output yang benar:
```
NAME            STATUS
web_gas_db      running
```

> ✅ Database PostgreSQL sekarang sudah berjalan di port `5432`.

**Perintah Docker lainnya yang berguna:**

```bash
# Matikan database (saat sudah selesai kerja)
docker compose down

# Lihat log database
docker compose logs db

# Restart database
docker compose restart db

# Hapus database + semua data (HATI-HATI!)
docker compose down -v
```

---

### Step 6 — Sinkronisasi Schema Database

Push schema Prisma ke database dan generate Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

Output yang benar:
```
🚀  Your database is now in sync with your Prisma schema.
✔  Generated Prisma Client
```

> ❌ Kalau muncul error **"Connection refused"** → Docker belum jalan, kembali ke Step 1 & 5.

---

### Step 7 — Jalankan Aplikasi

```bash
npm run dev
```

Buka browser:
```
http://localhost:3000
```

🎉 Aplikasi sudah berjalan!

---

### Ringkasan Perintah (Urutan Lengkap)

```bash
# 1. Buka Docker Desktop terlebih dahulu (manual, klik ikon di taskbar)

# 2. Clone & masuk folder
git clone https://github.com/FigoRazzan/Sistem-Pos-GAS-LPG.git
cd Sistem-Pos-GAS-LPG/web-gas

# 3. Install packages
npm install

# 4. Taruh .env dari grup WA ke folder ini

# 5. Jalankan database
docker compose up -d

# 6. Sinkronisasi schema
npx prisma db push
npx prisma generate

# 7. Jalankan aplikasi
npm run dev
```

---

## 📖 Panduan Penggunaan

### 👤 Register & Login

1. Buka `http://localhost:3000/login`
2. Klik **"Buat Akun"** → daftar **2 akun berbeda**:
   - Akun **Supplier** → pilih *"Supplier Gas"*
   - Akun **Agen** → pilih *"Agen Gas"*
3. Login dengan akun yang sudah dibuat

---

### 🏭 Alur Supplier

1. Login → **Dashboard → Produk** → Tambah produk gas
2. Tunggu Agen order

Saat ada transaksi:
- **Transfer Manual** → Dashboard → Transaksi → Validasi pembayaran
- **Cash** → Dashboard → Deteksi Uang Palsu → Upload foto → AI analisis otomatis
- **Midtrans** → Status otomatis update

Laporan: Dashboard → Laporan Pajak → Download PDF

---

### 🛒 Alur Agen

1. Login → **Katalog Gas** → pilih produk → Detail
2. Pilih metode bayar → Buat Pesanan
3. Pantau status di Dashboard → Transaksi
4. Setelah selesai → beri rating & ulasan

---

### 🤖 Cara Kerja Deteksi Uang Palsu

1. Buka **Dashboard → Deteksi Uang Palsu** (khusus Supplier)
2. Upload foto atau gunakan kamera
3. Klik **"Deteksi Sekarang"**
4. AI menganalisis:
   - **≥60% confidence** → ✅ ASLI → transaksi otomatis Siap Kirim
   - **<60% confidence** → 🚨 PALSU → transaksi ditandai tidak valid

---

## 🛠 Script Utilitas

### Reset Semua Transaksi

Hapus semua transaksi, rating, dan deteksi untuk mulai dari awal:

```bash
node reset-transactions.js
```

> ⚠️ **Permanen!** Data yang dihapus tidak bisa dikembalikan.

---

## 🐛 Troubleshooting

### ❌ `docker compose` tidak dikenal / "command not found"

**Penyebab:** Docker Desktop belum dibuka atau belum selesai loading.

**Solusi:**
1. Buka aplikasi **Docker Desktop**
2. Tunggu sampai status **"Engine running"** (pojok kiri bawah, ikon paus hijau)
3. Coba lagi perintahnya

> Catatan: gunakan `docker compose` (spasi, bukan `-`). Docker Desktop versi baru sudah include Compose v2.

---

### ❌ Error: `Connection refused` saat `prisma db push`

**Penyebab:** Database (Docker container) belum jalan.

**Solusi:**
```bash
# Pastikan container jalan
docker compose ps

# Kalau belum jalan, start dulu
docker compose up -d

# Lalu coba lagi
npx prisma db push
```

---

### ❌ Error: `port 5432 already in use`

**Penyebab:** Ada aplikasi lain yang pakai port 5432 (biasanya PostgreSQL yang terinstall local).

**Solusi:** Stop service PostgreSQL lokal terlebih dahulu, lalu jalankan ulang Docker:
```bash
# Windows (PowerShell, run as Admin)
Stop-Service postgresql*

# Lalu
docker compose up -d
```

---

### ❌ Error: `PrismaClientInitializationError`

**Penyebab:** Prisma tidak bisa konek ke database.

**Cek satu per satu:**
1. Docker Desktop sudah buka? → `docker compose ps`
2. Container `web_gas_db` statusnya `running`?
3. File `.env` ada di folder `web-gas/` dan isinya benar?
4. `DATABASE_URL` di `.env` sesuai dengan `docker-compose.yml`?

---

### ❌ Error: `Can't resolve 'tailwindcss'`

**Solusi:** Restart dev server:
```bash
# Ctrl+C untuk stop, lalu:
npm run dev
```

---

### ❌ AI selalu "tidak terdeteksi"

**Tips foto yang baik:**
- Cahaya cukup, tidak gelap atau silau
- Uang mengisi hampir seluruh frame
- Foto tidak buram / tidak gerak
- Format JPG/PNG, ukuran minimal 640×480px

---

## 📁 Struktur Folder

```
web-gas/
├── docker-compose.yml         # Konfigurasi database Docker
├── prisma/
│   └── schema.prisma          # Definisi tabel database
├── public/
│   ├── deteksi_uang_palsu/    # Foto upload AI (auto-created)
│   └── bukti_transfer/        # Foto bukti bayar (auto-created)
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Semua halaman dashboard
│   │   ├── actions/           # Server Actions (logika backend)
│   │   ├── login/             # Halaman login & register
│   │   └── products/          # Katalog produk
│   ├── components/
│   │   ├── Toast.tsx          # Notifikasi toast
│   │   ├── ToastProvider.tsx  # Context provider toast
│   │   └── ConfirmDialog.tsx  # Modal konfirmasi
│   └── lib/
│       ├── prisma.ts          # Inisialisasi Prisma
│       ├── auth.ts            # Konfigurasi NextAuth
│       └── midtrans.ts        # Konfigurasi Midtrans
├── .env                       # Environment variables (dari grup WA)
├── reset-transactions.js      # Script reset data
└── README.md
```

---

<div align="center">
  <sub>Built with ❤️ — Next.js 16 · PostgreSQL · Docker · Prisma · Roboflow AI · Midtrans</sub>
</div>
