-- RLS and rule tests. Safe to run in the Supabase SQL editor: everything happens
-- inside one transaction and is rolled back at the end. Any failure aborts with "FAIL: ...".
-- Local: node scripts/test-db.mjs (runs the migrations + this file on an in-memory Postgres).

begin;

create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.login(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;

create function tests.anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  execute 'set local role anon';
end $$;

create function tests.logout() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end $$;

create function tests.throws(q text, expected text) returns void language plpgsql as $$
begin
  begin
    execute q;
  exception when others then
    if position(expected in sqlerrm) > 0 then
      raise notice 'ok   % -> %', left(q, 70), sqlerrm;
      return;
    end if;
    raise exception 'FAIL: "%" raised "%", expected "%"', q, sqlerrm, expected;
  end;
  raise exception 'FAIL: "%" succeeded, expected error "%"', q, expected;
end $$;

create function tests.count(q text, expected int, label text) returns void language plpgsql as $$
declare n int;
begin
  execute q into n;
  if n is distinct from expected then
    raise exception 'FAIL: % (got %, expected %)', label, n, expected;
  end if;
  raise notice 'ok   %', label;
end $$;

create function tests.affects(q text, expected int, label text) returns void language plpgsql as $$
declare n int;
begin
  execute q;
  get diagnostics n = row_count;
  if n is distinct from expected then
    raise exception 'FAIL: % (affected %, expected %)', label, n, expected;
  end if;
  raise notice 'ok   %', label;
end $$;

grant execute on all functions in schema tests to anon, authenticated;

-- Fixtures (as the database owner) ------------------------------------------

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-00000000000a', 'a@test.invalid'),
  ('00000000-0000-4000-8000-00000000000b', 'b@test.invalid'),
  ('00000000-0000-4000-8000-00000000000c', 'c@test.invalid'),
  ('00000000-0000-4000-8000-00000000000d', 'd@test.invalid'),
  ('00000000-0000-4000-8000-00000000000e', 'e@test.invalid'),
  ('00000000-0000-4000-8000-00000000000f', 'f@test.invalid'),
  ('00000000-0000-4000-8000-0000000000a1', 'judge@test.invalid'),
  ('00000000-0000-4000-8000-0000000000a2', 'judge2@test.invalid'),
  ('00000000-0000-4000-8000-0000000000ad', 'admin@test.invalid'),
  ('00000000-0000-4000-8000-0000000000aa', 'owner@test.invalid');

select tests.count($q$select count(*) from public.profiles where email like '%@test.invalid' and role = 'participant'$q$, 10, 'new users get a participant profile');

update public.profiles set role = 'judge' where id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a2');
update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-0000000000ad';
update public.profiles set role = 'owner' where id = '00000000-0000-4000-8000-0000000000aa';
update public.settings set value = '"open"' where key = 'application_status';
update public.settings set value = to_jsonb(now() - interval '1 hour') where key = 'hack_start';
update public.settings set value = to_jsonb(now() + interval '1 hour') where key = 'submission_deadline';

-- Participant A: application ------------------------------------------------

select tests.login('00000000-0000-4000-8000-00000000000a');
insert into public.applications (user_id, answers) values ('00000000-0000-4000-8000-00000000000a', '{"school":"ADÜ"}');
select tests.count('select count(*) from public.applications', 1, 'A sees only own application');
select tests.throws($q$update public.applications set status = 'accepted' where user_id = auth.uid()$q$, 'status_change_not_allowed');
select tests.throws($q$update public.applications set checkin_token = 'x' where user_id = auth.uid()$q$, 'application_locked_field');
select tests.affects($q$update public.applications set status = 'submitted' where user_id = auth.uid()$q$, 1, 'A submits');
select tests.count('select count(*) from public.applications where submitted_at is not null', 1, 'submitted_at set by the database');
select tests.throws($q$update public.applications set answers = '{"school":"other"}' where user_id = auth.uid()$q$, 'application_locked_after_submit');
select tests.throws($q$update public.profiles set role = 'admin' where id = auth.uid()$q$, 'role_change_not_allowed');
select tests.throws($q$update public.profiles set email = 'x@test.invalid' where id = auth.uid()$q$, 'profile_locked_field');
select tests.affects($q$update public.profiles set full_name = 'A Person' where id = auth.uid()$q$, 1, 'A edits own name');
select tests.count('select count(*) from public.profiles', 1, 'A sees only own profile');
select tests.count('select count(*) from public.audit_log', 0, 'A cannot read audit log');
select tests.count('select count(*) from public.settings where not is_public', 0, 'A cannot read private settings');
select tests.logout();

-- Participant B cannot touch A ----------------------------------------------

select tests.login('00000000-0000-4000-8000-00000000000b');
select tests.count('select count(*) from public.applications', 0, 'B cannot see A''s application');
select tests.affects($q$update public.applications set answers = '{}' where user_id = '00000000-0000-4000-8000-00000000000a'$q$, 0, 'B cannot update A''s application');
select tests.affects($q$delete from public.applications where user_id = '00000000-0000-4000-8000-00000000000a'$q$, 0, 'B cannot delete A''s application');
select tests.throws($q$insert into public.applications (user_id) values ('00000000-0000-4000-8000-00000000000a')$q$, 'not_your_application');
select tests.count($q$select count(*) from public.profiles where id = '00000000-0000-4000-8000-00000000000a'$q$, 0, 'B cannot see A''s profile');
select tests.throws($q$select public.create_team('B team')$q$, 'application_not_accepted');
select tests.logout();

-- Judge sees no applications or personal data ------------------------------

select tests.login('00000000-0000-4000-8000-0000000000a1');
select tests.count('select count(*) from public.applications', 0, 'judge cannot see applications');
select tests.count('select count(*) from public.profiles', 1, 'judge sees only own profile');
select tests.count('select count(*) from public.team_members', 0, 'judge cannot see team members');
select tests.count($q$select count(*) from public.settings where key = 'judging_criteria'$q$, 1, 'judge can read judging criteria');
select tests.logout();

-- Admin decides; role rules -------------------------------------------------

select tests.login('00000000-0000-4000-8000-0000000000ad');
select tests.count('select count(*) from public.applications', 1, 'admin sees all applications');
select tests.affects($q$update public.applications set status = 'accepted' where user_id = '00000000-0000-4000-8000-00000000000a'$q$, 1, 'admin accepts A');
select tests.count($q$select count(*) from public.applications where decided_by = auth.uid() and decided_at is not null$q$, 1, 'decision is recorded');
select tests.affects($q$update public.profiles set role = 'judge' where id = '00000000-0000-4000-8000-00000000000f'$q$, 1, 'admin makes F a judge');
select tests.affects($q$update public.profiles set role = 'participant' where id = '00000000-0000-4000-8000-00000000000f'$q$, 1, 'admin removes judge role');
select tests.throws($q$update public.profiles set role = 'owner' where id = '00000000-0000-4000-8000-00000000000f'$q$, 'owner_only');
select tests.throws($q$update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-0000000000aa'$q$, 'owner_only');
select tests.throws($q$delete from public.profiles where id = '00000000-0000-4000-8000-0000000000aa'$q$, 'owner_cannot_be_deleted');
select tests.count($q$select count(*) from public.audit_log where action = 'role_change'$q$, 6, 'role changes are logged');
select tests.logout();

-- Owner rules ----------------------------------------------------------------

select tests.login('00000000-0000-4000-8000-0000000000aa');
select tests.throws($q$update public.profiles set role = 'admin' where id = auth.uid()$q$, 'last_owner');
select tests.affects($q$update public.profiles set role = 'owner' where id = '00000000-0000-4000-8000-0000000000ad'$q$, 1, 'owner appoints another owner');
select tests.affects($q$update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-0000000000ad'$q$, 1, 'owner demotes the second owner');
select tests.logout();

-- Teams ---------------------------------------------------------------------

-- B..F accepted (as database owner); C stays outside the team.
insert into public.applications (user_id, status) values
  ('00000000-0000-4000-8000-00000000000b', 'accepted'),
  ('00000000-0000-4000-8000-00000000000c', 'accepted'),
  ('00000000-0000-4000-8000-00000000000d', 'accepted'),
  ('00000000-0000-4000-8000-00000000000e', 'accepted'),
  ('00000000-0000-4000-8000-00000000000f', 'accepted');
insert into auth.users (id, email) values ('00000000-0000-4000-8000-000000000010', 'g@test.invalid');
insert into public.applications (user_id, status) values ('00000000-0000-4000-8000-000000000010', 'accepted');

select tests.login('00000000-0000-4000-8000-00000000000a');
select tests.affects($q$update public.applications set status = 'confirmed' where user_id = auth.uid()$q$, 1, 'A confirms attendance');
select tests.throws($q$update public.applications set status = 'accepted' where user_id = auth.uid()$q$, 'status_change_not_allowed');
create temporary table team_code on commit drop as select join_code from public.create_team('Takım A');
grant select on team_code to authenticated;
select tests.count($q$select count(*) from team_code where join_code ~ '^[A-Z0-9]{8}$' and join_code ~ '[A-Z]' and join_code ~ '[0-9]'$q$, 1, 'join code is 8 mixed characters');
select tests.throws($q$select public.create_team('Second')$q$, 'already_in_team');
select tests.throws($q$insert into public.team_members (team_id, user_id) select id, '00000000-0000-4000-8000-00000000000c' from public.teams$q$, 'row-level security');
select tests.logout();

select tests.login('00000000-0000-4000-8000-00000000000b');
select tests.throws($q$select public.join_team('ZZZZZZZ2')$q$, 'team_not_found');
select public.join_team((select join_code from team_code));
select tests.count('select count(*) from public.team_members', 2, 'B sees own team members');
select tests.count('select count(*) from public.profiles', 2, 'B sees teammate A');
select tests.count('select count(*) from public.applications', 1, 'B still sees only own application');
select tests.logout();

select tests.login('00000000-0000-4000-8000-00000000000c');
select tests.count('select count(*) from public.teams', 0, 'C cannot see a team it did not join');
select tests.count('select count(*) from public.team_members', 0, 'C cannot see its members');
select tests.logout();

select tests.login('00000000-0000-4000-8000-00000000000d'); select public.join_team((select join_code from team_code)); select tests.logout();
select tests.login('00000000-0000-4000-8000-00000000000e'); select public.join_team((select join_code from team_code)); select tests.logout();
select tests.login('00000000-0000-4000-8000-00000000000f'); select public.join_team((select join_code from team_code)); select tests.logout();

select tests.login('00000000-0000-4000-8000-000000000010');
select tests.throws($q$select public.join_team((select join_code from team_code))$q$, 'team_full');
select tests.logout();

-- Judges cannot form teams.
select tests.login('00000000-0000-4000-8000-0000000000a1');
select tests.throws($q$select public.create_team('Jury team')$q$, 'participants_only');
select tests.logout();

-- Submissions ---------------------------------------------------------------

select tests.login('00000000-0000-4000-8000-00000000000a');
select tests.throws($q$insert into public.submissions (team_id, title) select id, 'Not checked in' from public.teams$q$, 'row-level security');
select tests.logout();

update public.applications set status = 'checked_in' where user_id = '00000000-0000-4000-8000-00000000000a';

select tests.login('00000000-0000-4000-8000-00000000000a');
select tests.affects($q$insert into public.submissions (team_id, title, repo_url) select id, 'Proje', 'https://example.com/repo' from public.teams$q$, 1, 'checked-in member submits');
select tests.count($q$select count(*) from public.submissions where updated_by = auth.uid() and submitted_at is not null$q$, 1, 'submission records editor and time');
select tests.throws($q$select public.leave_team()$q$, 'team_has_submission');
select tests.count('select count(*) from public.scores', 0, 'participant cannot see scores');
select tests.throws($q$insert into public.scores (submission_id, round, judge_id) select id, 'final', auth.uid() from public.submissions$q$, 'row-level security');
select tests.logout();

select tests.login('00000000-0000-4000-8000-00000000000b');
select tests.affects($q$update public.submissions set title = 'B edit'$q$, 0, 'teammate who is not checked in cannot edit');
select tests.logout();

select tests.login('00000000-0000-4000-8000-00000000000c');
select tests.count('select count(*) from public.submissions', 0, 'C cannot see another team''s submission');
select tests.logout();

select tests.login('00000000-0000-4000-8000-0000000000a1');
select tests.count('select count(*) from public.submissions', 1, 'judge sees submissions');
select tests.affects($q$insert into public.scores (submission_id, round, criteria) select id, 'finalist_selection', '{"impact":4}' from public.submissions$q$, 1, 'judge scores');
select tests.throws($q$insert into public.scores (submission_id, round, criteria) select id, 'finalist_selection', '{}' from public.submissions$q$, 'duplicate key');
select tests.logout();

select tests.login('00000000-0000-4000-8000-0000000000a2');
select tests.count('select count(*) from public.scores', 0, 'second judge cannot see first judge''s score');
select tests.affects($q$update public.scores set comment = 'x'$q$, 0, 'second judge cannot edit first judge''s score');
select tests.logout();

update public.settings set value = to_jsonb(now() - interval '1 minute') where key = 'submission_deadline';

select tests.login('00000000-0000-4000-8000-00000000000a');
select tests.affects($q$update public.submissions set title = 'Too late'$q$, 0, 'no edits after the deadline');
select tests.logout();

-- Anonymous visitors ---------------------------------------------------------

select tests.anon();
select tests.count('select count(*) from public.settings where not is_public', 0, 'anon cannot read private settings');
select tests.count($q$select count(*) from public.settings where key = 'application_status'$q$, 1, 'anon reads application status');
select tests.throws('select count(*) from public.applications', 'permission denied');
select tests.logout();

-- Owner cannot be deleted even by the database owner -----------------------

select tests.throws($q$delete from auth.users where id = '00000000-0000-4000-8000-0000000000aa'$q$, 'owner_cannot_be_deleted');

select 'ALL RLS TESTS PASSED' as result;

rollback;
