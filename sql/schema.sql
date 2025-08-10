-- Extensions (für gen_random_uuid)
create extension if not exists "pgcrypto";

-- Drop in definierter Reihenfolge (MVP)
drop table if exists verfuegbarkeit cascade;
drop table if exists zuweisung cascade;
drop table if exists fahrzeug cascade;
drop table if exists baustelle cascade;
drop table if exists mitarbeiter cascade;

-- Tabellen
create table mitarbeiter (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  titel text check (titel in ('Polier','Werkpolier','Vorarbeiter','Facharbeiter')) not null,
  qualifikationen text[],
  fuehrerschein boolean default true,
  erstellt_am timestamptz default now()
);

create table fahrzeug (
  id uuid primary key default gen_random_uuid(),
  kennzeichen text unique,
  sitzplaetze int check (sitzplaetze >= 1) not null,
  fahrer_id uuid null references mitarbeiter(id) on delete set null
);

create table baustelle (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ort text,
  start date,
  ende date,
  soll_besetzung jsonb
);

create table verfuegbarkeit (
  id uuid primary key default gen_random_uuid(),
  mitarbeiter_id uuid references mitarbeiter(id) on delete cascade,
  typ text check (typ in ('Urlaub','Krank','Schulung')) not null,
  von date not null,
  bis date not null,
  check (von <= bis)
);

create table zuweisung (
  id uuid primary key default gen_random_uuid(),
  baustelle_id uuid references baustelle(id) on delete cascade,
  mitarbeiter_id uuid references mitarbeiter(id) on delete cascade,
  rolle text check (rolle in ('Polier','Werkpolier','Vorarbeiter','Facharbeiter')) not null,
  von date not null,
  bis date not null,
  check (von <= bis)
);

-- Indizes
create index if not exists verf_idx on verfuegbarkeit (mitarbeiter_id, von, bis);
create index if not exists zuw_baustelle_idx on zuweisung (baustelle_id, von, bis);
create index if not exists zuw_mitarbeiter_idx on zuweisung (mitarbeiter_id, von, bis);
create index if not exists fahrer_idx on fahrzeug (fahrer_id);
