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

## RLS & Access

All geo tables are read-only for `anon` and `authenticated` roles with RLS enabled via a `public_read` policy.

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
