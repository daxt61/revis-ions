-- Disable RLS for all tables as requested
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  full_name text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Realtime for profiles
alter publication supabase_realtime add table profiles;

-- Create posts table
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  type text not null check (type in ('revis-ions', 'n''oublions pas')),
  subject text,
  due_date timestamp with time zone,
  images text[] default '{}'
);

-- Create comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null
);

-- Create votes table
create table votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  value integer not null check (value in (1, -1)),
  unique(user_id, post_id)
);

-- Create chat_messages table
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null
);

-- Enable Realtime for relevant tables
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table chat_messages;

-- Function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Disable RLS on all tables
alter table profiles disable row level security;
alter table posts disable row level security;
alter table comments disable row level security;
alter table votes disable row level security;
alter table chat_messages disable row level security;
