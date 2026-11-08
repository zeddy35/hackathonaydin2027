-- End-to-end flow at the database level (tasks 3 and 4): apply, decide, confirm,
-- teams, check-in, submit, judge, finalists, final, locks. Runs in one transaction
-- and rolls back. Local: npm run test:db

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


-- Fixtures: 25 applicants, 3 judges, 1 admin, 1 owner ------------------------

insert into auth.users (id, email)
select ('00000000-0000-4000-9000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'p' || i || '@test.invalid'
from generate_series(1, 25) i;
insert into auth.users (id, email) values
  ('00000000-0000-4000-9000-0000000000a1', 'j1@test.invalid'),
  ('00000000-0000-4000-9000-0000000000a2', 'j2@test.invalid'),
  ('00000000-0000-4000-9000-0000000000a3', 'j3@test.invalid'),
  ('00000000-0000-4000-9000-0000000000ad', 'admin@test.invalid'),
  ('00000000-0000-4000-9000-0000000000aa', 'owner@test.invalid');
update public.profiles set role = 'judge' where email like 'j_@test.invalid';
update public.profiles set role = 'admin' where email = 'admin@test.invalid';
update public.profiles set role = 'owner' where email = 'owner@test.invalid';

create function tests.p(i int) returns uuid language sql immutable as $$
  select ('00000000-0000-4000-9000-0000000000' || lpad(i::text, 2, '0'))::uuid
$$;
grant execute on function tests.p(int) to authenticated;

-- Applications closed: nobody can apply ---------------------------------------

select tests.login(tests.p(1));
select tests.throws($q$insert into public.applications (user_id) values (auth.uid())$q$, 'applications_not_open');
select tests.logout();

update public.settings set value = '"open"' where key = 'application_status';

-- 25 people apply as themselves (draft, then submit) --------------------------

do $$
begin
  for i in 1..25 loop
    perform tests.login(tests.p(i));
    insert into public.applications (user_id, answers, consents) values (
      auth.uid(),
      jsonb_build_object('first_name', 'Test' || i, 'last_name', 'Kişi', 'age', case when i = 25 then '17' else '21' end,
                         'university', case when i % 2 = 0 then 'Aydın Adnan Menderes Üniversitesi' else 'Ege Üniversitesi' end,
                         'level', 'bachelor', 'team_status', case when i % 3 = 0 then 'looking' else 'have' end, 'phone', '+90 555 000 00 00'),
      jsonb_build_object('kvkk', jsonb_build_object('accepted', true, 'at', now()),
                         'coc', jsonb_build_object('accepted', true, 'at', now()),
                         'rules', jsonb_build_object('accepted', true, 'at', now()),
                         'marketing', jsonb_build_object('accepted', i % 4 = 0, 'at', now()))
    );
    if i = 25 then
      begin
        update public.applications set status = 'submitted' where user_id = auth.uid();
        raise exception 'FAIL: under-18 application was submitted';
      exception when others then
        if position('under_18' in sqlerrm) = 0 then raise; end if;
        raise notice 'ok   under-18 cannot submit';
      end;
      update public.applications set answers = answers || '{"age":"19"}' where user_id = auth.uid();
    end if;
    update public.applications set status = 'submitted' where user_id = auth.uid();
    perform tests.logout();
  end loop;
end $$;

select tests.count($q$select count(*) from public.applications where status = 'submitted' and submitted_at is not null$q$, 25, '25 applications submitted');
select tests.count($q$select count(*) from public.applications where is_minor$q$, 0, 'no under-18 application is submitted');
select tests.count($q$select count(*) from public.applications where consents ? 'kvkk' and consents ? 'coc' and consents ? 'rules'$q$, 25, 'each consent is its own record');
select tests.count($q$select count(*) from public.applications where (consents -> 'marketing' ->> 'accepted')::boolean$q$, 6, 'marketing list holds only people who opted in');

-- Application deadline ---------------------------------------------------------

update public.settings set value = to_jsonb(now() - interval '1 minute') where key = 'application_deadline';
insert into auth.users (id, email) values ('00000000-0000-4000-9000-000000000099', 'late@test.invalid');
select tests.login('00000000-0000-4000-9000-000000000099');
select tests.throws($q$insert into public.applications (user_id, status) values (auth.uid(), 'submitted')$q$, 'applications_not_open');
select tests.logout();
update public.settings set value = '"2027-03-31T23:59:00+03:00"' where key = 'application_deadline';

-- Participant edits after submitting: logistics yes, answers no --------------

select tests.login(tests.p(1));
select tests.affects($q$update public.applications set answers = answers || '{"phone":"+90 555 111 11 11"}' where user_id = auth.uid()$q$, 1, 'phone editable after submit');
select tests.throws($q$update public.applications set answers = answers || '{"university":"Other"}' where user_id = auth.uid()$q$, 'application_locked_after_submit');
select tests.affects($q$update public.applications set consents = consents || '{"marketing":{"accepted":true,"at":"2027-01-01T00:00:00Z"}}' where user_id = auth.uid()$q$, 1, 'marketing consent can be changed later');
select tests.throws($q$update public.applications set consents = consents - 'kvkk' where user_id = auth.uid()$q$, 'application_locked_after_submit');
select tests.throws($q$select public.create_team('Too early')$q$, 'application_not_accepted');
select tests.logout();

-- Admin: bulk decisions are logged -------------------------------------------

select tests.login('00000000-0000-4000-9000-0000000000ad');
select tests.affects($q$update public.applications set status = 'accepted' where user_id in (select tests.p(i) from generate_series(1, 20) i)$q$, 20, 'admin bulk-accepts 20');
select tests.affects($q$update public.applications set status = 'waitlisted' where user_id in (select tests.p(i) from generate_series(21, 23) i)$q$, 3, 'admin waitlists 3');
select tests.affects($q$update public.applications set status = 'rejected' where user_id in (select tests.p(i) from generate_series(24, 25) i)$q$, 2, 'admin rejects 2');
select tests.count($q$select count(*) from public.audit_log where action = 'application_status'$q$, 25, 'every decision is in the audit log');
insert into public.application_notes (application_id, body) select id, 'Not' from public.applications where user_id = tests.p(1);
select tests.count('select count(*) from public.application_notes', 1, 'admin adds a note');
select tests.logout();

select tests.login(tests.p(1));
select tests.count('select count(*) from public.application_notes', 0, 'participant cannot read admin notes');
select tests.logout();

-- Confirmation and the deadline ----------------------------------------------

update public.settings set value = to_jsonb(now() - interval '1 minute') where key = 'confirm_deadline';
select tests.login(tests.p(20));
select tests.throws($q$update public.applications set status = 'confirmed' where user_id = auth.uid()$q$, 'confirm_deadline_passed');
select tests.affects($q$update public.applications set status = 'declined' where user_id = auth.uid()$q$, 1, 'declining still works after the deadline');
select tests.logout();
update public.settings set value = to_jsonb(now() + interval '1 day') where key = 'confirm_deadline';

do $$
begin
  for i in 1..18 loop
    perform tests.login(tests.p(i));
    update public.applications set status = 'confirmed' where user_id = auth.uid();
    perform tests.logout();
  end loop;
  perform tests.login(tests.p(19));
  update public.applications set status = 'declined' where user_id = auth.uid();
  perform tests.logout();
end $$;
select tests.count($q$select count(*) from public.applications where status = 'confirmed'$q$, 18, '18 confirm');
select tests.count($q$select count(*) from public.applications where status = 'declined'$q$, 2, '2 decline');

select tests.login(tests.p(21));
select tests.throws($q$update public.applications set status = 'confirmed' where user_id = auth.uid()$q$, 'status_change_not_allowed');
select tests.logout();

-- Teams: 4 teams formed by participants (5, 5, 4, 3), one person matched by admin

create temporary table codes (n int, code text) on commit drop;
grant all on codes to authenticated;
do $$
declare
  team_of int[] := array[1,1,1,1,1, 2,2,2,2,2, 3,3,3,3, 4,4,4];
  c text;
begin
  for i in 1..17 loop
    perform tests.login(tests.p(i));
    select code into c from codes where n = team_of[i];
    if c is null then
      insert into codes select team_of[i], join_code from public.create_team('Takım ' || team_of[i]);
    else
      perform public.join_team(c);
    end if;
    perform tests.logout();
  end loop;
end $$;
select tests.count('select count(*) from public.teams', 4, '4 teams created');
select tests.count('select count(*) from public.team_members', 17, '17 people in teams');

select tests.login(tests.p(6));
select tests.throws($q$select public.join_team((select code from codes where n = 1))$q$, 'already_in_team');
select tests.count('select count(*) from public.team_members', 5, 'member sees only own team');
select tests.logout();

select tests.login(tests.p(18));
update public.applications set wants_match = true where user_id = auth.uid();
select tests.throws($q$select public.join_team((select code from codes where n = 1))$q$, 'team_full');
select tests.count('select count(*) from public.teams', 0, 'outsider sees no team');
select tests.logout();

select tests.login('00000000-0000-4000-9000-0000000000ad');
select tests.count($q$select count(*) from public.applications where wants_match$q$, 1, 'admin sees who wants matching');
select tests.affects($q$insert into public.team_members (team_id, user_id) select t.id, tests.p(18) from public.teams t join codes c on c.code = t.join_code where c.n = 4$q$, 1, 'admin matches a person into a team');
select tests.logout();

-- Check-in by admin ------------------------------------------------------------

select tests.login('00000000-0000-4000-9000-0000000000ad');
select tests.affects($q$update public.applications set status = 'checked_in' where status = 'confirmed'$q$, 18, 'admin checks in 18');
select tests.count($q$select count(*) from public.applications where checked_in_at is not null$q$, 18, 'check-in time recorded');
select tests.logout();

-- Submissions inside the window --------------------------------------------------

update public.settings set value = to_jsonb(now() + interval '1 hour') where key = 'hack_start';
update public.settings set value = to_jsonb(now() + interval '2 hours') where key = 'submission_deadline';
select tests.login(tests.p(1));
select tests.throws($q$insert into public.submissions (team_id, title, repo_url) select team_id, 'Early', 'https://github.com/a/b' from public.team_members where user_id = auth.uid()$q$, 'row-level security');
select tests.logout();

update public.settings set value = to_jsonb(now() - interval '1 hour') where key = 'hack_start';
do $$
declare i int;
begin
  foreach i in array array[1, 6, 11, 15] loop
    perform tests.login(tests.p(i));
    insert into public.submissions (team_id, title, problem, description, repo_url, ai_tools, demo_is_local, finalist)
      select team_id, 'Proje ' || i, 'Problem', 'Açıklama', 'https://github.com/test/p' || i, 'Yok', true, true
      from public.team_members where user_id = auth.uid();
    perform tests.logout();
  end loop;
end $$;
select tests.count('select count(*) from public.submissions', 4, '4 teams submitted');
select tests.count('select count(*) from public.submissions where finalist', 0, 'participants cannot mark themselves finalist');

select tests.login(tests.p(2));
select tests.affects($q$update public.submissions set title = 'Edited by teammate'$q$, 1, 'any checked-in teammate can edit');
select tests.count($q$select count(*) from public.submissions where updated_by = auth.uid()$q$, 1, 'last editor recorded');
select tests.logout();

-- Judging -------------------------------------------------------------------------

select tests.login('00000000-0000-4000-9000-0000000000ad');
insert into public.judge_assignments (submission_id, judge_id)
select s.id, j.id from public.submissions s
cross join lateral (
  select id from public.profiles where role = 'judge' order by md5(s.id::text || id::text) limit 2
) j;
select tests.count('select count(*) from public.judge_assignments', 8, 'every submission has 2 judges');
select tests.logout();

do $$
declare j uuid;
begin
  foreach j in array array['00000000-0000-4000-9000-0000000000a1', '00000000-0000-4000-9000-0000000000a2', '00000000-0000-4000-9000-0000000000a3']::uuid[] loop
    perform tests.login(j);
    insert into public.scores (submission_id, round, criteria)
      select id, 'finalist_selection', jsonb_build_object('technical', 7, 'impact', 8, 'innovation', 6, 'demo', 9, 'completeness', 5)
      from public.submissions;
    perform tests.logout();
  end loop;
end $$;
select tests.count($q$select count(*) from public.scores where round = 'finalist_selection'$q$, 8, 'judges scored only their assignments');

select tests.login('00000000-0000-4000-9000-0000000000a1');
select tests.count('select count(*) from public.profiles', 1, 'judge sees no participant profiles');
select tests.count('select count(*) from public.applications', 0, 'judge sees no applications');
select tests.count('select count(*) from public.team_members', 0, 'judge sees no team members');
select tests.affects($q$update public.submissions set finalist = true$q$, 0, 'judge cannot mark finalists');
select tests.logout();

-- Admin picks finalists, closes round 1 --------------------------------------------

select tests.login('00000000-0000-4000-9000-0000000000ad');
select tests.affects($q$update public.submissions set finalist = true where title in ('Edited by teammate', 'Proje 6', 'Proje 11')$q$, 3, 'admin marks finalists');
update public.settings set value = '["finalist_selection"]' where key = 'closed_rounds';
select tests.logout();
create temporary table nonfinal on commit drop as select id from public.submissions where not finalist;
grant select on nonfinal to authenticated;

select tests.login('00000000-0000-4000-9000-0000000000a1');
select tests.throws($q$update public.scores set comment = 'late' where round = 'finalist_selection'$q$, 'round_closed');
select tests.count('select count(*) from public.submissions where finalist', 3, 'every judge sees the finalists');
select tests.affects($q$insert into public.scores (submission_id, round, criteria) select id, 'final', '{"technical":9,"impact":9,"innovation":8,"demo":9,"completeness":8}' from public.submissions where finalist$q$, 3, 'judge scores the final');
select tests.throws($q$insert into public.scores (submission_id, round, criteria) select id, 'final', '{"technical":9}' from nonfinal$q$, 'row-level security');
select tests.logout();

select tests.login('00000000-0000-4000-9000-0000000000a2');
select tests.affects($q$insert into public.scores (submission_id, round, criteria) select id, 'final', '{"technical":6,"impact":7,"innovation":8,"demo":5,"completeness":7}' from public.submissions where finalist$q$, 3, 'second judge scores the final');
select tests.logout();

select tests.count($q$select count(*) from public.scores where round = 'final'$q$, 6, 'final scores recorded');

-- After the deadline, submissions are locked -------------------------------------

update public.settings set value = to_jsonb(now() - interval '1 second') where key = 'submission_deadline';
select tests.login(tests.p(1));
select tests.affects($q$update public.submissions set title = 'After deadline'$q$, 0, 'no edits after the deadline');
select tests.logout();

-- Role rules ----------------------------------------------------------------------

select tests.login('00000000-0000-4000-9000-0000000000ad');
select tests.throws($q$update public.profiles set role = 'owner' where id = auth.uid()$q$, 'owner_only');
select tests.throws($q$update public.profiles set role = 'judge' where id = auth.uid()$q$, 'own_role');
select tests.throws($q$update public.profiles set disabled_at = now() where email = 'owner@test.invalid'$q$, 'owner');
select tests.affects($q$update public.profiles set disabled_at = now() where email = 'j3@test.invalid'$q$, 1, 'admin disables a judge');
select tests.logout();

select tests.login(tests.p(3));
select tests.throws($q$update public.profiles set disabled_at = now() where id = auth.uid()$q$, 'disable_not_allowed');
select tests.logout();

-- Storage: participants only touch their own CV folder ---------------------------

select tests.login(tests.p(1));
select tests.affects($q$insert into storage.objects (bucket_id, name) values ('cvs', auth.uid() || '/cv.pdf')$q$, 1, 'participant uploads own CV');
select tests.throws($q$insert into storage.objects (bucket_id, name) values ('cvs', '00000000-0000-4000-9000-000000000002/cv.pdf')$q$, 'row-level security');
select tests.throws($q$insert into storage.objects (bucket_id, name) values ('public-media', 'sponsors/x.png')$q$, 'row-level security');
select tests.logout();
select tests.login(tests.p(2));
select tests.count($q$select count(*) from storage.objects where bucket_id = 'cvs'$q$, 0, 'B cannot see A''s CV');
select tests.logout();
select tests.login('00000000-0000-4000-9000-0000000000ad');
select tests.count($q$select count(*) from storage.objects where bucket_id = 'cvs'$q$, 1, 'admin can read CVs');
select tests.logout();

select 'ALL FLOW TESTS PASSED' as result;

rollback;
