"use server";

import { hashPassword, requireOwner, type Role } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Owner-only management of the people inside one dealership.
//
// Every action re-derives the acting owner from the session and filters target
// users by that owner's dealershipId, so a tampered userId from another tenant
// matches zero rows. isSuperAdmin is never writable here — platform access is
// not something a dealership can grant itself.

export interface TeamResult {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asRole = (value: string): Role | null =>
  value === "owner" || value === "staff" ? value : null;

/** Finds a user in the acting owner's dealership, or null. */
async function memberOf(dealershipId: string, userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, dealershipId },
    select: { id: true, role: true },
  });
}

async function ownerCount(dealershipId: string) {
  return prisma.user.count({ where: { dealershipId, role: "owner" } });
}

export async function addTeamMember(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<TeamResult> {
  const owner = await requireOwner();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const role = asRole(input.role);

  if (!name || !email || !input.password) return { error: "Please fill in every field." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (input.password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!role) return { error: "Pick a role." };

  // Emails are unique across the whole app, not just this lot.
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "An account with that email already exists." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(input.password),
      role,
      dealershipId: owner.dealershipId,
    },
  });

  revalidatePath("/app/settings");
  return {};
}

export async function updateTeamMemberRole(userId: string, nextRole: string): Promise<TeamResult> {
  const owner = await requireOwner();
  const role = asRole(nextRole);
  if (!role) return { error: "Pick a role." };

  const member = await memberOf(owner.dealershipId, userId);
  if (!member) return { error: "That person isn't on your team." };

  // Demoting yourself, or the last owner, would leave the lot with nobody who
  // can manage it — including nobody who can undo the change.
  if (member.id === owner.id && role !== "owner") {
    return { error: "You can't change your own role." };
  }
  if (member.role === "owner" && role === "staff" && (await ownerCount(owner.dealershipId)) <= 1) {
    return { error: "Your dealership needs at least one owner." };
  }

  await prisma.user.update({ where: { id: member.id }, data: { role } });

  revalidatePath("/app/settings");
  return {};
}

export async function removeTeamMember(userId: string): Promise<TeamResult> {
  const owner = await requireOwner();

  const member = await memberOf(owner.dealershipId, userId);
  if (!member) return { error: "That person isn't on your team." };

  if (member.id === owner.id) return { error: "You can't remove yourself." };
  if (member.role === "owner" && (await ownerCount(owner.dealershipId)) <= 1) {
    return { error: "Your dealership needs at least one owner." };
  }

  // Sessions cascade with the user, so removal signs them out everywhere.
  await prisma.user.delete({ where: { id: member.id } });

  revalidatePath("/app/settings");
  return {};
}
