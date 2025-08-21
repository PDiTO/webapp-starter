This is a web app starter template using

- Next.js
- Tailwind
- ShadCn & Lucide
- Clerk
- Supabase

## Initial setup

1. Create a new application in [Clerk](https://dashboard.clerk.com/apps/new)
2. Create a new project in [Supabase](https://supabase.com/dashboard/new)
3. Link Clerk to Supabase go [here](https://dashboard.clerk.com/setup/supabase)
4. Clone .sample.env to .env and populate all the required keys.

## Database setup

run the following command in Supabase SQL Editor:

```sql
create table tasks(
  id serial primary key,
  name text not null,
  user_id text not null default auth.jwt()->>'sub'
);

-- Enable RLS on the table
alter table "tasks" enable row level security;
```

Then create the following policies:

```sql
create policy "User can view their own tasks"
on "public"."tasks"
for select
to authenticated
using (
((select auth.jwt()->>'sub') = (user_id)::text)
);

create policy "Users must insert their own tasks"
on "public"."tasks"
as permissive
for insert
to authenticated
with check (
((select auth.jwt()->>'sub') = (user_id)::text)
);
```

## Running the Development Server

```bash
pnpm install
pnpm run dev
```
