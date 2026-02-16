-- Supabase Auth + Premium Tiers Migration
-- Run this in the Supabase SQL Editor

-- profiles table
create table public.profiles (
  id uuid references auth.users primary key,
  email text,
  display_name text,
  tier text default 'free' check (tier in ('free', 'premium')),
  tier_expires_at timestamptz,
  lifetime boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- payments audit log
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  tx_signature text unique not null,
  amount_sol numeric not null,
  tier_granted text not null,
  plan_type text not null check (plan_type in ('monthly', 'lifetime')),
  status text default 'pending' check (status in ('pending', 'verified', 'failed', 'rejected')),
  block_time bigint,
  verification_result jsonb,
  verified_at timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.payments enable row level security;

create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update display_name" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "Users read own payments" on public.payments
  for select using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
