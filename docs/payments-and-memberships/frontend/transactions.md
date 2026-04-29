# Transactions

The transaction history page shows a user's financial ledger — every payment received (credit) and sent (debit). All data is fetched via the `get_transactions_page` RPC and the stats RPCs.

---

## Data shape

```ts
interface Transaction {
  id: string
  supporter_id: string | null
  service_type: string
  metadata: Record<string, unknown>
  net_amount: number
  platform_fee: number
  status: PaymentStatus
  created_at: string
  reference_type: ReferenceType
  provider: Provider | null
  provider_transaction_id: string | null
  direction: TransactionDirection
}
```

---

## Fetching a page of transactions

Use the `get_transactions_page` RPC — never use `.from('transactions').select()` directly from the client. The RPC handles cursor pagination and correct filtering.

### First page (newest first)

```ts
const { data, error } = await supabase
  .rpc('get_transactions_page', { p_limit: 20 })

if (error) throw error
const transactions = data as Transaction[]
const hasNextPage = transactions.length === 20
```

### Next page

```ts
const lastRow = transactions[transactions.length - 1]

const { data: nextPage } = await supabase.rpc('get_transactions_page', {
  p_limit: 20,
  p_cursor_ts: lastRow.created_at,
})
```

### Filtering

```ts
// Completed credits only (earnings)
const { data } = await supabase.rpc('get_transactions_page', {
  p_limit: 20,
  p_statuses: ['completed'],
  p_reference_types: ['one-time', 'subscription'],
})

// By provider
const { data } = await supabase.rpc('get_transactions_page', {
  p_providers: ['Bkash', 'Nagad'],
})

// Date range
const { data } = await supabase.rpc('get_transactions_page', {
  p_date_from: '2026-04-01T00:00:00+06:00',
  p_date_to:   '2026-04-30T23:59:59+06:00',
})
```

### Amount-sorted page

```ts
// First page, sorted by amount descending
const { data: firstPage } = await supabase.rpc('get_transactions_page', {
  p_limit: 20,
  p_amount_sort: 'desc',
})

// Next page — need BOTH cursors
const last = firstPage![firstPage!.length - 1]
const { data: nextPage } = await supabase.rpc('get_transactions_page', {
  p_limit: 20,
  p_amount_sort: 'desc',
  p_cursor_amount: last.net_amount,
  p_cursor_ts: last.created_at,
})
```

---

## Infinite scroll with React Query

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

interface PageParams {
  cursor_ts?: string
  cursor_amount?: number
}

export function useTransactions(filters?: {
  statuses?: string[]
  referenceTypes?: string[]
  providers?: string[]
  amountSort?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}) {
  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: async ({ pageParam }: { pageParam: PageParams }) => {
      const { data, error } = await supabase.rpc('get_transactions_page', {
        p_limit: 20,
        p_amount_sort: filters?.amountSort ?? null,
        p_cursor_ts: pageParam?.cursor_ts ?? null,
        p_cursor_amount: pageParam?.cursor_amount ?? null,
        p_statuses: filters?.statuses ?? null,
        p_reference_types: filters?.referenceTypes ?? null,
        p_providers: filters?.providers ?? null,
        p_date_from: filters?.dateFrom ?? null,
        p_date_to: filters?.dateTo ?? null,
      })
      if (error) throw error
      return data as Transaction[]
    },
    initialPageParam: {} as PageParams,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 20) return undefined  // no more pages
      const last = lastPage[lastPage.length - 1]
      return {
        cursor_ts: last.created_at,
        cursor_amount: last.net_amount,
      }
    },
  })
}
```

---

## Analytics stats cards

Use the `get_transaction_stats` RPC for the four analytics cards (Earned, Spent, Pending In, Pending Out):

```ts
interface TransactionStats {
  earned_total: number
  earned_one_time: number
  earned_subscription: number
  earned_change: number      // % vs previous period

  spent_total: number
  spent_one_time: number
  spent_subscription: number
  spent_change: number

  pending_in: number
  pending_out: number
  pending_in_change: number
  pending_out_change: number
}

export async function fetchTransactionStats(
  from: Date,
  to: Date
): Promise<TransactionStats> {
  const { data, error } = await supabase.rpc('get_transaction_stats', {
    p_from: from.toISOString(),
    p_to:   to.toISOString(),
  })
  if (error) throw error
  return (data as TransactionStats[])[0]
}
```

### Displaying the change percentage

```tsx
function ChangeIndicator({ change }: { change: number }) {
  const isPositive = change >= 0
  return (
    <span style={{ color: isPositive ? 'green' : 'red' }}>
      {isPositive ? '↑' : '↓'} {Math.abs(change)}%
    </span>
  )
}
```

---

## Service breakdown card

```ts
interface ServiceBreakdown {
  service_type: string
  total_amount: number
  transaction_count: number
  percentage: number   // 0–100
}

export async function fetchServiceBreakdown(
  from: Date,
  to: Date,
  direction: 'credit' | 'debit' = 'credit'
): Promise<ServiceBreakdown[]> {
  const { data, error } = await supabase.rpc(
    'get_transaction_service_breakdown',
    {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      p_direction: direction,
    }
  )
  if (error) throw error
  return data as ServiceBreakdown[]
}
```

---

## Displaying a transaction row

```tsx
const DIRECTION_LABELS = {
  credit: 'Received',
  debit: 'Sent',
}

const SERVICE_LABELS: Record<string, string> = {
  gift: 'Coffee Gift',
  newsletter: 'Newsletter',
  withdrawal: 'Withdrawal',
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.direction === 'credit'
  const amountColor = isCredit ? 'text-green-600' : 'text-red-500'
  const sign = isCredit ? '+' : '-'

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium">
          {SERVICE_LABELS[tx.service_type] ?? tx.service_type}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(tx.created_at).toLocaleDateString()}
          {' · '}
          {tx.status}
        </p>
      </div>
      <p className={`font-semibold ${amountColor}`}>
        {sign}৳{tx.net_amount.toFixed(2)}
      </p>
    </div>
  )
}
```

---

## Date range presets

```ts
export function getDateRangePreset(preset: '7d' | '30d' | '90d' | 'all') {
  const to = new Date()
  const from = new Date()

  switch (preset) {
    case '7d':  from.setDate(to.getDate() - 7);    break
    case '30d': from.setDate(to.getDate() - 30);   break
    case '90d': from.setDate(to.getDate() - 90);   break
    case 'all': return { from: null, to: null }
  }

  return { from: from.toISOString(), to: to.toISOString() }
}
```
