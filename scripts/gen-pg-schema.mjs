// Derives prisma/schema.postgres.prisma from prisma/schema.prisma by swapping
// only the datasource block. The models in schema.prisma stay the single source
// of truth, so the two databases can never drift.
//
// Run indirectly via the db:pg:* npm scripts — you should never edit the
// generated file by hand.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(root, "prisma", "schema.prisma");
const TARGET = path.join(root, "prisma", "schema.postgres.prisma");

const DATASOURCE_BLOCK = /datasource\s+db\s*\{[^}]*\}/;

const PG_DATASOURCE = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

const source = await readFile(SOURCE, "utf8");

if (!DATASOURCE_BLOCK.test(source)) {
  console.error("Could not find a `datasource db { ... }` block in prisma/schema.prisma");
  process.exit(1);
}

const header = `// GENERATED FILE — DO NOT EDIT.
// Derived from prisma/schema.prisma by scripts/gen-pg-schema.mjs.
// Edit the models in prisma/schema.prisma instead, then re-run a db:pg:* script.

`;

const output = header + source.replace(DATASOURCE_BLOCK, PG_DATASOURCE);
await writeFile(TARGET, output, "utf8");

console.log("Wrote prisma/schema.postgres.prisma (Postgres) from prisma/schema.prisma");
