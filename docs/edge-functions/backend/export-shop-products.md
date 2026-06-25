# Edge Function: `export-shop-products`

CSV export of a creator's shop products with optional filtering. Downloads the file via the browser's native download mechanism.

## Configuration

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Auth Required** | Yes |
| **Rate Limit Tier** | `strict` (2 req / 60s) |
| **Max Rows** | 10,000 |

```
withMiddleware(handler, { requireAuth: true, rateLimit: { tier: "strict" } })
```

## Request

### Headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer <supabase-jwt>` |
| `Content-Type` | Yes | `application/json` |

### Body

```json
{
  "types": ["digital", "physical"],
  "requiresShipping": true,
  "codEnabled": false,
  "lowStock": true,
  "isActive": true,
  "isFeatured": false,
  "noSales": true,
  "search": "coffee beans",
  "stockSort": "asc",
  "salesSort": "desc",
  "priceSort": "asc"
}
```

All fields are optional. Omitting a filter means "include all".

| Field | Type | Description |
|---|---|---|
| `types` | `string[]` | Filter by product type(s) |
| `requiresShipping` | `boolean` | Filter by shipping requirement |
| `codEnabled` | `boolean` | Filter by cash-on-delivery availability |
| `lowStock` | `boolean` | Filter to products below low stock threshold |
| `isActive` | `boolean` | Filter by active status |
| `isFeatured` | `boolean` | Filter by featured status |
| `noSales` | `boolean` | Filter to products with zero sales |
| `search` | `string` | Full-text search on product title |
| `stockSort` | `"asc" \| "desc"` | Sort by stock quantity |
| `salesSort` | `"asc" \| "desc"` | Sort by sales count |
| `priceSort` | `"asc" \| "desc"` | Sort by price |

## Response

### Success (200)

CSV file download with `Content-Disposition: attachment`.

```
Product ID,Title,Type,Price (BDT),Compare At (BDT),Stock,Low Stock Threshold,Sales,Active,Featured,Category,Created At
uuid-1,Specialty Coffee Beans,digital,1250.00,,150,10,42,true,false,Coffee,2026-01-15
uuid-2,Gift Box,physical,2500.00,3000.00,25,5,12,true,true,Gifts,2026-02-01
```

### Columns

| Column | Source | Description |
|---|---|---|
| `Product ID` | `id` | UUID of the product |
| `Title` | `title` | Product name |
| `Type` | `product_type` | Product type (digital / physical) |
| `Price (BDT)` | `price` | Price in Bangladeshi Taka |
| `Compare At (BDT)` | `compare_at_price` | Comparison price (if set) |
| `Stock` | `stock` | Current stock quantity |
| `Low Stock Threshold` | `low_stock_threshold` | Alert threshold |
| `Sales` | `sales_count` | Total sales count |
| `Active` | `is_active` | Whether product is active |
| `Featured` | `is_featured` | Whether product is featured |
| `Category` | `category_name` | Product category name |
| `Created At` | `created_at` | Creation timestamp |

### Errors

| Status | Condition |
|---|---|
| 400 | Invalid JSON body |
| 401 | Missing or invalid JWT |
| 429 | Rate limit exceeded |
| 500 | Database query failure or CSV generation error |

## Implementation Details

### Query Scope

The function queries `shop_products` scoped to the authenticated user (`claims.sub`):

```typescript
let query = supabaseAdmin
  .from("shop_products")
  .select("*")
  .eq("profile_id", profileId)
  .limit(10000);
```

All filters are applied conditionally — only specified filters narrow the result set.

### CSV Generation

Uses the shared `toCSV()` utility from `_shared/utils/csv.ts`:

```typescript
import { type CsvColumnMap, toCSV } from "../_shared/utils/csv.ts";

const PRODUCT_COLUMNS: CsvColumnMap<ShopProductRow> = {
  id: { header: "Product ID" },
  title: { header: "Title" },
  product_type: { header: "Type" },
  price: {
    header: "Price (BDT)",
    transform: (v) => (Number(v) / 100).toFixed(2),
  },
  // ... additional columns
};

const csv = toCSV(products, PRODUCT_COLUMNS);
return csvResponse(csv, `shop-products-${timestamp}.csv`);
```

The `CsvColumnMap` provides full type safety — TypeScript errors at compile time if a column name is incorrect.

### Response

```typescript
return csvResponse(csv, `shop-products-${Date.now()}.csv`);
```

The `csvResponse` helper sets `Content-Disposition: attachment; filename="shop-products-{timestamp}.csv"` with `Content-Type: text/csv`.

## Dependencies

- `_shared/utils/csv.ts` — generic type-safe CSV builder
- `_shared/utils/response.ts` — `csvResponse()` helper
- Supabase Admin Client — queries `shop_products` with service role, scoped to profile

## Security Notes

- **Service role client** is used to bypass RLS, but queries are manually scoped to `profile_id = claims.sub`
- **Max 10,000 rows** — prevents excessive memory usage or timeout on large shops
- **Strict rate limit** — 2 requests per 60 seconds prevents abuse
