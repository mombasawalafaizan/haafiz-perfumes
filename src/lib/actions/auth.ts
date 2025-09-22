// lib/actions/auth.ts
"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  return jar.get("admin-authenticated")?.value === "true";
}

export async function authenticateAdmin(formData: FormData) {
  const password = formData.get("password") as string;
  const passwordHash = hashPassword(password);
  const storedHash = process.env.ADMIN_PASSWORD_HASH!;

  if (passwordHash !== storedHash) {
    return {
      success: false,
      message: "Invalid password",
    };
  }

  const jar = await cookies();

  // Set simple authentication cookie
  jar.set("admin-authenticated", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  redirect("/admin/dashboard");
  return {
    success: true,
    message: "Login successful",
  };
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete("admin-authenticated");
  redirect("/admin/login");
}
