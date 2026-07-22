"use server";

import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export interface AuthResult {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  // Same message either way so we don't reveal which emails exist.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match." };
  }

  await createSession(user.id);
  redirect("/app");
}

export async function signup(input: {
  dealershipName: string;
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const dealershipName = input.dealershipName.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!dealershipName || !name || !email || !input.password) {
    return { error: "Please fill in every field." };
  }
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (input.password.length < 8) return { error: "Password must be at least 8 characters." };

  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "An account with that email already exists." };
  }

  // Public inventory lives at /lot/<slug>, so slugs must be unique across tenants.
  const base = slugify(dealershipName) || "dealership";
  let slug = base;
  for (let i = 2; await prisma.dealership.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  const dealership = await prisma.dealership.create({
    data: { name: dealershipName, slug },
  });

  // Sensible starting hours so scheduling works immediately: Mon–Fri 8–6,
  // Sat 9–3, closed Sunday.
  await prisma.businessHours.createMany({
    data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      dealershipId: dealership.id,
      weekday,
      open: weekday === 0 ? null : weekday === 6 ? "09:00" : "08:00",
      close: weekday === 0 ? null : weekday === 6 ? "15:00" : "18:00",
    })),
  });

  // Whoever signs the lot up owns it, and can add staff from Settings → Team.
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(input.password),
      role: "owner",
      dealershipId: dealership.id,
    },
  });

  await createSession(user.id);
  redirect("/app");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
