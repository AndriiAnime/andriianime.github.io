-- Apply after image-update.sql. Existing reservations keep their release tokens.
begin;

alter table wishlist_private.gifts
  add column if not exists reservation_name text
    check (pg_catalog.char_length(reservation_name) between 1 and 80);

drop function if exists public.wish_reserve(uuid, text);

create or replace function public.wish_reserve_v2(p_id uuid, p_token text, p_name text)
returns boolean language plpgsql security definer set search_path = ''
as $fn$
declare
  candidate bytea;
  -- Match the whitespace removed by the browser's String.trim().
  guest_name text := pg_catalog.btrim(p_name,
    U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
begin
  if guest_name is null or pg_catalog.char_length(guest_name) not between 1 and 80
     or guest_name ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Invalid guest name';
  end if;
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{32,128}$' then
    return false;
  end if;
  candidate := extensions.digest(p_token, 'sha256');
  update wishlist_private.gifts as g
     set reservation_hash = candidate, reservation_name = coalesce(g.reservation_name, guest_name)
   where g.id = p_id and (g.reservation_hash is null or g.reservation_hash = candidate);
  return found;
end;
$fn$;

create or replace function public.wish_release(p_id uuid, p_token text)
returns boolean language plpgsql security definer set search_path = ''
as $fn$
begin
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{32,128}$' then
    return false;
  end if;
  update wishlist_private.gifts as g
     set reservation_hash = null, reservation_name = null
   where g.id = p_id and g.reservation_hash = extensions.digest(p_token, 'sha256');
  return found;
end;
$fn$;

revoke all on function public.wish_reserve_v2(uuid, text, text),
  public.wish_release(uuid, text) from public, anon, authenticated, service_role;
grant execute on function public.wish_reserve_v2(uuid, text, text),
  public.wish_release(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
