#!/usr/bin/env tsx
/**
 * RAAM 2026 · Migration runner
 *
 * Reads DATABASE_URL from .env.local and applies any migration in
 * supabase/migrations/*.sql that hasn't already been applied.
 *
 * Tracking: a `_schema_migrations` table records filename + checksum + applied_at.
 *
 * Usage:
 *   pnpm migrate         — apply pending migrations
 *   pnpm migrate:status  — show applied + pending list
 *   pnpm migrate:reset FILENAME — mark FILENAME unapplied (dangerous; does NOT undo SQL)
 *
 * Safety:
 * - Each migration runs in its own transaction.
 * - Checksum mismatch on already-applied file = hard error (file was edited
 *   after apply). Fix: create a new migration file.
 * - DATABASE_URL must URL-encode special chars in password (`@` → `%40`, `!` → `%21`).
 */

import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setDefaultResultOrder } from "node:dns";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";

// Supabase's db.<ref>.supabase.co resolves to IPv6 first on macOS; many
// home networks can't route IPv6. Prefer IPv4 to avoid EHOSTUNREACH.
setDefaultResultOrder("ipv4first");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

loadEnv({ path: join(ROOT, ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "[migrate] DATABASE_URL missing from .env.local.\n" +
      "Add it with URL-encoded password. Example:\n" +
      "  DATABASE_URL=postgresql://postgres:PASSWORD_URL_ENCODED@db.PROJECT.supabase.co:5432/postgres",
  );
  process.exit(1);
}

interface Row {
  filename: string;
  checksum: string;
  applied_at: string;
}

async function main() {
  const cmd = process.argv[2] ?? "up";
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Ensure tracking table exists
  await client.query(`
    create table if not exists _schema_migrations (
      filename   text primary key,
      checksum   text not null,
      applied_at timestamptz not null default now()
    );
  `);

  const allFiles = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows: appliedRows } = await client.query<Row>(
    "select filename, checksum, applied_at from _schema_migrations order by filename",
  );
  const applied = new Map(appliedRows.map((r) => [r.filename, r]));

  if (cmd === "status") {
    console.log("Applied:");
    for (const f of allFiles) {
      const a = applied.get(f);
      if (a)
        console.log(
          `  ✓ ${f}  ${a.applied_at.toString().slice(0, 19)}  ${a.checksum.slice(0, 8)}`,
        );
    }
    console.log("\nPending:");
    for (const f of allFiles) {
      if (!applied.has(f)) console.log(`  · ${f}`);
    }
    await client.end();
    return;
  }

  if (cmd === "reset") {
    const target = process.argv[3];
    if (!target) {
      console.error("Usage: pnpm migrate reset <filename>");
      process.exit(1);
    }
    const { rowCount } = await client.query(
      "delete from _schema_migrations where filename = $1",
      [target],
    );
    console.log(`Reset ${target} — ${rowCount} row(s) removed.`);
    console.log(
      "NOTE: SQL changes were NOT rolled back. Handle data drift manually.",
    );
    await client.end();
    return;
  }

  if (cmd === "mark") {
    // Mark a file (or "up-to 0004") as already applied WITHOUT running SQL.
    // Use when migrations were applied out-of-band (SQL editor).
    const target = process.argv[3];
    if (!target) {
      console.error(
        "Usage:\n" +
          "  pnpm migrate mark 0003_strategy_tables.sql   — mark single file\n" +
          "  pnpm migrate mark up-to 0004_seed_strategy.sql — mark file + all earlier",
      );
      process.exit(1);
    }

    const toMark: string[] = [];
    if (target === "up-to") {
      const stop = process.argv[4];
      if (!stop) {
        console.error("Usage: pnpm migrate mark up-to <filename>");
        process.exit(1);
      }
      for (const f of allFiles) {
        toMark.push(f);
        if (f === stop) break;
      }
      if (!toMark.includes(stop)) {
        console.error(`[mark] ${stop} not found in migrations dir.`);
        process.exit(1);
      }
    } else {
      if (!allFiles.includes(target)) {
        console.error(`[mark] ${target} not found in migrations dir.`);
        process.exit(1);
      }
      toMark.push(target);
    }

    for (const f of toMark) {
      if (applied.has(f)) {
        console.log(`  skip ${f} — already tracked`);
        continue;
      }
      const sql = await readFile(join(MIGRATIONS_DIR, f), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      await client.query(
        "insert into _schema_migrations (filename, checksum) values ($1, $2)",
        [f, checksum],
      );
      console.log(`  marked ${f} — checksum ${checksum.slice(0, 8)}`);
    }
    await client.end();
    return;
  }

  // Default: up
  let appliedCount = 0;
  let skipCount = 0;
  for (const f of allFiles) {
    const path = join(MIGRATIONS_DIR, f);
    const sql = await readFile(path, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = applied.get(f);

    if (existing) {
      if (existing.checksum !== checksum) {
        console.error(
          `\n[migrate] CHECKSUM MISMATCH for ${f}\n` +
            `  applied  : ${existing.checksum}\n` +
            `  on disk  : ${checksum}\n` +
            `Fix: never edit an already-applied migration. Create a new file instead.`,
        );
        await client.end();
        process.exit(2);
      }
      skipCount += 1;
      continue;
    }

    process.stdout.write(`  applying ${f} … `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into _schema_migrations (filename, checksum) values ($1, $2)",
        [f, checksum],
      );
      await client.query("commit");
      console.log("ok");
      appliedCount += 1;
    } catch (err) {
      await client.query("rollback").catch(() => {});
      const msg = err instanceof Error ? err.message : String(err);
      console.log("FAILED");
      console.error(`\n[migrate] ${f} failed:\n  ${msg}`);
      await client.end();
      process.exit(3);
    }
  }

  console.log(
    `\n[migrate] done — ${appliedCount} applied, ${skipCount} already up-to-date.`,
  );
  await client.end();
}

main().catch(async (err) => {
  console.error("[migrate] fatal:", err);
  process.exit(1);
});
