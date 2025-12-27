-- Create skills table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  hourly_rate decimal(10, 2) default 1,
  certification_level text,
  certification_file_url text,
  demo_video_url text,
  is_verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.skills enable row level security;

-- RLS Policies for skills
create policy "skills_select_all"
  on public.skills for select
  using (true);

create policy "skills_insert_own"
  on public.skills for insert
  with check (auth.uid() = user_id);

create policy "skills_update_own"
  on public.skills for update
  using (auth.uid() = user_id);

create policy "skills_delete_own"
  on public.skills for delete
  using (auth.uid() = user_id);
