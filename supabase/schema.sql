-- ============================================================
-- AEGIS (Updated Schema 2) - Supabase PostgreSQL Schema
-- Includes: Auth Profiles, Posts, Comments, Likes, Follows,
-- Roadmaps, Quizzes, Chat System, Toxicity Detection Fields,
-- Reports/Moderation System, Updated Triggers
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (Users)
-- Extends Supabase auth.users
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  handle text unique check (char_length(handle) >= 3),
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'admin', 'moderator')),
  university text,
  field_of_study text,
  reputation_score integer default 0,
  toxicity_strikes integer default 0,
  is_banned boolean default false,
  is_online boolean default false,
  last_seen timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- POSTS TABLE (Feed)
-- Includes toxicity fields for AEGIS detection
-- ============================================================
create type post_type as enum ('research', 'achievement', 'education', 'general');

create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  type post_type default 'general',
  likes_count integer default 0,
  comments_count integer default 0,

  -- AEGIS Fields
  toxicity_score float default 0.0,
  toxicity_category text,
  status text default 'allowed'
    check (status in ('allowed', 'warned', 'blocked')),
  rewritten_version text,
  is_flagged boolean default false,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on posts
alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- POST LIKES TABLE
-- ============================================================
create table public.post_likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, post_id)
);

alter table public.post_likes enable row level security;

create policy "Post likes are viewable by everyone"
  on public.post_likes for select
  using (true);

create policy "Authenticated users can like posts"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- COMMENTS TABLE
-- Includes toxicity fields for AEGIS detection
-- ============================================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,

  -- AEGIS Fields
  toxicity_score float default 0.0,
  toxicity_category text,
  status text default 'allowed'
    check (status in ('allowed', 'warned', 'blocked')),
  rewritten_version text,
  is_flagged boolean default false,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  primary key (follower_id, following_id),
  constraint cant_follow_self check (follower_id != following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Authenticated users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================
-- ROADMAPS TABLE
-- ============================================================
create table public.roadmaps (
  id text primary key,
  title text not null,
  description text,
  field text not null,
  color text,
  created_at timestamp with time zone default now()
);

alter table public.roadmaps enable row level security;

create policy "Roadmaps are viewable by everyone"
  on public.roadmaps for select
  using (true);

-- ============================================================
-- ROADMAP STEPS TABLE
-- ============================================================
create table public.roadmap_steps (
  id uuid default uuid_generate_v4() primary key,
  roadmap_id text references public.roadmaps(id) on delete cascade not null,
  title text not null,
  description text,
  step_order integer not null,
  created_at timestamp with time zone default now()
);

alter table public.roadmap_steps enable row level security;

create policy "Roadmap steps are viewable by everyone"
  on public.roadmap_steps for select
  using (true);

-- ============================================================
-- USER ROADMAP PROGRESS TABLE
-- ============================================================
create type roadmap_status as enum ('not_started', 'in_progress', 'completed');

create table public.user_roadmap_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id text references public.roadmaps(id) on delete cascade not null,
  status roadmap_status default 'not_started',
  current_step_id uuid references public.roadmap_steps(id),
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  unique(user_id, roadmap_id)
);

alter table public.user_roadmap_progress enable row level security;

create policy "Users can view their own roadmap progress"
  on public.user_roadmap_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own roadmap progress"
  on public.user_roadmap_progress for update
  using (auth.uid() = user_id);

-- ============================================================
-- QUIZZES TABLE
-- ============================================================
create type quiz_difficulty as enum ('Easy', 'Medium', 'Hard', 'Expert');

create table public.quizzes (
  id serial primary key,
  title text not null,
  description text,
  difficulty quiz_difficulty default 'Medium',
  time_limit_minutes integer,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.quizzes enable row level security;

create policy "Quizzes are viewable by everyone"
  on public.quizzes for select
  using (true);

-- ============================================================
-- QUIZ QUESTIONS TABLE
-- ============================================================
create table public.quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id integer references public.quizzes(id) on delete cascade not null,
  question_text text not null,
  options jsonb not null,
  correct_option_index integer not null,
  created_at timestamp with time zone default now()
);

alter table public.quiz_questions enable row level security;

create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (true);

-- ============================================================
-- QUIZ ATTEMPTS TABLE
-- ============================================================
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quiz_id integer references public.quizzes(id) on delete cascade not null,
  score numeric not null,
  completed_at timestamp with time zone default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can view their own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert their quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- CHAT / MESSAGING SYSTEM
-- Includes toxicity fields for AEGIS detection
-- ============================================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  is_group boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,

  -- AEGIS Fields
  toxicity_score float default 0.0,
  toxicity_category text,
  status text default 'allowed'
    check (status in ('allowed', 'warned', 'blocked')),
  rewritten_version text,
  is_flagged boolean default false,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "Participants can view conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id
      and cp.user_id = auth.uid()
    )
  );

create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id
      and cp.user_id = auth.uid()
    )
  );

-- ============================================================
-- RESUMES / CVs (Optional Module)
-- ============================================================
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'My Resume',
  file_url text,
  parsed_content jsonb,
  ats_score integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

-- ============================================================
-- REPORTS TABLE (AEGIS Moderation System)
-- Used for reporting posts/comments/messages/users
-- ============================================================
create type report_target_type as enum ('post', 'comment', 'message', 'user');

create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  status text default 'pending'
    check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.reports enable row level security;

create policy "Authenticated users can create reports"
  on public.reports for insert
  with check (auth.role() = 'authenticated');

create policy "Admins and moderators can view all reports"
  on public.reports for select
  using (
    auth.uid() in (
      select id from public.profiles
      where role in ('admin', 'moderator')
    )
  );

create policy "Admins and moderators can update reports"
  on public.reports for update
  using (
    auth.uid() in (
      select id from public.profiles
      where role in ('admin', 'moderator')
    )
  );

-- ============================================================
-- TRIGGER FUNCTION FOR UPDATED_AT AUTO UPDATE
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute procedure update_updated_at_column();

create trigger update_posts_updated_at
before update on public.posts
for each row execute procedure update_updated_at_column();

create trigger update_comments_updated_at
before update on public.comments
for each row execute procedure update_updated_at_column();

create trigger update_conversations_updated_at
before update on public.conversations
for each row execute procedure update_updated_at_column();

create trigger update_messages_updated_at
before update on public.messages
for each row execute procedure update_updated_at_column();

create trigger update_resumes_updated_at
before update on public.resumes
for each row execute procedure update_updated_at_column();

create trigger update_reports_updated_at
before update on public.reports
for each row execute procedure update_updated_at_column();

-- ============================================================
-- FUNCTION TO HANDLE NEW USER SIGNUP (Supabase Auth Hook)
-- Auto creates profile when a new auth user is created
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
