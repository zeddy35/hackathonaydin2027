-- Tasks 3 and 4: participant panel, admin tools, judging.
-- Builds on 20261107120000_init.sql. Error messages are stable codes the app maps to text.

------------------------------------------------------------------------------
-- Settings
------------------------------------------------------------------------------

insert into public.settings (key, value, is_public, description) values
  ('confirm_deadline', 'null', true, 'Accepted participants confirm attendance by this time (null = no deadline)'),
  ('applications_open_label', '{"tr":"Ocak 2027","en":"January 2027"}', true, 'Shown while applications are upcoming'),
  ('mlh_badge', 'false', true, 'Header MLH trust badge. Turn on only after MLH confirms membership.'),
  ('mlh_badge_href', '""', true, 'Link of the MLH trust badge (from MLH)'),
  ('mlh_badge_image', '""', true, 'Image URL of the MLH trust badge (from MLH)'),
  ('closed_rounds', '[]', true, 'Judging rounds whose scores are locked')
on conflict (key) do nothing;

update public.settings set value = '["phone","tshirt","diet","emergency_name","emergency_phone","github","linkedin","portfolio","cv_path"]'
  where key = 'application_editable_after_submit';
update public.settings set value = '["marketing","mlh_marketing"]'
  where key = 'consents_editable_after_submit';
update public.settings set value =
  '[{"key":"technical","tr":"Teknik uygulama","en":"Technical execution","weight":20},
    {"key":"impact","tr":"Etki ve problem","en":"Impact and problem","weight":20},
    {"key":"innovation","tr":"Yenilik","en":"Innovation","weight":20},
    {"key":"demo","tr":"Demo ve sunum","en":"Demo and presentation","weight":20},
    {"key":"completeness","tr":"Tamamlanmışlık ve kullanıcı deneyimi","en":"Completeness and user experience","weight":20}]',
  description = 'PROPOSED, awaiting organizer approval. Each criterion is scored 1-10.'
  where key = 'judging_criteria';

------------------------------------------------------------------------------
-- Profiles: disabled accounts; nobody raises their own role
------------------------------------------------------------------------------

alter table public.profiles add column disabled_at timestamptz;

create or replace function public.profiles_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if public.is_privileged() then
    return new;
  end if;
  if new.id <> old.id or new.email <> old.email or new.created_at <> old.created_at then
    raise exception 'profile_locked_field' using errcode = '42501';
  end if;
  if new.disabled_at is distinct from old.disabled_at then
    if not public.is_admin() or old.id = auth.uid() then
      raise exception 'disable_not_allowed' using errcode = '42501';
    end if;
    if old.role = 'owner' then
      raise exception 'owner_cannot_be_disabled' using errcode = '42501';
    end if;
  end if;
  if new.role <> old.role then
    if not public.is_admin() then
      raise exception 'role_change_not_allowed' using errcode = '42501';
    end if;
    -- Only an owner can create or change an owner.
    if (new.role = 'owner' or old.role = 'owner') and not public.is_owner() then
      raise exception 'owner_only' using errcode = '42501';
    end if;
    -- Admins cannot change their own role (an owner may step down if another owner remains).
    if old.id = auth.uid() and not public.is_owner() then
      raise exception 'own_role' using errcode = '42501';
    end if;
  end if;
  if old.role = 'owner' and new.role <> 'owner'
     and (select count(*) from public.profiles where role = 'owner') <= 1 then
    raise exception 'last_owner' using errcode = '42501';
  end if;
  return new;
end $$;

------------------------------------------------------------------------------
-- Applications: matching wish, under-18 flag, confirmation deadline, audit
------------------------------------------------------------------------------

alter table public.applications
  add column wants_match boolean not null default false,
  add column is_minor boolean generated always as (
    case when answers ->> 'age' ~ '^[0-9]{1,3}$' then (answers ->> 'age')::int < 18 else false end
  ) stored;

create or replace function public.applications_guard() returns trigger
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
    elsif old.status = 'accepted' and new.status = 'declined' then
      null;
    elsif old.status = 'accepted' and new.status = 'confirmed' then
      if coalesce(public.setting_time('confirm_deadline') < now(), false) then
        raise exception 'confirm_deadline_passed' using errcode = '42501';
      end if;
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

