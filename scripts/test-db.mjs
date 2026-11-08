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
  aud text,
  role text,
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
create schema storage;
create table storage.buckets (
  id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid default auth.uid()
);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
$$;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.objects to anon, authenticated, service_role;
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

let total = 0;
for (const f of readdirSync(join(root, "tests")).filter((f) => f.endsWith(".sql")).sort()) {
  notices.length = 0;
  const res = await db
    .exec(readFileSync(join(root, "tests", f), "utf8"), { onNotice: (n) => notices.push(n.message) })
    .catch((e) => {
      for (const m of notices) console.log("  " + m);
      console.error(`\n✗ ${f}\n  ${e.message}`);
      process.exit(1);
    });
  const passed = notices.filter((m) => m.startsWith("ok")).length;
  total += passed;
  if (process.argv.includes("--verbose")) for (const m of notices) console.log("  " + m);
  const final = res?.flatMap((r) => r.rows ?? []).find((r) => r.result);
  console.log(`✓ ${f}: ${final?.result ?? "finished"} (${passed} checks)`);
}
console.log(`\nAll test files passed (${total} checks)`);
await db.close();

// The dev seed must apply cleanly on a fresh database.
const fresh = new PGlite();
await fresh.exec(supabaseStub);
for (const f of readdirSync(join(root, "migrations")).filter((f) => f.endsWith(".sql")).sort()) {
  await fresh.exec(readFileSync(join(root, "migrations", f), "utf8"));
}
try {
  await fresh.exec(readFileSync(join(root, "seed.dev.sql"), "utf8"));
  const { rows } = await fresh.query("select status, count(*)::int as n from public.applications group by status order by status");
  console.log(`✓ seed.dev.sql applies (${rows.map((r) => `${r.status}: ${r.n}`).join(", ")})`);
} catch (e) {
  console.error(`✗ seed.dev.sql\n  ${e.message}`);
  process.exit(1);
}
await fresh.close();
