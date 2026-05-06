/**
 * reset-transactions.js
 * Script untuk menghapus semua data transaksi, rating, dan deteksi uang.
 * Jalankan: node reset-transactions.js
 */

require("dotenv/config");

const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⚠️  Reset Data Transaksi");
  console.log("========================");
  console.log("Ini akan menghapus SEMUA data:");
  console.log("  - ratings");
  console.log("  - cash_detections");
  console.log("  - transactions");
  console.log("");

  // Hapus berurutan sesuai foreign key dependency
  const deletedRatings = await prisma.ratings.deleteMany({});
  console.log(`✅ Ratings dihapus    : ${deletedRatings.count} record`);

  const deletedDetections = await prisma.cash_detections.deleteMany({});
  console.log(`✅ Cash detections    : ${deletedDetections.count} record`);

  const deletedTx = await prisma.transactions.deleteMany({});
  console.log(`✅ Transactions       : ${deletedTx.count} record`);

  // Reset produkTerjual ke 0
  const resetProducts = await prisma.products.updateMany({
    data: { produkTerjual: 0 },
  });
  console.log(`✅ produkTerjual reset: ${resetProducts.count} produk`);

  console.log("");
  console.log("🎉 Semua transaksi berhasil dihapus. Siap mulai dari awal!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