-- Every status change made by someone other than the applicant (admin decision, check-in).
create function public.log_application_status() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is distinct from new.user_id then
    insert into public.audit_log (actor_id, action, target_type, target_id, details)
    values (auth.uid(), 'application_status', 'application', new.id::text,
            jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end $$;

create trigger applications_log_status
  after update of status on public.applications
  for each row when (old.status is distinct from new.status)
  execute function public.log_application_status();

-- Admin-only notes on an application.
create table public.application_notes (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications (id) on delete cascade,
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index application_notes_app_idx on public.application_notes (application_id);

------------------------------------------------------------------------------
-- Submissions: finalist flag (admin only)
------------------------------------------------------------------------------

alter table public.submissions add column finalist boolean not null default false;

create or replace function public.submissions_guard() returns trigger
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
  new.finalist := case when tg_op = 'INSERT' then false else old.finalist end;
  new.updated_by := auth.uid();
  new.submitted_at := case when tg_op = 'INSERT' then now() else coalesce(old.submitted_at, now()) end;
  if tg_op = 'INSERT' then
    new.created_at := now();
  end if;
  return new;
end $$;

------------------------------------------------------------------------------
-- Judging: assignments, visibility, locked rounds, score validation
------------------------------------------------------------------------------

create table public.judge_assignments (
  submission_id uuid not null references public.submissions (id) on delete cascade,
  judge_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (submission_id, judge_id)
);

create index judge_assignments_judge_idx on public.judge_assignments (judge_id);

-- Finalist selection: only assigned judges. Final: every judge sees the finalists.
create function public.judge_can_see(sub uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_judge() and (
    exists (select 1 from public.judge_assignments where submission_id = sub and judge_id = auth.uid())
    or exists (select 1 from public.submissions where id = sub and finalist)
  )
$$;

create function public.judge_can_score(sub uuid, r public.score_round) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_judge() and case r
    when 'finalist_selection' then exists (select 1 from public.judge_assignments where submission_id = sub and judge_id = auth.uid())
    else exists (select 1 from public.submissions where id = sub and finalist)
  end
$$;

create function public.round_closed(r public.score_round) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.setting('closed_rounds') ? r::text, false)
$$;

create function public.scores_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  k text;
  v jsonb;
begin
  if not (public.is_privileged() or public.is_admin()) then
    if public.round_closed(coalesce(new.round, old.round)) then
      raise exception 'round_closed' using errcode = '42501';
    end if;
    if tg_op = 'UPDATE' and (new.judge_id <> old.judge_id or new.submission_id <> old.submission_id or new.round <> old.round) then
      raise exception 'score_locked_field' using errcode = '42501';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  if jsonb_typeof(new.criteria) <> 'object' then
    raise exception 'invalid_score' using errcode = '22023';
  end if;
  for k, v in select * from jsonb_each(new.criteria) loop
    if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric not in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10) then
      raise exception 'invalid_score' using errcode = '22023';
    end if;
  end loop;
  return new;
end $$;

create trigger scores_guard
  before insert or update or delete on public.scores
  for each row execute function public.scores_guard();

drop policy submissions_select on public.submissions;
create policy submissions_select on public.submissions for select to authenticated
  using (public.is_team_member(team_id) or public.judge_can_see(id) or public.is_admin());

drop policy scores_insert on public.scores;
drop policy scores_update on public.scores;
drop policy scores_delete on public.scores;
create policy scores_insert on public.scores for insert to authenticated
  with check ((judge_id = auth.uid() and public.judge_can_score(submission_id, round)) or public.is_admin());
create policy scores_update on public.scores for update to authenticated
  using ((judge_id = auth.uid() and public.judge_can_score(submission_id, round)) or public.is_admin())
  with check ((judge_id = auth.uid() and public.judge_can_score(submission_id, round)) or public.is_admin());
create policy scores_delete on public.scores for delete to authenticated
  using ((judge_id = auth.uid() and public.judge_can_score(submission_id, round)) or public.is_admin());

-- Judges see team names only for submissions they can see.
drop policy teams_select on public.teams;
create policy teams_select on public.teams for select to authenticated
  using (
    public.is_team_member(id) or public.is_admin()
    or (public.is_judge() and exists (select 1 from public.submissions s where s.team_id = id and public.judge_can_see(s.id)))
  );

------------------------------------------------------------------------------
-- Row level security for the new tables
------------------------------------------------------------------------------

alter table public.application_notes enable row level security;
alter table public.judge_assignments enable row level security;

create policy notes_admin on public.application_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy assignments_select on public.judge_assignments for select to authenticated
  using (judge_id = auth.uid() or public.is_admin());
create policy assignments_admin_write on public.judge_assignments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.application_notes, public.judge_assignments from anon;
