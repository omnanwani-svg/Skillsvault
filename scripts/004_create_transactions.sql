-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.skill_requests(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  hours_exchanged decimal(10, 2) not null,
  transaction_type text not null,
  status text default 'completed',
  created_at timestamp with time zone default now()
);

alter table public.transactions enable row level security;

-- RLS Policies for transactions
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = from_user_id or auth.uid() = to_user_id);
