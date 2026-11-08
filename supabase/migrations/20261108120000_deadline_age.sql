-- Organizer decisions (8 Nov 2026):
-- * Applications close on 31 March 2027, 23:59 Türkiye time.
-- * Participants must be 18 or older.

insert into public.settings (key, value, is_public, description) values
  ('application_deadline', '"2027-03-31T23:59:00+03:00"', true, 'Applications cannot be submitted after this time')
on conflict (key) do update set value = excluded.value, is_public = true, description = excluded.description;

create or replace function public.applications_open() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.setting('application_status') #>> '{}' = 'open'
     and coalesce(now() < public.setting_time('application_deadline'), true)
$$;

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
    if not public.applications_open() then
      raise exception 'applications_not_open' using errcode = '42501';
    end if;
    if new.status = 'submitted' and new.answers ->> 'age' ~ '^[0-9]{1,3}$' and (new.answers ->> 'age')::int < 18 then
      raise exception 'under_18' using errcode = '42501';
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
      if not public.applications_open() then
        raise exception 'applications_not_open' using errcode = '42501';
      end if;
      -- is_minor is a generated column: compute from the new answers.
      if new.answers ->> 'age' ~ '^[0-9]{1,3}$' and (new.answers ->> 'age')::int < 18 then
        raise exception 'under_18' using errcode = '42501';
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
