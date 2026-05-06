# Sistem-Pos-GAS-LPG (web-gas)

Sistem Informasi Manajemen Pemesanan Gas LPG berbasis web (fullstack Next.js). Aplikasi ini memfasilitasi transaksi Gas LPG antara Supplier Gas dan Agen Pengecer.

## Fitur Utama
- Role system: Supplier (role 1) dan Agen (role 2).
- Katalog produk, checkout, upload bukti pembayaran, dan rating.
- App Router (Next.js) untuk UI dan API.
- Prisma ORM + PostgreSQL.
- Autentikasi NextAuth.
- Ekspor PDF invoice transaksi.

## Fitur Tambahan
- Pembayaran via payment gateway Midtrans untuk Agen saat checkout.
- Slip pajak otomatis dalam bentuk PDF (berdasarkan transaksi/pendapatan).
- Deteksi uang palsu untuk pembayaran cash: opsi kamera atau upload foto, plus menu cek manual.

## Prasyarat
- Node.js 20+ (atau 18.17+).
- PostgreSQL.
- Git (opsional, untuk clone repo).

## Setup Lokal (Development)
1) Clone dan masuk folder project:
```bash
git clone https://github.com/FigoRazzan/Sistem-Pos-GAS-LPG.git
cd Sistem-Pos-GAS-LPG/web-gas
```

2) Install dependencies:
```bash
npm install
```

3) Minta file `.env` di grup, lalu taruh di root folder `web-gas`.

4) Buat database kosong di PostgreSQL (contoh: `db_webgas`).

5) Sinkronisasi database dan generate Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

6) Jalankan dev server:
```bash
npm run dev
```

7) Buka aplikasi di browser:
```
http://localhost:3000
```

Catatan: Jika mengubah `next.config.ts`, restart dev server (Ctrl+C lalu `npm run dev`).

## Alur Tes Cepat
1) Buka `http://localhost:3000/login`.
2) Register 2 akun:
   - Akun 1 sebagai Supplier (role 1)
   - Akun 2 sebagai Agen (role 2)
3) Login Supplier -> Dashboard -> Produk -> tambah produk.
4) Login Agen -> Sidebar -> Katalog Gas (Beli) -> checkout -> upload bukti.

## Build Production (Opsional)
```bash
npm run build
npm start
```

## Troubleshooting
- Jika gagal konek DB, pastikan PostgreSQL aktif dan `DATABASE_URL` benar.
- Jika NextAuth error, pastikan `NEXTAUTH_SECRET` terisi dan restart dev server.
- Upload bukti pembayaran dibatasi sampai 5MB per file.
