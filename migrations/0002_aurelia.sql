-- Aurelia companion schema. All personal tables are scoped by user_id (text).

create table if not exists conversations (
  id          text primary key,
  user_id     text not null,
  title       text not null default 'Conversation',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  archived    boolean not null default false,
  unread      boolean not null default false
);
create index if not exists conversations_user_updated_idx
  on conversations (user_id, updated_at desc);

create table if not exists messages (
  id               text primary key,
  user_id          text not null,
  conversation_id  text not null references conversations (id) on delete cascade,
  role             text not null,
  content          text not null default '',
  created_at       timestamptz not null default now(),
  tool_name        text,
  tool_call_id     text,
  metadata         text
);
create index if not exists messages_conversation_idx
  on messages (conversation_id, created_at);
create index if not exists messages_user_idx
  on messages (user_id, created_at desc);

create table if not exists memories (
  id                      text primary key,
  user_id                 text not null,
  category                text not null,
  key                     text not null,
  value                   text not null,
  source_conversation_id  text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (user_id, category, key)
);
create index if not exists memories_user_cat_idx
  on memories (user_id, category);

create table if not exists goals (
  id                text primary key,
  user_id           text not null,
  title             text not null,
  description       text not null default '',
  status            text not null default 'active',
  cadence           text not null default 'none',
  last_progress_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists goals_user_status_idx
  on goals (user_id, status);

create table if not exists reminders (
  id          text primary key,
  user_id     text not null,
  title       text not null,
  notes       text not null default '',
  due_at      timestamptz,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists reminders_user_due_idx
  on reminders (user_id, completed, due_at);

create table if not exists proactive_events (
  id                   text primary key,
  user_id              text not null,
  conversation_id      text,
  priority             text not null,
  reason               text not null,
  message              text not null,
  notification_title   text not null default 'Aurelia',
  sent_at              timestamptz not null default now(),
  opened_at            timestamptz,
  ignored              boolean not null default false
);
create index if not exists proactive_events_user_sent_idx
  on proactive_events (user_id, sent_at desc);

create table if not exists user_settings (
  user_id                         text primary key,
  notifications_enabled           boolean not null default true,
  proactive_enabled               boolean not null default true,
  proactive_frequency             text not null default 'thoughtful',
  max_proactive_per_day           integer not null default 3,
  quiet_hours_start               text not null default '23:00',
  quiet_hours_end                 text not null default '08:00',
  allow_important_during_quiet    boolean not null default false,
  memory_enabled                  boolean not null default true,
  personality_intensity           integer not null default 70,
  notification_sound              boolean not null default true,
  theme                           text not null default 'void',
  model                           text not null default 'grok-4.5',
  timezone                        text not null default 'UTC',
  last_active_at                  timestamptz,
  last_proactive_at               timestamptz,
  updated_at                      timestamptz not null default now()
);

create table if not exists tool_calls (
  id               text primary key,
  user_id          text not null,
  conversation_id  text,
  tool_name        text not null,
  arguments        text,
  result           text,
  status           text not null,
  created_at       timestamptz not null default now()
);
create index if not exists tool_calls_user_idx
  on tool_calls (user_id, created_at desc);
