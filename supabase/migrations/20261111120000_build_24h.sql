-- Organizer decision (11 Nov 2026): building runs 24 hours,
-- Saturday 17 April 2027 12:00 to Sunday 18 April 2027 12:00, Türkiye time.
-- Only moves values still at the old defaults, so a time set from the admin panel is kept.

update public.settings set value = '"2027-04-17T12:00:00+03:00"'
where key = 'hack_start' and value = '"2027-04-17T11:00:00+03:00"'::jsonb;

update public.settings set value = '"2027-04-18T12:00:00+03:00"'
where key = 'submission_deadline' and value = '"2027-04-18T15:00:00+03:00"'::jsonb;
