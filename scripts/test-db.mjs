// Runs every migration on a fresh in-memory Postgres (PGlite), then the RLS tests.
// Supabase pieces the migrations rely on (auth schema, auth.uid(), API roles and their
// default grants) are stubbed below to match a hosted Supabase project.
//
//   npm run test:db

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = join(import.meta.dirname, "..", "supabase");

const supabaseStub = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'
);
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid
$$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

const db = new PGlite();
const notices = [];
const run = async (label, sql) => {
  try {
    await db.exec(sql);
  } catch (e) {
    console.error(`\n✗ ${label}\n  ${e.message}`);
    if (e.where) console.error(`  at ${e.where}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
};

await run("supabase stub", supabaseStub);
for (const f of readdirSync(join(root, "migrations")).filter((f) => f.endsWith(".sql")).sort()) {
  await run(`migration ${f}`, readFileSync(join(root, "migrations", f), "utf8"));
}

const res = await db
  .exec(readFileSync(join(root, "tests", "rls_test.sql"), "utf8"), { onNotice: (n) => notices.push(n.message) })
  .catch((e) => {
    console.error(`\n✗ rls tests\n  ${e.message}`);
    process.exit(1);
  });

const passed = notices.filter((m) => m.startsWith("ok")).length;
for (const m of notices) console.log("  " + m);
const final = res?.flatMap((r) => r.rows ?? []).find((r) => r.result);
console.log(`\n${final?.result ?? "tests finished"} (${passed} checks)`);
await db.close();
