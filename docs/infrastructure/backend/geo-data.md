# Bangladesh Geo Data

For the shop service's shipping address system, the platform maintains a static dataset of Bangladesh administrative divisions in the `bd_geo_{...}` tables.

## Tables

All tables live in `supabase/schemas/bd-geo-locations.sql`.

### `bd_geo_divisions`

8 divisions:

```sql
create table public.bd_geo_divisions (
  id bigint generated always as identity primary key,
  name text not null,
  bn_name text,
  lat double precision,
  lng double precision
);
```

### `bd_geo_districts`

64 districts:

```sql
create table public.bd_geo_districts (
  id bigint generated always as identity primary key,
  division_id bigint references public.bd_geo_divisions(id) on delete cascade,
  name text not null,
  bn_name text,
  lat double precision,
  lng double precision
);
```

### `bd_geo_upazillas`

~500 upazillas (sub-districts):

```sql
create table public.bd_geo_upazillas (
  id bigint generated always as identity primary key,
  district_id bigint references public.bd_geo_districts(id) on delete cascade,
  name text not null,
  bn_name text,
  lat double precision,
  lng double precision
);
```

### `bd_geo_unions`

~4,500 unions:

```sql
create table public.bd_geo_unions (
  id bigint generated always as identity primary key,
  upazilla_id bigint references public.bd_geo_upazillas(id) on delete cascade,
  name text not null,
  bn_name text,
  lat double precision,
  lng double precision
);
```

## Seeding

Data is seeded from JSON files in `supabase/seeds/geo-dataset/`:

- `divisions.json` — 8 divisions
- `districts.json` — 64 districts
- `upazillas.json` — ~500 upazillas
- `unions.json` — ~4,500 unions

Loaded by seed script `8.bd-geo-data.ts`.

## Data sources

Sourced from the [bd-geo](https://github.com/nuhil/bd-geo) open dataset. Division → District → Upazilla → Union hierarchy, each with English name, Bangla name (`bn_name`), and lat/lng coordinates.

## RLS

- `bd_geo_*` tables: read-only for all authenticated users, no insert/update/delete policies
- Anon access is revoked — data is loaded at build time or queried via RPCs

## Usage in Shop

The geo hierarchy is used by the shop checkout address form:
1. User selects division → fetch districts
2. User selects district → fetch upazillas
3. User selects upazilla → fetch unions
4. Full address stored as text + reference IDs on the order

## Related

- [Shop Schema](/shop-service/backend/schema) — see `shipping_address` and `billing_address` fields on orders
