-- Hackathon Aydın 2027: core schema, roles and row level security.
-- Runs on a clean Supabase database. Every table has RLS enabled.
-- Error messages raised here are stable codes (e.g. 'team_full') that the app maps to user-facing text.

------------------------------------------------------------------------------
-- Types
------------------------------------------------------------------------------

create type public.user_role as enum ('participant', 'judge', 'admin', 'owner');
create type public.application_status as enum (
  'draft', 'submitted', 'accepted', 'waitlisted', 'rejected', 'confirmed', 'declined', 'checked_in'
);
create type public.score_round as enum ('finalist_selection', 'final');
create type public.sponsor_tier as enum ('title', 'gold', 'silver', 'inkind', 'tech', 'community');
create type public.person_kind as enum ('judge', 'mentor');

------------------------------------------------------------------------------
-- Generic helpers
------------------------------------------------------------------------------

-- 256 random bits from two v4 UUIDs (gen_random_uuid uses a CSPRNG). No pgcrypto needed.
create function public.random_token() returns text
language sql volatile set search_path = '' as $$
  select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
$$;

-- 8 characters, letters and digits mixed, no look-alikes (0/O, 1/I/L).
create function public.random_join_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  idx constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11]; -- fully random bytes of a v4 UUID
  bytes bytea;
  code text;
begin
  loop
    bytes := uuid_send(gen_random_uuid());
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, (get_byte(bytes, idx[i]) % length(alphabet)) + 1, 1);
    end loop;
    exit when code ~ '[A-Z]' and code ~ '[0-9]';
  end loop;
  return code;
end $$;

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- True for the service role (server with SUPABASE_SERVICE_ROLE_KEY) and for direct
-- database sessions (SQL editor, migrations), which carry no JWT claims.
-- Requests through the API always carry claims with role anon/authenticated/service_role.
create function public.is_privileged() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    'service_role'
  ) = 'service_role'
$$;

------------------------------------------------------------------------------
-- Profiles and roles
------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'participant',
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  created_at timestamptz not null default now()
);

create function public.app_role() returns public.user_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.app_role() in ('admin', 'owner'), false)
$$;

create function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.app_role() = 'owner', false)
$$;

create function public.is_judge() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.app_role() = 'judge', false)
$$;

-- New auth user → profile. Role always starts as participant; owners are promoted
-- by the server on first sign-in (OWNER_EMAILS), never by client input.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, locale)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when new.raw_user_meta_data ->> 'locale' in ('tr', 'en') then new.raw_user_meta_data ->> 'locale' else 'tr' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Column and role rules for profile updates (runs as the caller).
create function public.profiles_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if public.is_privileged() then
    return new;
  end if;
  if new.id <> old.id or new.email <> old.email or new.created_at <> old.created_at then
    raise exception 'profile_locked_field' using errcode = '42501';
  end if;
  if new.role <> old.role then
    if not public.is_admin() then
      raise exception 'role_change_not_allowed' using errcode = '42501';
    end if;
    -- Only an owner can create or change an owner.
    if (new.role = 'owner' or old.role = 'owner') and not public.is_owner() then
      raise exception 'owner_only' using errcode = '42501';
    end if;
  end if;
  if old.role = 'owner' and new.role <> 'owner'
     and (select count(*) from public.profiles where role = 'owner') <= 1 then
    raise exception 'last_owner' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.profiles_guard();

-- Owners cannot be deleted (this also blocks deleting their auth user).
create function public.profiles_protect_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.role = 'owner' then
    raise exception 'owner_cannot_be_deleted' using errcode = '42501';
  end if;
  return old;
end $$;

create trigger profiles_protect_owner
  before delete on public.profiles
  for each row execute function public.profiles_protect_owner();

------------------------------------------------------------------------------
-- Audit log (append only)
------------------------------------------------------------------------------

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);

create function public.log_role_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, details)
  values (auth.uid(), 'role_change', 'profile', new.id::text,
          jsonb_build_object('from', old.role, 'to', new.role, 'email', new.email));
  return new;
end $$;

