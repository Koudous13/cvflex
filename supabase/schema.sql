-- ============================================================
-- Plateforme CV Adaptatif — Schéma initial
-- À exécuter dans Supabase SQL editor
-- ============================================================

-- ----- 1. profiles -----
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----- 2. base_cvs (CV de base de l'utilisateur) -----
create table if not exists public.base_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pdf_url text,
  extracted_text text,
  parsed_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists base_cvs_user_id_idx on public.base_cvs(user_id);

alter table public.base_cvs enable row level security;

create policy "base_cvs_select_own" on public.base_cvs
  for select using (auth.uid() = user_id);

create policy "base_cvs_insert_own" on public.base_cvs
  for insert with check (auth.uid() = user_id);

create policy "base_cvs_update_own" on public.base_cvs
  for update using (auth.uid() = user_id);

create policy "base_cvs_delete_own" on public.base_cvs
  for delete using (auth.uid() = user_id);

-- ----- 3. generated_cvs (CVs adaptés) -----
create table if not exists public.generated_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  base_cv_id uuid not null references public.base_cvs(id) on delete cascade,
  job_offer_text text not null,
  extra_info text,
  template_id text not null,
  generated_json jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index if not exists generated_cvs_user_id_idx on public.generated_cvs(user_id);
create index if not exists generated_cvs_created_at_idx on public.generated_cvs(created_at desc);

alter table public.generated_cvs enable row level security;

create policy "generated_cvs_select_own" on public.generated_cvs
  for select using (auth.uid() = user_id);

create policy "generated_cvs_insert_own" on public.generated_cvs
  for insert with check (auth.uid() = user_id);

create policy "generated_cvs_delete_own" on public.generated_cvs
  for delete using (auth.uid() = user_id);

-- ----- 4. Storage buckets -----
-- À créer manuellement dans Supabase Dashboard → Storage :
--   - bucket "base-cvs"        (private)
--   - bucket "generated-pdfs"  (private)
-- Puis exécuter le bloc suivant (idempotent) :

drop policy if exists "base_cvs_storage_own" on storage.objects;
drop policy if exists "generated_pdfs_storage_own" on storage.objects;

create policy "base_cvs_storage_own"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'base-cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'base-cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "generated_pdfs_storage_own"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'generated-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'generated-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
