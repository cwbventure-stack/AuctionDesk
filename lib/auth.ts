// Session auth with no external dependencies.
//
// Passwords: scrypt (Node core) with a per-user random salt. Verification is
// timing-safe.
// Sessions: a 256-bit random token lives in an httpOnly cookie; only its
// SHA-256 hash is stored, so a stolen database can't be replayed as a login.
import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LEN = 64;
export const SESSION_COOKIE = "auctiondesk_session";
const SESSION_DAYS = 30;

// --- Passwords -------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LEN);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = await scrypt(password, salt, KEY_LEN);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

// --- Sessions --------------------------------------------------------------

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Creates a session row and sets the cookie. Call after signup/login. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export type Role = "owner" | "staff";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isSuperAdmin: boolean;
  dealershipId: string;
  dealershipName: string;
  dealershipSlug: string;
}

/**
 * Returns the signed-in user, or null. Expired sessions are treated as signed
 * out and cleaned up.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { dealership: true } } },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    // Anything that isn't a known role is treated as the least privileged one.
    role: session.user.role === "staff" ? "staff" : "owner",
    isSuperAdmin: session.user.isSuperAdmin,
    dealershipId: session.user.dealershipId,
    dealershipName: session.user.dealership.name,
    dealershipSlug: session.user.dealership.slug,
  };
}

/**
 * The workhorse for every authenticated page and action. Returns the session
 * user or throws — so a scoping mistake fails closed rather than leaking
 * another dealership's data.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

/** Convenience for the common case: "which tenant am I acting on?" */
export async function requireDealershipId(): Promise<string> {
  return (await requireUser()).dealershipId;
}

/**
 * Gate for managing the dealership itself — staff, hours, templates. Throws for
 * salespeople, so an owner-only action fails closed if the UI ever forgets to
 * hide its button.
 */
export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "owner") throw new Error("Owners only");
  return user;
}

/**
 * Gate for the cross-tenant support area under /admin.
 *
 * Deliberately separate from requireDealershipId: everything else in the app
 * filters by the signed-in dealership and fails closed, and that invariant is
 * what keeps one lot's data away from another. Super-admin queries opt out of it
 * explicitly, one route at a time — never by relaxing the tenant filters.
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.isSuperAdmin) throw new Error("Not authorized");
  return user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
}