create trigger profiles_log_role_change
  after update of role on public.profiles
  for each row when (old.role is distinct from new.role)
  execute function public.log_role_change();

------------------------------------------------------------------------------
-- Settings
------------------------------------------------------------------------------

create table public.settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

create function public.setting(setting_key text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select value from public.settings where key = setting_key
$$;

create function public.setting_time(setting_key text) returns timestamptz
language sql stable security definer set search_path = '' as $$
  select nullif(public.setting(setting_key) #>> '{}', '')::timestamptz
$$;

insert into public.settings (key, value, is_public, description) values
  ('application_status', '"upcoming"', true, 'upcoming | open | closed'),
  ('hack_start', '"2027-04-17T11:00:00+03:00"', true, 'Building starts; submissions open'),
  ('submission_deadline', '"2027-04-18T15:00:00+03:00"', true, 'Submissions close'),
  ('teams_lock_at', 'null', true, 'Teams lock at this time (null = not set)'),
  ('mlh_enabled', 'false', true, 'Show MLH fields on the application form'),
  ('application_editable_after_submit', '[]', false, 'Answer keys a participant may still edit after submitting'),
  ('consents_editable_after_submit', '[]', false, 'Consent keys a participant may still change after submitting (e.g. optional marketing)'),
  ('judging_criteria',
   '[{"key":"impact","tr":"Problem ve etki","en":"Problem and impact","weight":25},
     {"key":"technical","tr":"Teknik uygulama","en":"Technical execution","weight":30},
     {"key":"product","tr":"Ürün ve kullanıcı deneyimi","en":"Product and user experience","weight":25},
     {"key":"presentation","tr":"Sunum ve demo","en":"Presentation and demo","weight":20}]',
   false, 'PROPOSED, awaiting organizer approval');

------------------------------------------------------------------------------
-- Applications
------------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  status public.application_status not null default 'draft',
  answers jsonb not null default '{}',
  -- One key per consent, each with its own timestamp: {"kvkk": {"accepted": true, "at": "..."}}
  consents jsonb not null default '{}',
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references public.profiles (id) on delete set null,
  checkin_token text not null unique default public.random_token(),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_status_idx on public.applications (status);

create function public.applications_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  editable_answers text[];
  editable_consents text[];
begin
  if tg_op = 'INSERT' then
    if public.is_privileged() or public.is_admin() then
      return new;
    end if;
    if new.user_id is distinct from auth.uid() then
      raise exception 'not_your_application' using errcode = '42501';
    end if;
    if new.status not in ('draft', 'submitted') then
      raise exception 'status_change_not_allowed' using errcode = '42501';
    end if;
    if public.setting('application_status') #>> '{}' is distinct from 'open' then
      raise exception 'applications_not_open' using errcode = '42501';
    end if;
    new.decided_at := null;
    new.decided_by := null;
    new.checked_in_at := null;
    new.checkin_token := public.random_token();
    new.submitted_at := case when new.status = 'submitted' then now() end;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  -- UPDATE
  new.updated_at := now();

  if public.is_privileged() or public.is_admin() then
    if new.status is distinct from old.status then
      if new.status in ('accepted', 'waitlisted', 'rejected') then
        new.decided_at := now();
        new.decided_by := auth.uid();
      elsif new.status = 'checked_in' and new.checked_in_at is null then
        new.checked_in_at := now();
      elsif new.status = 'submitted' and new.submitted_at is null then
        new.submitted_at := now();
      end if;
    end if;
    return new;
  end if;

  -- Participant: these columns are server-controlled.
  if new.id <> old.id
     or new.user_id <> old.user_id
     or new.checkin_token <> old.checkin_token
     or new.created_at <> old.created_at
     or new.submitted_at is distinct from old.submitted_at
     or new.decided_at is distinct from old.decided_at
     or new.decided_by is distinct from old.decided_by
     or new.checked_in_at is distinct from old.checked_in_at then
    raise exception 'application_locked_field' using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if old.status = 'draft' and new.status = 'submitted' then
      if public.setting('application_status') #>> '{}' is distinct from 'open' then
        raise exception 'applications_not_open' using errcode = '42501';
      end if;
      new.submitted_at := now();
    elsif old.status = 'accepted' and new.status in ('confirmed', 'declined') then
      null; -- the only decision a participant makes
    else
      raise exception 'status_change_not_allowed' using errcode = '42501';
    end if;
  end if;

  if old.status <> 'draft' then
    editable_answers := array(select jsonb_array_elements_text(coalesce(public.setting('application_editable_after_submit'), '[]')));
    editable_consents := array(select jsonb_array_elements_text(coalesce(public.setting('consents_editable_after_submit'), '[]')));
    if (new.answers - editable_answers) is distinct from (old.answers - editable_answers)
       or (new.consents - editable_consents) is distinct from (old.consents - editable_consents) then
      raise exception 'application_locked_after_submit' using errcode = '42501';
    end if;
  end if;

  return new;
end $$;

create trigger applications_guard
  before insert or update on public.applications
  for each row execute function public.applications_guard();

------------------------------------------------------------------------------
-- Teams
------------------------------------------------------------------------------

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  join_code text not null unique default public.random_join_code()
    check (join_code ~ '^[A-Z0-9]{6,8}$'),
  created_by uuid references public.profiles (id) on delete set null,
  locked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null unique references public.profiles (id) on delete cascade, -- one team per user
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_members_team_idx on public.team_members (team_id);

create function public.is_team_member(team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.team_members where team_id = team and user_id = auth.uid())
$$;

create function public.is_teammate(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.team_members a
    join public.team_members b on a.team_id = b.team_id
    where a.user_id = auth.uid() and b.user_id = other
  )
$$;

create function public.team_is_locked(team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select locked_at is not null from public.teams where id = team), false)
      or coalesce(public.setting_time('teams_lock_at') <= now(), false)
