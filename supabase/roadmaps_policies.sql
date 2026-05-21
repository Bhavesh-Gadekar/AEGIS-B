-- Allow admins and moderators to manage roadmaps

-- Drop existing policies if any to avoid conflicts
drop policy if exists "Admins can insert roadmaps" on public.roadmaps;
drop policy if exists "Admins can update roadmaps" on public.roadmaps;
drop policy if exists "Admins can delete roadmaps" on public.roadmaps;

create policy "Admins can insert roadmaps"
  on public.roadmaps for insert
  with check (
    auth.uid() in (
      select id from public.profiles
      where role in ('admin', 'moderator')
    )
  );

create policy "Admins can update roadmaps"
  on public.roadmaps for update
  using (
    auth.uid() in (
      select id from public.profiles
      where role in ('admin', 'moderator')
    )
  );

create policy "Admins can delete roadmaps"
  on public.roadmaps for delete
  using (
    auth.uid() in (
      select id from public.profiles
      where role in ('admin', 'moderator')
    )
  );

-- Allow admins and moderators to manage roadmap steps

-- Drop existing policies for roadmap steps
drop policy if exists "Admins can insert roadmap steps" on public.roadmap_steps;
drop policy if exists "Admins can update roadmap steps" on public.roadmap_steps;
drop policy if exists "Admins can delete roadmap steps" on public.roadmap_steps;

create policy "Admins can insert roadmap steps"
  on public.roadmap_steps for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "Admins can update roadmap steps"
  on public.roadmap_steps for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "Admins can delete roadmap steps"
  on public.roadmap_steps for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );
