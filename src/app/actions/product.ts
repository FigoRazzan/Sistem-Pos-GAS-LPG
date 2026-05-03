"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) {
    return { error: "Hanya Supplier yang dapat menambah produk" };
  }

  const namaProduk = formData.get("namaProduk") as string;
  const hargaProduk = parseInt(formData.get("hargaProduk") as string);
  const stokProduk = parseInt(formData.get("stokProduk") as string);
  const jenisProduk = parseInt(formData.get("jenisProduk") as string);

  if (!namaProduk || !hargaProduk || !stokProduk || !jenisProduk) {
    return { error: "Semua kolom wajib diisi" };
  }

  try {
    await prisma.products.create({
      data: {
        namaProduk,
        hargaProduk,
        stokProduk,
        jenisProduk,
        produkTerjual: 0,
        user_id: BigInt(session.user.id),
      }
    });

    revalidatePath("/dashboard/products");
    return { success: true, message: "Produk berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error create product:", error);
    return { error: "Gagal menambahkan produk" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) {
    return { error: "Akses ditolak" };
  }

  const namaProduk = formData.get("namaProduk") as string;
  const hargaProduk = parseInt(formData.get("hargaProduk") as string);
  const stokProduk = parseInt(formData.get("stokProduk") as string);
  const jenisProduk = parseInt(formData.get("jenisProduk") as string);

  try {
    const product = await prisma.products.findUnique({ where: { id: BigInt(id) } });
    if (!product || product.user_id !== BigInt(session.user.id)) {
      return { error: "Produk tidak ditemukan atau bukan milik Anda" };
    }

    await prisma.products.update({
      where: { id: BigInt(id) },
      data: { namaProduk, hargaProduk, stokProduk, jenisProduk }
    });

    revalidatePath("/dashboard/products");
    return { success: true, message: "Produk berhasil diperbarui!" };
  } catch (error) {
    console.error("Error update product:", error);
    return { error: "Gagal memperbarui produk" };
  }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) return { error: "Akses ditolak" };

  try {
    const product = await prisma.products.findUnique({ where: { id: BigInt(id) } });
    if (!product || product.user_id !== BigInt(session.user.id)) {
      return { error: "Produk tidak ditemukan atau bukan milik Anda" };
    }

    await prisma.products.delete({ where: { id: BigInt(id) } });
    revalidatePath("/dashboard/products");
    return { success: true, message: "Produk berhasil dihapus!" };
  } catch (error) {
    console.error("Error delete product:", error);
    return { error: "Gagal menghapus produk" };
  }
}