$$;

-- Max 5 members, enforced in the database. The row lock serialises concurrent joins.
create function public.team_members_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.teams where id = new.team_id for update;
  if (select count(*) from public.team_members where team_id = new.team_id) >= 5 then
    raise exception 'team_full' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger team_members_limit
  before insert on public.team_members
  for each row execute function public.team_members_limit();

-- Remove a team when its last member leaves, unless it already has a submission.
create function public.team_members_cleanup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.team_members where team_id = old.team_id)
     and not exists (select 1 from public.submissions where team_id = old.team_id) then
    delete from public.teams where id = old.team_id;
  end if;
  return old;
end $$;

-- Participants may only rename their team, and only while it is unlocked.
create function public.teams_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if public.is_privileged() or public.is_admin() then
    return new;
  end if;
  if new.id <> old.id or new.join_code <> old.join_code or new.created_by is distinct from old.created_by
     or new.locked_at is distinct from old.locked_at or new.created_at <> old.created_at then
    raise exception 'team_locked_field' using errcode = '42501';
  end if;
  if public.team_is_locked(old.id) then
    raise exception 'teams_locked' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger teams_guard
  before update on public.teams
  for each row execute function public.teams_guard();

------------------------------------------------------------------------------
-- Submissions (one per team)
------------------------------------------------------------------------------

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.teams (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 120),
  problem text not null default '' check (char_length(problem) <= 2000),
  description text not null default '' check (char_length(description) <= 5000),
  repo_url text check (repo_url is null or repo_url ~* '^https?://'),
  demo_url text check (demo_url is null or demo_url ~* '^https?://'),
  demo_is_local boolean not null default false,
  slides_url text check (slides_url is null or slides_url ~* '^https?://'),
  ai_tools text not null default '' check (char_length(ai_tools) <= 2000),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create trigger team_members_cleanup
  after delete on public.team_members
  for each row execute function public.team_members_cleanup();

-- Participant can submit: checked in, in the team, inside the building window (server time).
create function public.can_submit(team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_team_member(team)
     and exists (select 1 from public.applications where user_id = auth.uid() and status = 'checked_in')
     and now() >= coalesce(public.setting_time('hack_start'), 'infinity')
     and now() < coalesce(public.setting_time('submission_deadline'), '-infinity')
$$;

create function public.submissions_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  if public.is_privileged() or public.is_admin() then
    return new;
  end if;
  if tg_op = 'UPDATE' and (new.team_id <> old.team_id or new.id <> old.id or new.created_at <> old.created_at) then
    raise exception 'submission_locked_field' using errcode = '42501';
  end if;
  new.updated_by := auth.uid();
  new.submitted_at := case when tg_op = 'INSERT' then now() else coalesce(old.submitted_at, now()) end;
  if tg_op = 'INSERT' then
    new.created_at := now();
  end if;
  return new;
end $$;

create trigger submissions_guard
  before insert or update on public.submissions
  for each row execute function public.submissions_guard();

------------------------------------------------------------------------------
-- Scores
------------------------------------------------------------------------------

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  judge_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  round public.score_round not null,
  criteria jsonb not null default '{}',
  comment text check (comment is null or char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, judge_id, round)
);

create index scores_submission_idx on public.scores (submission_id);

create trigger scores_updated_at before update on public.scores
  for each row execute function public.set_updated_at();

------------------------------------------------------------------------------
-- Site content: sponsors and people (same model as src/data)
------------------------------------------------------------------------------

create table public.sponsors (
  id text primary key,
  name text not null,
  tier public.sponsor_tier not null,
  logo text,
  url text not null,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger sponsors_updated_at before update on public.sponsors
  for each row execute function public.set_updated_at();

create table public.people (
  id text primary key,
  name text not null,
  role text not null default '',
  org text not null default '',
  photo text,
  url text,
  kind public.person_kind not null,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger people_updated_at before update on public.people
  for each row execute function public.set_updated_at();

------------------------------------------------------------------------------
-- Team RPCs for participants (join codes are never readable directly)
------------------------------------------------------------------------------

-- Who may form teams. Task 3 may tighten this.
create function public.assert_can_team() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if public.app_role() is distinct from 'participant' then
    raise exception 'participants_only' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.applications
    where user_id = auth.uid() and status in ('accepted', 'confirmed', 'checked_in')
  ) then
    raise exception 'application_not_accepted' using errcode = '42501';
  end if;
end $$;

create function public.create_team(team_name text) returns public.teams
language plpgsql security definer set search_path = '' as $$
declare
  t public.teams;
begin
  perform public.assert_can_team();
  if exists (select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'already_in_team' using errcode = 'P0001';
  end if;
  if coalesce(public.setting_time('teams_lock_at') <= now(), false) then
    raise exception 'teams_locked' using errcode = 'P0001';
  end if;
  insert into public.teams (name, created_by) values (btrim(team_name), auth.uid()) returning * into t;
  insert into public.team_members (team_id, user_id) values (t.id, auth.uid());
  return t;
end $$;

create function public.join_team(code text) returns public.teams
language plpgsql security definer set search_path = '' as $$
declare
  t public.teams;
begin
  perform public.assert_can_team();
  if exists (select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'already_in_team' using errcode = 'P0001';
  end if;
  select * into t from public.teams where join_code = upper(btrim(code));
  if not found then
    raise exception 'team_not_found' using errcode = 'P0001';
  end if;
  if public.team_is_locked(t.id) then
    raise exception 'teams_locked' using errcode = 'P0001';
  end if;
  insert into public.team_members (team_id, user_id) values (t.id, auth.uid());
  return t;
end $$;

create function public.leave_team() returns void
language plpgsql security definer set search_path = '' as $$
declare
  tid uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  select team_id into tid from public.team_members where user_id = auth.uid();
  if tid is null then
    raise exception 'not_in_team' using errcode = 'P0001';
  end if;
  if public.team_is_locked(tid) then
    raise exception 'teams_locked' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.submissions where team_id = tid and submitted_at is not null) then
    raise exception 'team_has_submission' using errcode = 'P0001';
  end if;
  delete from public.team_members where user_id = auth.uid();
end $$;

------------------------------------------------------------------------------
-- Row level security
------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.audit_log enable row level security;
alter table public.settings enable row level security;
alter table public.applications enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.submissions enable row level security;
alter table public.scores enable row level security;
alter table public.sponsors enable row level security;
alter table public.people enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin() or public.is_teammate(id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_delete on public.profiles for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- audit_log: admins read; admins append entries in their own name
create policy audit_select on public.audit_log for select to authenticated
  using (public.is_admin());
create policy audit_insert on public.audit_log for insert to authenticated
  with check (public.is_admin() and actor_id = auth.uid());

-- settings: public keys readable by everyone; judges also see judging criteria
create policy settings_select on public.settings for select to anon, authenticated
  using (is_public or public.is_admin() or (public.is_judge() and key = 'judging_criteria'));
create policy settings_write on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- applications: own or admin. Judges have no access.
create policy applications_select on public.applications for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy applications_insert on public.applications for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
create policy applications_update on public.applications for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy applications_delete on public.applications for delete to authenticated
  using ((user_id = auth.uid() and status = 'draft') or public.is_admin());

-- teams: members, judges (names for judging) and admins. Writes by admin or via RPCs.
create policy teams_select on public.teams for select to authenticated
  using (public.is_team_member(id) or public.is_judge() or public.is_admin());
create policy teams_update on public.teams for update to authenticated
  using (public.is_team_member(id) or public.is_admin())
  with check (public.is_team_member(id) or public.is_admin());
create policy teams_admin_insert on public.teams for insert to authenticated
  with check (public.is_admin());
create policy teams_admin_delete on public.teams for delete to authenticated
  using (public.is_admin());

-- team_members: see your own team; join via join_team(), leave via leave_team()
create policy team_members_select on public.team_members for select to authenticated
  using (public.is_team_member(team_id) or public.is_admin());
create policy team_members_admin_insert on public.team_members for insert to authenticated
  with check (public.is_admin());
create policy team_members_admin_delete on public.team_members for delete to authenticated
  using (public.is_admin());

-- submissions: team, judges, admins read; team writes inside the window
create policy submissions_select on public.submissions for select to authenticated
  using (public.is_team_member(team_id) or public.is_judge() or public.is_admin());
create policy submissions_insert on public.submissions for insert to authenticated
  with check (public.can_submit(team_id) or public.is_admin());
create policy submissions_update on public.submissions for update to authenticated
  using (public.can_submit(team_id) or public.is_admin())
  with check (public.can_submit(team_id) or public.is_admin());
create policy submissions_admin_delete on public.submissions for delete to authenticated
  using (public.is_admin());

-- scores: judges see and write only their own; admins everything
create policy scores_select on public.scores for select to authenticated
  using (judge_id = auth.uid() or public.is_admin());
create policy scores_insert on public.scores for insert to authenticated
  with check ((judge_id = auth.uid() and public.is_judge()) or public.is_admin());
create policy scores_update on public.scores for update to authenticated
  using ((judge_id = auth.uid() and public.is_judge()) or public.is_admin())
  with check ((judge_id = auth.uid() and public.is_judge()) or public.is_admin());
create policy scores_delete on public.scores for delete to authenticated
  using ((judge_id = auth.uid() and public.is_judge()) or public.is_admin());

-- sponsors / people: published rows are public
create policy sponsors_select on public.sponsors for select to anon, authenticated
  using (published or public.is_admin());
create policy sponsors_write on public.sponsors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy people_select on public.people for select to anon, authenticated
  using (published or public.is_admin());
create policy people_write on public.people for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

------------------------------------------------------------------------------
-- Privileges
------------------------------------------------------------------------------

-- Anonymous visitors only ever read public settings, sponsors and people.
revoke all on public.profiles, public.audit_log, public.applications, public.teams,
  public.team_members, public.submissions, public.scores from anon;
revoke insert, update, delete, truncate on public.settings, public.sponsors, public.people from anon;

revoke execute on function public.create_team(text), public.join_team(text), public.leave_team() from public, anon;
grant execute on function public.create_team(text), public.join_team(text), public.leave_team() to authenticated;
