This is a full-stack web app starter template with a fully functional task management system.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful UI components
- **Lucide Icons** - Icon library
- **Clerk** - Authentication and user management
- **Supabase** - PostgreSQL database with Row Level Security

## Features

- 🔐 Secure authentication with Clerk
- ✅ Create, complete, and delete tasks
- 🎨 Beautiful UI with Shadcn components
- 🔒 Row Level Security - users can only see their own tasks
- ⚡ Real-time updates without page refresh
- 📱 Responsive design

## Initial setup

1. Create a new application in [Clerk](https://dashboard.clerk.com/apps/new)
2. Create a new project in [Supabase](https://supabase.com/dashboard/new)
3. Link Clerk to Supabase [here](https://dashboard.clerk.com/setup/supabase)
4. Clone .sample.env to .env and populate all the required keys.

## Database setup

Run the following SQL in your Supabase SQL Editor to create the tasks table with all necessary columns:

```sql
-- Create the tasks table with all required columns
create table tasks(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  completed boolean default false,
  user_id text not null default auth.jwt()->>'sub',
  created_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_created_at on tasks(created_at desc);

-- Enable RLS on the table
alter table "tasks" enable row level security;
```

Then create the following RLS policies:

```sql
-- Policy: Users can view their own tasks
create policy "User can view their own tasks"
on "public"."tasks"
for select
to authenticated
using (
  ((select auth.jwt()->>'sub') = (user_id)::text)
);

-- Policy: Users can insert their own tasks
create policy "Users must insert their own tasks"
on "public"."tasks"
as permissive
for insert
to authenticated
with check (
  ((select auth.jwt()->>'sub') = (user_id)::text)
);

-- Policy: Users can update their own tasks
create policy "Users can update their own tasks"
on "public"."tasks"
as permissive
for update
to authenticated
using (
  ((select auth.jwt()->>'sub') = (user_id)::text)
)
with check (
  ((select auth.jwt()->>'sub') = (user_id)::text)
);

-- Policy: Users can delete their own tasks
create policy "Users can delete their own tasks"
on "public"."tasks"
as permissive
for delete
to authenticated
using (
  ((select auth.jwt()->>'sub') = (user_id)::text)
);
```

## Running the Development Server

```bash
pnpm install
pnpm run dev
```
