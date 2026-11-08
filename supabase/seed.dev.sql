-- ============================================================================
-- DEV ONLY: fake data for a LOCAL database. Never run this against production.
-- 25 fake applicants (seedNN@seed.invalid), 3 judges, 1 admin, teams,
-- submissions and settings that put the event "in progress".
--
--   psql "$LOCAL_DB_URL" -f supabase/seed.dev.sql
--
-- Refuses to run if the database already has any non-seed user.
-- ============================================================================

do $$
begin
  if exists (select 1 from auth.users where email not like '%@seed.invalid') then
    raise exception 'seed.dev.sql refused: this database has real users';
  end if;
end $$;

insert into auth.users (id, email, aud, role)
select ('00000000-0000-4000-a000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'seed' || lpad(i::text, 2, '0') || '@seed.invalid', 'authenticated', 'authenticated'
from generate_series(1, 25) i
on conflict (id) do nothing;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-4000-a000-0000000000a1', 'judge1@seed.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-0000000000a2', 'judge2@seed.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-0000000000a3', 'judge3@seed.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-0000000000ad', 'admin@seed.invalid', 'authenticated', 'authenticated')
on conflict (id) do nothing;

update public.profiles set role = 'judge' where email like 'judge_@seed.invalid';
update public.profiles set role = 'admin' where email = 'admin@seed.invalid';

update public.settings set value = '"open"' where key = 'application_status';
update public.settings set value = to_jsonb(now() - interval '2 hours') where key = 'hack_start';
update public.settings set value = to_jsonb(now() + interval '1 day') where key = 'submission_deadline';
update public.settings set value = to_jsonb(now() + interval '7 days') where key = 'confirm_deadline';

-- Applications (inserted as the database owner, so the status can be set directly).
insert into public.applications (user_id, status, submitted_at, answers, consents)
select
  ('00000000-0000-4000-a000-0000000000' || lpad(i::text, 2, '0'))::uuid,
  (case
    when i <= 16 then 'checked_in'
    when i <= 18 then 'confirmed'
    when i <= 20 then 'accepted'
    when i <= 22 then 'waitlisted'
    when i = 23 then 'rejected'
    else 'submitted'
  end)::public.application_status,
  now() - (i || ' hours')::interval,
  jsonb_build_object(
    'first_name', (array['Ada','Deniz','Ece','Mert','Zeynep','Can','Elif','Kerem','Selin','Emre'])[1 + i % 10],
    'last_name', 'Örnek' || i,
    'phone', '+90 500 000 00 ' || lpad(i::text, 2, '0'),
    'age', case when i = 24 then '17' else (19 + i % 6)::text end,
    'university', (array['Aydın Adnan Menderes Üniversitesi','Ege Üniversitesi','Dokuz Eylül Üniversitesi','Pamukkale Üniversitesi'])[1 + i % 4],
    'department', (array['Bilgisayar Mühendisliği','Tıp','Endüstri Mühendisliği','İşletme'])[1 + i % 4],
    'level', case when i % 5 = 0 then 'graduate' else 'bachelor' end,
    'grad_year', (2027 + i % 3)::text,
    'country', 'Türkiye',
    'city', 'Aydın',
    'team_status', case when i % 3 = 0 then 'looking' else 'have' end,
    'roles', case when i % 2 = 0 then '["frontend","design"]'::jsonb else '["backend","ai_ml"]'::jsonb end,
    'experience', (array['beginner','intermediate','advanced'])[1 + i % 3],
    'motivation', 'Örnek motivasyon metni.',
    'tshirt', (array['S','M','L','XL'])[1 + i % 4],
    'diet', case when i % 7 = 0 then 'Vejetaryen' else '' end,
    'emergency_name', 'Yakın Kişi',
    'emergency_phone', '+90 500 111 11 11',
    'github', '', 'linkedin', '', 'portfolio', '', 'cv_path', '', 'prior_hackathon', 'no'
  ),
  jsonb_build_object(
    'kvkk', jsonb_build_object('accepted', true, 'at', now()),
    'coc', jsonb_build_object('accepted', true, 'at', now()),
    'rules', jsonb_build_object('accepted', true, 'at', now()),
    'marketing', jsonb_build_object('accepted', i % 3 = 0, 'at', now())
  )
from generate_series(1, 25) i
on conflict (user_id) do nothing;

-- Four teams of 4 among the checked-in people; their submissions.
insert into public.teams (id, name, join_code) values
  ('00000000-0000-4000-b000-000000000001', 'Örnek Takım 1', 'SEED1AA2'),
  ('00000000-0000-4000-b000-000000000002', 'Örnek Takım 2', 'SEED2BB3'),
  ('00000000-0000-4000-b000-000000000003', 'Örnek Takım 3', 'SEED3CC4'),
  ('00000000-0000-4000-b000-000000000004', 'Örnek Takım 4', 'SEED4DD5')
on conflict (id) do nothing;

insert into public.team_members (team_id, user_id)
select ('00000000-0000-4000-b000-00000000000' || (1 + (i - 1) / 4))::uuid, ('00000000-0000-4000-a000-0000000000' || lpad(i::text, 2, '0'))::uuid
from generate_series(1, 16) i
on conflict do nothing;

insert into public.submissions (team_id, title, problem, description, repo_url, ai_tools, demo_is_local, submitted_at)
select ('00000000-0000-4000-b000-00000000000' || t)::uuid, 'Örnek Proje ' || t, 'Örnek problem.', 'Örnek açıklama.',
       'https://github.com/example/seed-project-' || t, 'Yok', true, now()
from generate_series(1, 4) t
on conflict (team_id) do nothing;
