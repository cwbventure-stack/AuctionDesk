// Grants (or revokes) platform-admin access for one existing user.
//
// Deliberately a script and not a screen: nothing in the dealership UI can hand
// out cross-tenant access, so the only way in is someone with database
// credentials. Sign up through the normal flow first, then run this.
//
//   npm run admin:grant -- you@example.com
//   npm run admin:grant -- you@example.com --revoke
//
// Against production, generate the Postgres client first and pass the pooler
// URL explicitly, so you always know which database you're touching:
//
//   npm run db:pg:generate
//   DATABASE_URL="<supabase-pooler-url>" npm run admin:grant -- you@example.com
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const revoke = args.includes("--revoke");
  const email = args.find((a) => !a.startsWith("--"))?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: npm run admin:grant -- <email> [--revoke]");
    process.exit(1);
  }

  // Show the target so a production run is never a surprise.
  const host = (process.env.DATABASE_URL ?? "").replace(/:\/\/[^@]*@/, "://***@");
  console.log(`Database: ${host || "(unset)"}`);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isSuperAdmin: true },
  });

  if (!user) {
    console.error(`No user with email ${email}. Sign up in the app first, then re-run this.`);
    process.exit(1);
  }

  if (user.isSuperAdmin === !revoke) {
    console.log(`${user.email} already has isSuperAdmin=${!revoke}. Nothing to do.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isSuperAdmin: !revoke },
  });

  console.log(
    revoke
      ? `Revoked platform admin from ${user.name} <${user.email}>.`
      : `Granted platform admin to ${user.name} <${user.email}>. Sign in and open /admin.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
