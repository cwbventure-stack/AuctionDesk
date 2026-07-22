"use server";

import { hashPassword, requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Cross-tenant support actions for AuctionDesk staff.
//
// These are the only queries in the app that intentionally reach across
// dealerships, so each one gates on requireSuperAdmin first and nothing here is
// reachable from the dealership UI. Support can reset a password to get an owner
// back in, but cannot read one — hashes are one-way and never returned.

export interface AdminResult {
  error?: string;
}

/** Sets a new password for any user and signs out their existing sessions. */
export async function adminResetPassword(userId: string, password: string): Promise<AdminResult> {
  await requireSuperAdmin();

  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { error: "No such user." };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    }),
    // A reset should end any session opened with the old password.
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  revalidatePath("/admin");
  return {};
}

/** Promotes or demotes a user within their own dealership. */
export async function adminSetRole(userId: string, nextRole: string): Promise<AdminResult> {
  const admin = await requireSuperAdmin();
  if (nextRole !== "owner" && nextRole !== "staff") return { error: "Pick a role." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, dealershipId: true, role: true },
  });
  if (!user) return { error: "No such user." };
  if (user.id === admin.id && nextRole !== "owner") {
    return { error: "You can't change your own role." };
  }

  if (user.role === "owner" && nextRole === "staff") {
    const owners = await prisma.user.count({
      where: { dealershipId: user.dealershipId, role: "owner" },
    });
    if (owners <= 1) return { error: "That dealership needs at least one owner." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: nextRole } });

  revalidatePath("/admin");
  return {};
}

/** Ends every active session for a user — the "lock them out now" button. */
export async function adminSignOutUser(userId: string): Promise<AdminResult> {
  await requireSuperAdmin();

  const { count } = await prisma.session.deleteMany({ where: { userId } });

  revalidatePath("/admin");
  return count === 0 ? { error: "That user had no active sessions." } : {};
}
