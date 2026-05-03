"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const fullname = formData.get("fullname") as string;
  const alamat = formData.get("alamat") as string;
  const nomorTelepon = formData.get("nomorTelepon") as string;

  try {
    await prisma.users.update({
      where: { id: BigInt(session.user.id) },
      data: { fullname, alamat, nomorTelepon }
    });

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Gagal memperbarui profil" };
  }
}

export async function changePassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Password baru dan konfirmasi password tidak cocok" };
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.user.id) }
    });

    if (!user) return { error: "User tidak ditemukan" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Password saat ini salah!" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.users.update({
      where: { id: BigInt(session.user.id) },
      data: { password: hashedPassword }
    });

    return { success: true, message: "Password berhasil diubah!" };
  } catch (error) {
    console.error("Error change password:", error);
    return { error: "Gagal mengubah password" };
  }
}