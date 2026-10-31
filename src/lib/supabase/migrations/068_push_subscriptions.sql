-- One row per browser/device a user has opted into Web Push on (desktop
-- Chrome/Firefox/Edge, Android Chrome, or an iPhone that's been added to
-- the Home Screen — plain Safari tabs on iOS don't support push at all).
-- See src/lib/push.ts (the send path, via createAdminClient — service
-- role already bypasses RLS, so no extra read policy is needed here) and
-- src/app/api/push/route.ts (subscribe/unsubscribe, via the user's own
-- session) and src/components/PushOptIn.tsx (the opt-in UI).
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

create policy "Users can manage own push subscriptions"
  on push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
