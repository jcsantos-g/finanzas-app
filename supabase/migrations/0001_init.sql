-- =============================================================================
-- 0001_init.sql — Esquema inicial de Finanzas Personales
-- Cómo aplicarlo: Supabase Dashboard -> SQL Editor -> pegar y ejecutar,
-- o con el CLI: `npx supabase db push`.
-- Dueño: Integrante 1. No modificar tablas sin coordinar (ver CLAUDE.md).
-- Explicación de cada decisión: docs/database.md
-- =============================================================================

-- ---------- Función para mantener updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- 1. categories ----------
create table public.categories (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name    text not null check (char_length(btrim(name)) between 1 and 60),
  type    text not null check (type in ('income', 'expense')),
  icon    text,
  -- Necesario para que otras tablas verifiquen dueño y tipo con una llave foránea compuesta.
  unique (id, user_id, type),
  unique (user_id, type, name)
);

-- ---------- 2. recurring_schedules ----------
create table public.recurring_schedules (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id     uuid not null,
  type            text not null check (type in ('income', 'expense')),
  expected_amount numeric(12, 2) not null check (expected_amount > 0),       -- RN-02
  frequency       text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  start_date      date not null,
  next_due_date   date not null,
  description     text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (next_due_date >= start_date),
  -- La categoría debe ser del mismo usuario y del mismo tipo (ingreso/gasto).
  foreign key (category_id, user_id, type)
    references public.categories (id, user_id, type),
  unique (id, user_id)
);

create trigger recurring_schedules_set_updated_at
  before update on public.recurring_schedules
  for each row execute function public.set_updated_at();

-- ---------- 3. transactions ----------
create table public.transactions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id           uuid not null,
  type                  text not null check (type in ('income', 'expense')),
  amount                numeric(12, 2) not null check (amount > 0),          -- RN-02
  occurred_at           date not null default current_date,
  description           text,
  merchant              text,
  source                text not null default 'manual' check (source in ('manual', 'recurring', 'ai')),
  recurring_schedule_id uuid,
  scheduled_date        date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- Un movimiento de origen "recurring" debe indicar de qué programación viene.
  check (source <> 'recurring' or (recurring_schedule_id is not null and scheduled_date is not null)),
  foreign key (category_id, user_id, type)
    references public.categories (id, user_id, type),
  foreign key (recurring_schedule_id, user_id)
    references public.recurring_schedules (id, user_id) on delete set null (recurring_schedule_id)
);

-- Anti-duplicados: una misma ocurrencia de un recurrente solo se puede confirmar una vez.
create unique index transactions_one_per_occurrence
  on public.transactions (recurring_schedule_id, scheduled_date)
  where recurring_schedule_id is not null and scheduled_date is not null;

-- Consultas frecuentes: listados y reportes por usuario y fecha.
create index transactions_user_date_idx on public.transactions (user_id, occurred_at desc);
create index transactions_user_type_date_idx on public.transactions (user_id, type, occurred_at desc);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ---------- 4. budgets ----------
create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id  uuid,                                                          -- NULL = presupuesto general
  amount_limit numeric(12, 2) not null check (amount_limit > 0),
  period_month date not null check (period_month = date_trunc('month', period_month)::date), -- siempre día 1
  created_at   timestamptz not null default now(),
  foreign key (category_id) references public.categories (id) on delete cascade
);

-- Un presupuesto general por mes y uno por categoría por mes.
create unique index budgets_general_per_month
  on public.budgets (user_id, period_month) where category_id is null;
create unique index budgets_category_per_month
  on public.budgets (user_id, period_month, category_id) where category_id is not null;

-- ---------- Row Level Security (RN-01, RN-14) ----------
-- Cada tabla solo permite leer/escribir filas cuyo user_id sea el del usuario autenticado.
alter table public.categories          enable row level security;
alter table public.transactions        enable row level security;
alter table public.recurring_schedules enable row level security;
alter table public.budgets             enable row level security;

create policy "categories: solo el dueño" on public.categories
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "transactions: solo el dueño" on public.transactions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "recurring_schedules: solo el dueño" on public.recurring_schedules
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "budgets: solo el dueño" on public.budgets
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------- Categorías iniciales para cada usuario nuevo ----------
create or replace function public.create_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, icon) values
    (new.id, 'Salario',        'income',  '💼'),
    (new.id, 'Negocio',        'income',  '🏪'),
    (new.id, 'Regalos',        'income',  '🎁'),
    (new.id, 'Otros ingresos', 'income',  '➕'),
    (new.id, 'Alimentación',   'expense', '🍽️'),
    (new.id, 'Transporte',     'expense', '🚌'),
    (new.id, 'Vivienda',       'expense', '🏠'),
    (new.id, 'Servicios',      'expense', '💡'),
    (new.id, 'Salud',          'expense', '🩺'),
    (new.id, 'Educación',      'expense', '📚'),
    (new.id, 'Entretenimiento','expense', '🎬'),
    (new.id, 'Otros gastos',   'expense', '➖');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_default_categories();
