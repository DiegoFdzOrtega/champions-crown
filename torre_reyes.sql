-- =====================================================================
-- REYES DE LA TORRE BATALLA  (pégalo entero en Supabase > SQL Editor > Run)
-- Los pisos 10, 20, 30, 40 y 50 los ocupa un jugador (su tarjeta + sus 3 Pokémon).
-- El primero que llega se queda el trono. Si otro le gana, el trono cambia cuando empieza la hora siguiente.
-- Nadie escribe en las tablas directamente: solo las dos funciones de abajo.
-- =====================================================================
create table if not exists public.tower_kings (
  floor    int primary key check (floor in (10,20,30,40,50)),
  user_id  uuid not null,
  username text not null,
  card     jsonb,
  mons     jsonb not null,
  since    timestamptz not null default now()
);
create table if not exists public.tower_claims (
  floor    int not null check (floor in (10,20,30,40,50)),
  user_id  uuid not null,
  username text not null,
  card     jsonb,
  mons     jsonb not null,
  at       timestamptz not null default now(),
  primary key (floor, user_id)
);
alter table public.tower_kings  enable row level security;
alter table public.tower_claims enable row level security;
drop policy if exists "reyes visibles" on public.tower_kings;
create policy "reyes visibles" on public.tower_kings for select to authenticated using (true);
-- (tower_claims no tiene política: nadie la lee ni la escribe desde el navegador)

-- Cambia el trono si ya empezó una hora nueva y hay un retador que le ganó al Rey: se queda el ÚLTIMO que le ganó.
create or replace function public.tower_rotate() returns void
language plpgsql security definer set search_path = public as $$
declare k record; c record;
begin
  for k in select * from tower_kings where date_trunc('hour', now()) > date_trunc('hour', since) loop
    select * into c from tower_claims where floor = k.floor and at >= k.since and user_id <> k.user_id order by at desc limit 1;
    if found then
      update tower_kings set user_id = c.user_id, username = c.username, card = c.card, mons = c.mons, since = now() where floor = k.floor;
      delete from tower_claims where floor = k.floor;
    end if;
  end loop;
end $$;

-- El juego pide los Reyes actuales (aquí se aplica el cambio de hora).
create or replace function public.tower_kings_get() returns setof public.tower_kings
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  perform tower_rotate();
  return query select * from tower_kings order by floor;
end $$;

-- Has vencido un piso de Campeón: pides el trono. Devuelve 'king' (te lo quedas ya), 'pending' (lo tendrás en la próxima hora) o 'self' (ya eres el Rey).
create or replace function public.tower_claim(p_floor int, p_card jsonb, p_mons jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text; k record;
begin
  if uid is null then raise exception 'sin sesión'; end if;
  if p_floor not in (10,20,30,40,50) then return 'bad'; end if;
  if jsonb_typeof(p_mons) <> 'array' or jsonb_array_length(p_mons) not between 1 and 3 then return 'bad'; end if;
  if p_card is not null and pg_column_size(p_card) > 6000 then return 'bad'; end if;
  select username into nm from profiles where id = uid;
  if nm is null then return 'noname'; end if;
  perform tower_rotate();
  select * into k from tower_kings where floor = p_floor;
  if not found then
    insert into tower_kings(floor, user_id, username, card, mons) values (p_floor, uid, nm, p_card, p_mons);
    return 'king';
  end if;
  if k.user_id = uid then return 'self'; end if;
  insert into tower_claims(floor, user_id, username, card, mons, at) values (p_floor, uid, nm, p_card, p_mons, now())
    on conflict (floor, user_id) do update set username = excluded.username, card = excluded.card, mons = excluded.mons, at = now();
  return 'pending';
end $$;

revoke all on function public.tower_rotate() from public, anon, authenticated;
grant execute on function public.tower_kings_get() to authenticated;
grant execute on function public.tower_claim(int, jsonb, jsonb) to authenticated;
