import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { readFileSync } from "node:fs";

// Load .env.local for local CLI use.
try {
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const conn = neon(process.env.DATABASE_URL);
const db = drizzle(conn);

async function main() {
  console.log("⚠️  Wiping ALL data from the database…");

  // Order matters less because of CASCADE, but explicit list is clearer.
  await db.execute(sql`TRUNCATE TABLE
    ledger,
    disbursements,
    donations,
    proposals,
    rfps,
    postulado_votes,
    businesses,
    postulados,
    agencies,
    magic_link_tokens,
    users,
    rate_limit_buckets
    RESTART IDENTITY CASCADE`);

  console.log("✅ Database wiped clean. Schema intact, all rows removed.");
  console.log("");
  console.log("Next steps:");
  console.log("  • Sign in with your admin email again to recreate your user row");
  console.log("  • Or run `npm run db:seed` to reload the sample dataset");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
