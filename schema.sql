-- ============================================
-- DROBE — Supabase Schema
-- Paste this in your Supabase SQL editor and run
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  full_name    text,
  portrait_url text,        -- Supabase Storage URL of their portrait photo
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Profile auto-created on signup"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- CLOTHING ITEMS
-- ============================================
create table public.clothing_items (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  name            text not null default 'Untitled Item',
  category        text not null check (category in ('top','bottom','dress','outerwear','shoes','accessory')),
  color           text,
  image_url       text not null,       -- original image (Supabase Storage)
  clean_image_url text,                -- bg-removed version (populated after processing)
  tags            text[] default '{}', -- e.g. ['casual','summer','work']
  brand           text,
  notes           text,
  created_at      timestamptz default now()
);

alter table public.clothing_items enable row level security;

create policy "Users manage own clothing"
  on public.clothing_items for all using (auth.uid() = user_id);

create index on public.clothing_items(user_id, category);
create index on public.clothing_items(user_id, created_at desc);


-- ============================================
-- OUTFITS
-- ============================================
create table public.outfits (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references auth.users on delete cascade not null,
  name           text not null default 'Untitled Outfit',
  occasion       text,                 -- 'casual' | 'work' | 'formal' | 'gym' etc.
  ai_preview_url text,                 -- virtual try-on result URL from Fashn.ai
  notes          text,
  is_ai_generated boolean default false,
  created_at     timestamptz default now()
);

alter table public.outfits enable row level security;

create policy "Users manage own outfits"
  on public.outfits for all using (auth.uid() = user_id);


-- ============================================
-- OUTFIT ITEMS (junction: outfit <-> clothing)
-- ============================================
create table public.outfit_items (
  id              uuid default uuid_generate_v4() primary key,
  outfit_id       uuid references public.outfits on delete cascade not null,
  clothing_item_id uuid references public.clothing_items on delete cascade not null,
  unique(outfit_id, clothing_item_id)
);

alter table public.outfit_items enable row level security;

create policy "Users manage own outfit items"
  on public.outfit_items for all
  using (
    exists (
      select 1 from public.outfits
      where id = outfit_id and user_id = auth.uid()
    )
  );


-- ============================================
-- OUTFIT SCHEDULE (calendar)
-- ============================================
create table public.outfit_schedule (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references auth.users on delete cascade not null,
  outfit_id      uuid references public.outfits on delete cascade not null,
  scheduled_date date not null,
  is_worn        boolean default false,
  created_at     timestamptz default now(),
  unique(user_id, scheduled_date)   -- one outfit per day
);

alter table public.outfit_schedule enable row level security;

create policy "Users manage own schedule"
  on public.outfit_schedule for all using (auth.uid() = user_id);

create index on public.outfit_schedule(user_id, scheduled_date);


-- ============================================
-- STORAGE BUCKETS (create these in Supabase UI)
-- ============================================
-- 1. Bucket name: "wardrobe"     → for clothing item images
-- 2. Bucket name: "portraits"    → for user portrait photos
-- 3. Bucket name: "tryon-output" → for AI try-on result images
-- All buckets: Public = false, set RLS policies per bucket
