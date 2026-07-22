// Creates an AuctionDesk staff account: platform admin, no real dealership.
//
// Every user must belong to a dealership (User.dealershipId is required, and
// that is what keeps tenant scoping fail-closed), so platform staff live in one
// internal tenant that never holds inventory. They work out of /admin, not /app.
//
//   npx tsx scripts/create-platform-admin.ts you@example.com
//   ADMIN_PASSWORD="..." npx tsx scripts/create-platform-admin.ts you@example.com
//
// With no ADMIN_PASSWORD a strong one is generated and printed once. Change it
// after first sign-in: /admin → your row → Reset password.
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCb } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();

// Mirrors lib/auth.ts hashPassword — kept inline so scripts have no app imports.
const scrypt = promisify(scryptCb) as (p: string, s: string, k: number) => Promise<Buffer>;
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

// Unambiguous alphabet — no O/0/I/l — so a password can be read aloud or retyped.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
function generatePassword(length = 24) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const INTERNAL_SLUG = "auctiondesk-internal";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const name = process.argv[3]?.trim() || "AuctionDesk Support";

  if (!email) {
    console.error("Usage: npx tsx scripts/create-platform-admin.ts <email> [name]");
    process.exit(1);
  }

  const host = (process.env.DATABASE_URL ?? "").replace(/:\/\/[^@]*@/, "://***@");
  console.log(`Database: ${host || "(unset)"}`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`${email} already exists. Use: npm run admin:grant -- ${email}`);
    process.exit(1);
  }

  // One shared internal tenant for all platform staff.
  const dealership =
    (await prisma.dealership.findUnique({ where: { slug: INTERNAL_SLUG } })) ??
    (await prisma.dealership.create({
      data: { name: "AuctionDesk", slug: INTERNAL_SLUG, city: "", state: "WI" },
    }));

  const password = process.env.ADMIN_PASSWORD || generatePassword();

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "owner",
      isSuperAdmin: true,
      dealershipId: dealership.id,
    },
  });

  console.log(`\nCreated platform admin: ${user.name} <${user.email}>`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Password: ${password}`);
    console.log(`\nChange it after signing in: /admin → your row → Reset password.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
