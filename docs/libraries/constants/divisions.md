# Geo Data (Divisions)

Bangladesh geographical division constants and database schema for administrative regions.

## Database Schema

The geo data is organized in a hierarchical structure:

```
divisions → districts → upazillas → unions
```

### Divisions

```sql
create table divisions (
  id      integer primary key generated always as identity,
  name    text    not null,
  bn_name text    not null,
  url     text
);
```

### Districts

```sql
create table districts (
  id          integer primary key generated always as identity,
  division_id integer not null references divisions(id),
  name        text    not null,
  bn_name     text    not null,
  lat         numeric(10, 7),
  lon         numeric(10, 7),
  url         text
);
```

### Upazillas

```sql
create table upazillas (
  id          integer primary key generated always as identity,
  district_id integer not null references districts(id),
  name        text    not null,
  bn_name     text    not null,
  url         text
);
```

### Unions

```sql
create table unions (
  id          integer primary key generated always as identity,
  upazilla_id integer not null references upazillas(id),
  name        text    not null,
  bn_name     text    not null,
  url         text
);
```

## Indexes

```sql
create index idx_districts_division_id on districts(division_id);
create index idx_upazillas_district_id on upazillas(district_id);
create index idx_unions_upazilla_id on unions(upazilla_id);
```

Foreign-key columns are indexed for efficient join queries up and down the hierarchy.

## Access Control

All geo tables are read-only for unauthenticated (`anon`) and authenticated users. Write access is fully revoked.

```sql
-- Revoke all from public, anon, and authenticated
revoke all on divisions, districts, upazillas, unions from public, anon, authenticated;

-- Grant read-only
grant select on divisions, districts, upazillas, unions to anon, authenticated;
```

Row-level security (RLS) is enabled with a blanket `public_read` policy on each table:

```sql
alter table divisions  enable row level security;
alter table districts  enable row level security;
alter table upazillas  enable row level security;
alter table unions     enable row level security;

create policy "public_read" on divisions  for select to anon, authenticated using (true);
create policy "public_read" on districts  for select to anon, authenticated using (true);
create policy "public_read" on upazillas  for select to anon, authenticated using (true);
create policy "public_read" on unions     for select to anon, authenticated using (true);
```

## Constants Usage

```ts
import { divisions } from "@hobenakicoffee/libraries/constants";
```

### Values

| Name | Bangla |
| ---- | ------ |
| Chattagram | চট্টগ্রাম |
| Rajshahi | রাজশাহী |
| Khulna | খুলনা |
| Barisal | বরিশাল |
| Sylhet | সিলেট |
| Dhaka | ঢাকা |
| Rangpur | রংপুর |
| Mymensingh | ময়মনসিংহ |

### Example

```ts
import { divisions } from "@hobenakicoffee/libraries/constants";

// Get all divisions
console.log(divisions.length); // => 8

// Find a division by name
const dhaka = divisions.find((d) => d.name === "Dhaka");
// => { id: 6, name: "Dhaka", bn_name: "ঢাকা", url: "www.dhakadiv.gov.bd" }
```

## Related

- [Constants Overview](./)
