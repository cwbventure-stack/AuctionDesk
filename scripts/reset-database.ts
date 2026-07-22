// Deletes every row in the database and creates nothing.
//
// This exists for one job: emptying the demo data out of a database that is
// about to become production. It is destructive and irreversible.
//
// The guard is deliberately annoying — you must repeat the database host back
// to it, so you cannot wipe the wrong database by re-running a shell line:
//
//   CONFIRM_RESET=<host> npx tsx scripts/reset-database.ts
//
// e.g. CONFIRM_RESET=aws-0-us-east-1.pooler.supabase.com npx tsx scripts/reset-database.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hostOf(url: string): string {
  const match = url.match(/@([^:/?]+)/);
  if (match) return match[1];
  // SQLite and other file-based URLs have no host; use the whole target.
  return url.replace(/^file:/, "file:");
}

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const host = hostOf(url);
  const confirm = process.env.CONFIRM_RESET;

  if (confirm !== host) {
    console.error(`Refusing to run.\n`);
    console.error(`This would delete every row in: ${host}`);
    console.error(`To proceed, re-run with:\n`);
    console.error(`  CONFIRM_RESET=${host} npx tsx scripts/reset-database.ts`);
    process.exit(1);
  }

  const before = {
    dealerships: await prisma.dealership.count(),
    users: await prisma.user.count(),
    vehicles: await prisma.vehicle.count(),
    leads: await prisma.lead.count(),
    customers: await prisma.customer.count(),
  };
  console.log(`Wiping ${host}:`, before);

  // Same FK-safe order the seed uses.
  await prisma.message.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.sourceSetting.deleteMany();
  await prisma.template.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dealership.deleteMany();

  console.log("Done. The database is empty — sign up in the app to create the first dealership.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
