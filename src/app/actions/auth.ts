"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const fullname = formData.get("fullname") as string;
  const gender = parseInt(formData.get("gender") as string);
  const status = parseInt(formData.get("status") as string);
  const nomorTelepon = formData.get("nomorTelepon") as string;
  const alamat = formData.get("alamat") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  if (!email || !fullname || !gender || !status || !nomorTelepon || !alamat || !password) {
    return { error: "Semua kolom wajib diisi" };
  }

  if (password !== password_confirmation) {
    return { error: "Password konfirmasi tidak cocok" };
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        fullname,
        email,
        alamat,
        nomorTelepon,
        status,
        gender,
        password: hashedPassword,
      }
    });

    return { success: true, message: "Akun berhasil dibuat. Silakan login!" };
  } catch (error) {
    console.error("Error register:", error);
    return { error: "Terjadi kesalahan saat membuat akun" };
  }
}
