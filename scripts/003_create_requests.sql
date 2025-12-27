-- Create skill requests table
create table if not exists public.skill_requests (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  hours_requested decimal(10, 2) not null,
  status text default 'pending',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.skill_requests enable row level security;

-- RLS Policies for skill_requests
create policy "skill_requests_select_own"
  on public.skill_requests for select
  using (auth.uid() = requester_id or auth.uid() = provider_id);

create policy "skill_requests_insert_own"
  on public.skill_requests for insert
  with check (auth.uid() = requester_id);

create policy "skill_requests_update_own"
  on public.skill_requests for update
  using (auth.uid() = provider_id or auth.uid() = requester_id);

create policy "skill_requests_delete_own"
  on public.skill_requests for delete
  using (auth.uid() = requester_id or auth.uid() = provider_id);
