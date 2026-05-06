# 🔥 WEB-GAS — Sistem Informasi Manajemen Pemesanan Gas LPG

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Midtrans](https://img.shields.io/badge/Midtrans-Payment-003366?style=for-the-badge)
![Roboflow](https://img.shields.io/badge/Roboflow-AI-purple?style=for-the-badge)

**Aplikasi web fullstack untuk manajemen transaksi Gas LPG antara Supplier dan Agen, dilengkapi AI deteksi uang palsu dan payment gateway.**

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Lengkap](#-fitur-lengkap)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Setup dari Awal](#-setup-dari-awal)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Jalankan Aplikasi](#-jalankan-aplikasi)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Script Utilitas](#-script-utilitas)
- [Troubleshooting](#-troubleshooting)
- [Build Production](#-build-production)

---

## 🧾 Tentang Proyek

**WEB-GAS** adalah sistem informasi manajemen pemesanan gas LPG berbasis web yang menghubungkan dua aktor utama:

| Aktor | Role | Akses |
|-------|------|-------|
| **Supplier Gas** | Role 1 | Kelola produk, validasi pembayaran, laporan pajak, deteksi uang palsu |
| **Agen Pengecer** | Role 2 | Browse katalog, checkout, upload bukti bayar, rating produk |

Proyek ini dibuat sebagai Tugas Akhir Semester 8 mata kuliah **Teknologi Enterprise (TE)** di **ITENAS Bandung**.

---

## ✨ Fitur Lengkap

### 🛒 Manajemen Transaksi
- Agen bisa browse katalog produk gas (3Kg, 12Kg, Bright Gas 5Kg & 12Kg)
- Checkout dengan 3 metode pembayaran: **Transfer Manual**, **Bayar di Tempat (Cash)**, **Midtrans (Online)**
- Upload bukti pembayaran (untuk transfer manual)
- Supplier bisa validasi/tolak bukti pembayaran
- Rating & ulasan produk setelah transaksi selesai
- Download invoice PDF per transaksi

### 📦 Manajemen Produk
- Supplier bisa tambah, edit, hapus produk
- Stok produk otomatis berkurang saat order dibuat
- Filter produk berdasarkan jenis gas

### 💳 Payment Gateway (Midtrans)
- Integrasi penuh dengan Midtrans Snap
- Support berbagai metode: QRIS, VA, e-wallet, dll.
- Status pembayaran otomatis sync dari Midtrans

### 🤖 AI Deteksi Uang Palsu
- Upload foto uang / ambil via kamera
- Analisis otomatis menggunakan model **Roboflow** (`deteksi-rupiah-ryiwz`)
- Threshold: confidence ≥60% → **ASLI** ✅, <60% → **PALSU** 🚨
- Confidence score ditampilkan dengan progress bar visual
- Jika uang ASLI → status transaksi otomatis berubah ke **Siap Kirim**
- Fitur **drag & drop** untuk upload foto

### 🧾 Laporan Pajak
- Rekap pajak PPN 11% per bulan (per supplier)
- Faktur pajak per transaksi
- Download sebagai PDF (format A4, tidak terpotong)
- Slip pajak bulanan untuk e-Billing

### 🔔 Sistem Notifikasi (Toast)
- Semua notifikasi menggunakan custom Toast UI (bukan browser alert)
- Tipe: success ✅, error ❌, warning ⚠️, info ℹ️
- Posisi: pojok kanan atas, durasi 6.5 detik
- Confirm dialog modal menggantikan window.confirm()

### 🔐 Autentikasi
- Login & Register di satu halaman dengan animasi slide
- NextAuth.js dengan Credentials Provider
- Session management otomatis
- Role-based access control (Supplier vs Agen)

---

## 🛠 Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Bahasa** | TypeScript |
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma 7 (dengan `@prisma/adapter-pg`) |
| **Auth** | NextAuth.js |
| **Styling** | Tailwind CSS |
| **PDF** | jsPDF + html2canvas |
| **Payment** | Midtrans Snap |
| **AI / CV** | Roboflow (deteksi-rupiah-ryiwz) |
| **HTTP Client** | Axios |

---

## 💻 Prasyarat

Pastikan sudah terinstall di komputer kamu:

| Software | Versi Minimum | Cek dengan |
|----------|--------------|------------|
| **Node.js** | 20+ (atau 18.17+) | `node --version` |
| **npm** | 9+ | `npm --version` |
| **PostgreSQL** | 15+ | `psql --version` |
| **Git** | Bebas | `git --version` |

> 💡 Download Node.js: https://nodejs.org  
> 💡 Download PostgreSQL: https://www.postgresql.org/download/

---

## 🚀 Setup dari Awal

> 🐳 **PENTING — Nyalakan Docker terlebih dahulu!**  
> Database PostgreSQL pada proyek ini berjalan di dalam **Docker container**.  
> Pastikan **Docker Desktop** sudah terbuka dan berjalan sebelum menjalankan aplikasi.  
> Kalau Docker belum nyala, aplikasi akan gagal konek ke database.
>
> Download Docker Desktop: https://www.docker.com/products/docker-desktop/

### Step 1 — Clone Repository

```bash
git clone https://github.com/FigoRazzan/Sistem-Pos-GAS-LPG.git
cd Sistem-Pos-GAS-LPG/web-gas
```

### Step 2 — Install Dependencies

```bash
npm install
```

> Proses ini menginstall semua package yang dibutuhkan (~511 packages). Tunggu sampai selesai.

### Step 3 — Buat Database PostgreSQL

Buka terminal PostgreSQL atau pgAdmin, lalu buat database baru:

```sql
CREATE DATABASE web_gas;
```

Atau via terminal:
```bash
psql -U postgres -c "CREATE DATABASE web_gas;"
```

### Step 4 — Buat File `.env`

Buat file bernama `.env` di dalam folder `web-gas/` (bukan di luar), lalu isi dengan:

```env
# === DATABASE ===
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/web_gas?schema=public"

# === NEXTAUTH ===
NEXTAUTH_SECRET="isi-dengan-string-random-bebas"
NEXTAUTH_URL="http://localhost:3000"

# === ROBOFLOW AI (Deteksi Uang Palsu) ===
ROBOFLOW_API_KEY=your_roboflow_api_key_here
ROBOFLOW_MODEL_URL=https://serverless.roboflow.com/nama-model/versi

# === MIDTRANS (Payment Gateway) ===
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

> ⚠️ **Ganti** `USERNAME` dan `PASSWORD` sesuai konfigurasi PostgreSQL kamu.  
> ⚠️ `NEXTAUTH_SECRET` bisa diisi string bebas, contoh: `super-secret-web-gas-2026`  
> 📦 **File `.env` lengkap dengan isi API key yang benar sudah dibagikan lewat grup WhatsApp.**  
> Cukup download dari grup, taruh di folder `web-gas/`, dan langsung jalankan.

### Step 5 — Sinkronisasi Database

Push schema Prisma ke database dan generate Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

> ✅ Jika berhasil, semua tabel akan otomatis terbuat di database `web_gas`.

### Step 6 — Jalankan Aplikasi

```bash
npm run dev
```

Buka browser dan akses:
```
http://localhost:3000
```

---

## ⚙️ Konfigurasi Environment

Penjelasan detail setiap variabel di `.env`:

| Variabel | Keterangan | Contoh |
|----------|------------|--------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://root:pass@localhost:5432/web_gas?schema=public` |
| `NEXTAUTH_SECRET` | Secret key untuk enkripsi session (bebas diisi apa saja) | `super-secret-123` |
| `NEXTAUTH_URL` | URL aplikasi (untuk development: localhost:3000) | `http://localhost:3000` |
| `ROBOFLOW_API_KEY` | API key akun Roboflow | `BNR8eLp3OVrAvx7U1R2M` |
| `ROBOFLOW_MODEL_URL` | URL model deteksi uang Roboflow | `https://serverless.roboflow.com/deteksi-rupiah-ryiwz/1` |
| `MIDTRANS_SERVER_KEY` | Server key Midtrans (jangan expose ke frontend!) | `Mid-server-xxxx` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client key Midtrans (aman untuk frontend) | `Mid-client-xxxx` |
| `MIDTRANS_IS_PRODUCTION` | `false` = sandbox/testing, `true` = production | `false` |

> 🔒 **Jangan commit file `.env` ke Git!** File ini sudah ada di `.gitignore`.

---

## ▶️ Jalankan Aplikasi

### Development (Lokal)

```bash
npm run dev
```

Aplikasi berjalan di: `http://localhost:3000`

> ⚠️ Jika mengubah file `.env`, **restart dev server** (Ctrl+C → `npm run dev`)

### Cek TypeScript (Opsional)

```bash
npx tsc --noEmit
```

> Tidak ada output = tidak ada error TypeScript ✅

---

## 📖 Panduan Penggunaan

### 👤 Daftar & Login

1. Buka `http://localhost:3000/login`
2. Klik **"Buat Akun"** untuk register
3. Daftar **2 akun** berbeda:
   - **Akun Supplier**: pilih *"Supplier Gas"* saat mendaftar
   - **Akun Agen**: pilih *"Agen Gas"* saat mendaftar
4. Login dengan akun yang sudah didaftarkan

---

### 🏭 Alur Supplier Gas

1. Login sebagai Supplier
2. Buka **Dashboard → Produk**
3. Klik **"Tambah Produk"** → isi nama, harga, stok, jenis gas
4. Tunggu Agen melakukan pemesanan

Saat ada transaksi masuk:
- Untuk **Transfer Manual**: Buka **Transaksi** → klik "Validasi Pembayaran" → cek bukti → terima/tolak
- Untuk **Cash**: Buka **Deteksi Uang Palsu** → upload foto uang → AI otomatis analisis
- Untuk **Midtrans**: Status otomatis update setelah pembayaran selesai

Laporan keuangan:
- Buka **Laporan Pajak** → pilih bulan/tahun → download Slip Pajak atau Faktur Pajak (PDF)

---

### 🛒 Alur Agen Gas

1. Login sebagai Agen
2. Buka **Katalog Gas** (dari sidebar atau `http://localhost:3000/products`)
3. Pilih produk → klik **"Detail"**
4. Pilih metode pembayaran:
   - **Transfer Manual** → upload bukti transfer setelah order dibuat
   - **Bayar di Tempat (Cash)** → bayar langsung ke supplier
   - **Midtrans** → bayar online via QRIS/VA/e-wallet
5. Pantau status order di **Dashboard → Transaksi**
6. Setelah selesai → berikan **rating & ulasan**

---

### 🤖 Cara Kerja Deteksi Uang Palsu (Khusus Supplier)

1. Pastikan transaksi menggunakan metode **Bayar di Tempat (Cash)**
2. Buka **Dashboard → Deteksi Uang Palsu** (atau dari link di halaman transaksi)
3. Pilih metode:
   - **Upload Foto**: klik area atau drag & drop file gambar (JPG/PNG, maks 5MB)
   - **Gunakan Kamera**: akses kamera browser → klik "Ambil Foto"
4. Klik **"Deteksi Sekarang"**
5. AI akan menganalisis dan menampilkan:
   - **Status**: ASLI ✅ atau PALSU 🚨
   - **Confidence**: persentase keyakinan AI (misal: 87%)
   - **Progress bar**: visualisasi confidence (hijau = asli, merah = palsu)
6. Jika ASLI → status transaksi **otomatis** berubah ke "Siap Kirim"
7. Jika PALSU → transaksi ditandai "Pembayaran Tidak Valid"

**Logika AI:**
```
Confidence ≥ 60%  →  ✅ ASLI   (transaksi dilanjutkan)
Confidence < 60%  →  🚨 PALSU  (transaksi dibatalkan)
```

---

## 🛠 Script Utilitas

### Reset Semua Transaksi

Hapus semua data transaksi, rating, dan deteksi untuk mulai dari awal:

```bash
node reset-transactions.js
```

Output:
```
✅ Ratings dihapus    : X record
✅ Cash detections    : X record  
✅ Transactions       : X record
✅ produkTerjual reset: X produk

🎉 Semua transaksi berhasil dihapus. Siap mulai dari awal!
```

> ⚠️ **Hati-hati!** Script ini **menghapus permanen** semua data transaksi.

---

## 🐛 Troubleshooting

### ❌ Error: `Can't resolve 'tailwindcss'`

Turbopack salah detect workspace root. Pastikan `next.config.ts` sudah ada:

```ts
turbopack: {
  root: path.resolve(__dirname),
},
```

Jika belum ada, tambahkan manual atau restart dev server.

---

### ❌ Error: `PrismaClientInitializationError` / Gagal konek database

**Penyebab 1 — Docker belum dibuka:**
> Proyek ini menggunakan Docker untuk menjalankan PostgreSQL.  
> Buka **Docker Desktop** terlebih dahulu, tunggu sampai statusnya **"Running"**, lalu jalankan ulang `npm run dev`.

**Penyebab 2 — Konfigurasi `.env` salah:**
1. Cek `DATABASE_URL` di `.env` sudah benar
2. Pastikan nama database, username, dan password sesuai

---

### ❌ Error: `ENOENT: no such file or directory` saat upload

**Penyebab**: Folder `public/deteksi_uang_palsu/` atau `public/bukti_transfer/` belum ada.

**Solusi**: Folder dibuat otomatis saat pertama kali upload. Jika error, buat manual:

```bash
mkdir -p public/deteksi_uang_palsu
mkdir -p public/bukti_transfer
```

---

### ❌ AI selalu bilang "tidak terdeteksi"

**Penyebab**: Model Roboflow belum bisa mendeteksi pola uang di foto.

**Tips**:
- Pastikan foto jelas, terang, dan tidak buram
- Foto uang dari jarak dekat (isi penuh frame)
- Format JPG/PNG, ukuran cukup besar (minimal 640×480 px)
- Pastikan `ROBOFLOW_API_KEY` dan `ROBOFLOW_MODEL_URL` di `.env` sudah benar

---

### ❌ NextAuth error / tidak bisa login

**Solusi**:
1. Pastikan `NEXTAUTH_SECRET` terisi di `.env`
2. Pastikan `NEXTAUTH_URL` sesuai (`http://localhost:3000` untuk local)
3. Restart dev server setelah ubah `.env`

---

### ❌ Midtrans tidak muncul saat checkout

**Solusi**:
1. Pastikan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` terisi
2. Pastikan `MIDTRANS_IS_PRODUCTION=false` untuk mode sandbox
3. Gunakan akun sandbox Midtrans: https://sandbox.midtrans.com

---

### ❌ PDF terpotong saat di-print

Sudah di-fix! PDF menggunakan format A4 mm dengan margin 10mm. Jika masih terpotong, coba generate ulang.

---

## 📦 Build Production

Untuk deploy ke server production:

```bash
# Build
npm run build

# Jalankan
npm start
```

> ⚠️ Sebelum build production, pastikan:
> - `MIDTRANS_IS_PRODUCTION=true` (jika sudah production)
> - `NEXTAUTH_URL` diisi dengan domain production (misal: `https://webgas.example.com`)
> - Database production sudah di-migrate

---

## 📁 Struktur Folder Penting

```
web-gas/
├── prisma/
│   └── schema.prisma          # Definisi tabel database
├── public/
│   ├── deteksi_uang_palsu/    # Foto upload deteksi uang (auto-created)
│   ├── bukti_transfer/        # Foto bukti pembayaran (auto-created)
│   └── asset-img/             # Asset gambar statis
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Semua halaman dashboard (Supplier & Agen)
│   │   │   ├── dashboard/
│   │   │   │   ├── products/          # Manajemen produk
│   │   │   │   ├── transactions/      # Manajemen transaksi
│   │   │   │   ├── deteksi-uang-palsu/ # AI deteksi uang
│   │   │   │   └── laporan-pajak/     # Laporan & PDF pajak
│   │   │   └── layout.tsx             # Layout dashboard (sidebar + header)
│   │   ├── actions/           # Server Actions (logika backend)
│   │   │   ├── transaction.ts         # CRUD transaksi
│   │   │   ├── cashDetection.ts       # Deteksi uang + Roboflow AI
│   │   │   ├── product.ts             # CRUD produk
│   │   │   ├── auth.ts                # Register user
│   │   │   └── rating.ts              # Submit rating
│   │   ├── login/             # Halaman login & register
│   │   ├── products/          # Katalog produk (publik + checkout)
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── Toast.tsx          # Komponen toast notification
│   │   ├── ToastProvider.tsx  # Context provider untuk toast
│   │   ├── ConfirmDialog.tsx  # Modal konfirmasi (pengganti window.confirm)
│   │   ├── Sidebar.tsx        # Sidebar navigasi
│   │   └── Header.tsx         # Header dashboard
│   └── lib/
│       ├── prisma.ts          # Inisialisasi Prisma Client
│       ├── auth.ts            # Konfigurasi NextAuth
│       └── midtrans.ts        # Konfigurasi Midtrans
├── .env                       # Environment variables (JANGAN di-commit!)
├── next.config.ts             # Konfigurasi Next.js + Turbopack
├── prisma.config.ts           # Konfigurasi Prisma
├── reset-transactions.js      # Script reset data transaksi
└── README.md                  # File ini
```

---

## 🤝 Kontribusi

Proyek ini adalah tugas akademik. Untuk pertanyaan teknis, hubungi:

- **Repository**: [github.com/FigoRazzan/Sistem-Pos-GAS-LPG](https://github.com/FigoRazzan/Sistem-Pos-GAS-LPG)
- **Institusi**: ITENAS Bandung — Teknik Informatika, Semester 8

---

<div align="center">
  <sub>Built with ❤️ using Next.js 16 + PostgreSQL + Prisma + Roboflow AI</sub>
</div>
