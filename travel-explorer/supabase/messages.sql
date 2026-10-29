-- ===========================================================================
-- Travel Explorer — contact form table
-- Run this once in Supabase: Dashboard → SQL Editor → New query → Run.
--
-- Security model: anyone visiting the site may INSERT a message,
-- but nobody can read, edit or delete messages through the public API.
-- You read submissions in the Supabase dashboard (Table Editor → messages).
-- ===========================================================================

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text not null check (subject in ('Feedback', 'Correction', 'Suggest a destination', 'Trip planning', 'Other')),
  destination text check (destination is null or char_length(destination) <= 120),
  message     text not null check (char_length(message) between 10 and 2000),
  page_url    text check (page_url is null or char_length(page_url) <= 500)
);

-- Turn on Row Level Security (no policy = no access).
alter table public.messages enable row level security;

-- Allow the public (anon) role to insert new messages only.
drop policy if exists "Public can send messages" on public.messages;
create policy "Public can send messages"
  on public.messages
  for insert
  to anon, authenticated
  with check (true);

-- Belt and braces: the public roles may insert, and nothing else.
revoke all on public.messages from anon, authenticated;
grant insert on public.messages to anon, authenticated;

-- Optional: newest messages first when browsing in the dashboard.
create index if not exists messages_created_at_idx on public.messages (created_at desc);
